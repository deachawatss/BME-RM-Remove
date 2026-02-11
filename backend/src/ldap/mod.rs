//! LDAP Authentication Module
//!
//! Provides LDAP/Active Directory authentication using the ldap3 crate.
//!
//! # Features
//!
//! - **TLS Support**: Full LDAPS (LDAP over TLS) support with certificate validation
//! - **Async/Await**: All operations are async for non-blocking I/O
//! - **Timeout Handling**: Configurable timeouts for all operations
//! - **Error Handling**: Comprehensive error types with `thiserror`
//! - **User Details**: Retrieves user attributes (display name, email, groups)
//!
//! # Usage
//!
//! ```rust,no_run
//! use rm_partial_pick_remover_api::ldap::{authenticate, LdapConfig, LdapClient};
//!
//! # async fn example() -> Result<(), Box<dyn std::error::Error>> {
//! // Simple authentication
//! let user = authenticate("deachawat", "password").await?;
//! println!("Welcome, {}", user.display_name);
//!
//! // Or use the client directly
//! let config = LdapConfig::from_env()?;
//! let client = LdapClient::new(config);
//! let user = client.authenticate("deachawat", "password").await?;
//! # Ok(())
//! # }
//! ```
//!
//! # Configuration
//!
//! Configuration is loaded from environment variables:
//!
//! | Variable | Description | Default |
//! |----------|-------------|---------|
//! | `LDAP_URL` | LDAP server URL | `ldaps://ldap.nwfth.com:636` |
//! | `LDAP_DOMAIN` | Domain for UPN format | `NWFTH.com` |
//! | `LDAP_BASE_DN` | Base DN for searches | `DC=NWFTH,DC=com` |
//! | `LDAP_TIMEOUT_SECS` | Connection timeout | `5` |
//! | `LDAP_VERIFY_CERTS` | Verify TLS certificates | `true` |
//! | `LDAP_USER_FILTER` | Search filter template | `(sAMAccountName={})` |

use log::error;

pub mod client;
pub mod config;
pub mod error;
pub mod user;

// Re-export commonly used types
pub use client::LdapClient;
pub use config::LdapConfig;
pub use error::{LdapError, LdapResult};
pub use user::LdapUser;

/// Authenticate a user against LDAP/Active Directory
///
/// This is the high-level convenience function for LDAP authentication.
/// It loads configuration from environment variables and performs
/// the authentication.
///
/// # Arguments
///
/// * `username` - The username (sAMAccountName or UPN format like `user@domain.com`)
/// * `password` - The user's password
///
/// # Returns
///
/// Returns `Ok(LdapUser)` on successful authentication containing user details,
/// or an `LdapError` if authentication fails.
///
/// # Errors
///
/// * `LdapError::ConfigError` - Required environment variables missing or invalid
/// * `LdapError::ConnectionError` - Failed to connect to LDAP server
/// * `LdapError::AuthError` - Invalid credentials
/// * `LdapError::UserNotFound` - User authenticated but not found in directory
/// * `LdapError::TimeoutError` - Operation exceeded timeout
///
/// # Examples
///
/// ```rust,no_run
/// use rm_partial_pick_remover_api::ldap::authenticate;
///
/// # async fn example() {
/// match authenticate("deachawat", "password123").await {
///     Ok(user) => {
///         println!("Welcome, {}!", user.display_name);
///         if let Some(email) = &user.email {
///             println!("Email: {}", email);
///         }
///     }
///     Err(e) => {
///         println!("Authentication failed: {}", e);
///     }
/// }
/// # }
/// ```
///
/// # Security Notes
///
/// - Always use LDAPS (ldaps://) in production
/// - Keep TLS certificate validation enabled (default)
/// - Never log passwords
/// - Use strong service account passwords if using bind DN
pub async fn authenticate(username: &str, password: &str) -> LdapResult<LdapUser> {
    let config = LdapConfig::from_env().map_err(|e| {
        error!("Failed to load LDAP configuration: {}", e);
        e
    })?;

    let client = LdapClient::new(config);
    client.authenticate(username, password).await
}
