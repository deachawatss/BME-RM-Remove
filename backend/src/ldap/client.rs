//! LDAP Client
//!
//! Provides a high-level async LDAP client with connection pooling support
//! and comprehensive error handling for Active Directory authentication.

use ldap3::{Ldap, LdapConnAsync, Scope, SearchEntry};
use log::{debug, error, info, warn};
use tokio::time::timeout;
use url::Url;

use crate::ldap::config::LdapConfig;
use crate::ldap::error::{LdapError, LdapResult};
use crate::ldap::user::LdapUser;

/// High-level LDAP client for authentication operations
#[derive(Debug)]
pub struct LdapClient {
    config: LdapConfig,
}

impl LdapClient {
    /// Create a new LDAP client with the given configuration
    pub fn new(config: LdapConfig) -> Self {
        Self { config }
    }

    /// Authenticate a user against LDAP/Active Directory
    ///
    /// # Arguments
    ///
    /// * `username` - The username (sAMAccountName or UPN format)
    /// * `password` - The user's password (will be securely handled)
    ///
    /// # Returns
    ///
    /// Returns `Ok(LdapUser)` on successful authentication, or an `LdapError`
    /// if authentication fails.
    ///
    /// # Errors
    ///
    /// * `LdapError::ConnectionError` - Failed to connect to LDAP server
    /// * `LdapError::AuthError` - Invalid credentials
    /// * `LdapError::UserNotFound` - User not found in directory
    /// * `LdapError::TimeoutError` - Operation timed out
    ///
    /// # Examples
    ///
    /// ```rust,no_run
    /// use crate::ldap::{LdapClient, LdapConfig};
    ///
    /// # async fn example() -> Result<(), Box<dyn std::error::Error>> {
    /// let config = LdapConfig::from_env()?;
    /// let client = LdapClient::new(config);
    ///
    /// match client.authenticate("deachawat", "password").await {
    ///     Ok(user) => println!("Welcome, {}", user.display_name),
    ///     Err(e) => println!("Authentication failed: {}", e),
    /// }
    /// # Ok(())
    /// # }
    /// ```
    pub async fn authenticate(&self, username: &str, password: &str) -> LdapResult<LdapUser> {
        let upn = self.config.build_upn(username);
        let clean_username = self.config.extract_username(username);

        info!(
            "Attempting LDAP authentication for user: {} (UPN: {})",
            clean_username, upn
        );

        // Connect to LDAP server with timeout
        let mut ldap = self.connect().await.map_err(|e| {
            error!("Failed to connect to LDAP server {}: {}", self.config.url, e);
            e
        })?;

        debug!("Connected to LDAP server: {}", self.config.url);

        // Attempt bind with user credentials
        // This is the actual authentication step - if bind succeeds, credentials are valid
        let bind_result = self.bind_with_timeout(&mut ldap, &upn, password).await;

        match bind_result {
            Ok(_) => {
                info!("LDAP bind successful for user: {}", clean_username);

                // Bind succeeded, now retrieve user details
                let user = self.search_user_details(&mut ldap, &clean_username).await?;

                // Unbind (clean disconnect)
                let _ = ldap.unbind().await;

                Ok(user)
            }
            Err(e) => {
                // Unbind even on failure (clean disconnect)
                let _ = ldap.unbind().await;

                // Check if this is an authentication failure or a connection issue
                match &e {
                    LdapError::BindError(_) | LdapError::AuthError(_) => {
                        warn!("LDAP authentication failed for user {}: {}", clean_username, e);
                        Err(LdapError::AuthError(
                            "Invalid username or password".to_string()
                        ))
                    }
                    _ => {
                        error!("LDAP error during bind for user {}: {}", clean_username, e);
                        Err(e)
                    }
                }
            }
        }
    }

    /// Connect to the LDAP server
    pub async fn connect(&self) -> LdapResult<Ldap> {
        debug!(
            "Connecting to LDAP server: {} (verify_certs: {})",
            self.config.url, self.config.verify_certs
        );

        // Parse the URL
        let url = Url::parse(&self.config.url).map_err(|e| {
            LdapError::ConfigError(format!("Invalid LDAP URL: {}", e))
        })?;

        let connect_future = LdapConnAsync::from_url(&url);

        let (conn, ldap) = match timeout(self.config.timeout, connect_future).await {
            Ok(Ok(result)) => result,
            Ok(Err(e)) => {
                return Err(LdapError::ConnectionError(format!(
                    "Failed to establish LDAP connection: {}",
                    e
                )))
            }
            Err(_) => {
                return Err(LdapError::TimeoutError(self.config.timeout));
            }
        };

        // Spawn the connection handler
        tokio::spawn(async move {
            if let Err(e) = conn.drive().await {
                error!("LDAP connection error: {}", e);
            }
        });

        Ok(ldap)
    }

    /// Bind to LDAP with credentials (this performs the authentication)
    async fn bind_with_timeout(
        &self,
        ldap: &mut Ldap,
        dn: &str,
        password: &str,
    ) -> LdapResult<()> {
        debug!("Attempting LDAP bind for DN: {}", dn);

        let bind_future = ldap.simple_bind(dn, password);

        let result = match timeout(self.config.timeout, bind_future).await {
            Ok(Ok(result)) => result,
            Ok(Err(e)) => return Err(LdapError::BindError(e.to_string())),
            Err(_) => return Err(LdapError::TimeoutError(self.config.timeout)),
        };

        match result.success() {
            Ok(_) => Ok(()),
            Err(e) => {
                let error_msg = format!("Bind failed: {:?}", e);
                Err(LdapError::AuthError(error_msg))
            }
        }
    }

    /// Search for user details after successful authentication
    async fn search_user_details(
        &self,
        ldap: &mut Ldap,
        username: &str,
    ) -> LdapResult<LdapUser> {
        let filter = self.config.build_search_filter(username);

        debug!(
            "Searching for user details: {} with filter: {}",
            username, filter
        );

        let search_future = ldap.search(
            &self.config.base_dn,
            Scope::Subtree,
            &filter,
            vec!["sAMAccountName", "displayName", "mail", "cn", "givenName", "sn"],
        );

        let result = match timeout(self.config.timeout, search_future).await {
            Ok(Ok(result)) => result,
            Ok(Err(e)) => return Err(LdapError::SearchError(e.to_string())),
            Err(_) => return Err(LdapError::TimeoutError(self.config.timeout)),
        };

        let (entries, _) = result.success().map_err(|e| {
            LdapError::SearchError(format!("Search failed: {:?}", e))
        })?;

        if entries.is_empty() {
            warn!("User {} not found in LDAP after successful bind", username);
            return Err(LdapError::UserNotFound);
        }

        // Parse the first entry
        let entry = SearchEntry::construct(entries.into_iter().next().unwrap());

        let user = LdapUser::from_search_entry(entry, username.to_string());

        info!(
            "Successfully retrieved LDAP details for user: {} (display_name: {})",
            username, user.display_name
        );

        Ok(user)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Note: These tests require a running LDAP server
    // They're marked as ignored by default

    #[tokio::test]
    #[ignore = "Requires LDAP server"]
    async fn test_connect() {
        let config = LdapConfig::from_env().unwrap();
        let client = LdapClient::new(config);

        // This will fail if no LDAP server is available
        let result = client.connect().await;
        // We can't assert success without a real LDAP server
        println!("Connect result: {:?}", result);
    }
}
