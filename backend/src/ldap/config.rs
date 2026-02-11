//! LDAP Configuration
//!
//! Loads LDAP configuration from environment variables with sensible defaults.
//! All timeouts and connection settings are configurable.

use std::env;
use std::time::Duration;

use crate::ldap::error::{LdapError, LdapResult};

/// LDAP configuration loaded from environment variables
#[derive(Debug, Clone)]
pub struct LdapConfig {
    /// LDAP server URL (e.g., ldaps://ldap.example.com:636)
    pub url: String,

    /// Domain for UPN format (e.g., NWFTH.com)
    pub domain: String,

    /// Base DN for searches (e.g., DC=NWFTH,DC=com)
    pub base_dn: String,

    /// Connection timeout
    pub timeout: Duration,

    /// Whether to verify TLS certificates (disable only for testing)
    pub verify_certs: bool,

    /// User search filter template (e.g., "(sAMAccountName={})")
    pub user_filter: String,
}

impl LdapConfig {
    /// Environment variable names
    const ENV_URL: &'static str = "LDAP_URL";
    const ENV_DOMAIN: &'static str = "LDAP_DOMAIN";
    const ENV_BASE_DN: &'static str = "LDAP_BASE_DN";
    const ENV_TIMEOUT_SECS: &'static str = "LDAP_TIMEOUT_SECS";
    const ENV_VERIFY_CERTS: &'static str = "LDAP_VERIFY_CERTS";
    const ENV_USER_FILTER: &'static str = "LDAP_USER_FILTER";

    /// Default values
    const DEFAULT_URL: &'static str = "ldaps://ldap.nwfth.com:636";
    const DEFAULT_DOMAIN: &'static str = "NWFTH.com";
    const DEFAULT_BASE_DN: &'static str = "DC=NWFTH,DC=com";
    const DEFAULT_TIMEOUT_SECS: u64 = 5;
    const DEFAULT_USER_FILTER: &'static str = "(sAMAccountName={})";

    /// Load configuration from environment variables
    ///
    /// # Errors
    ///
    /// Returns `LdapError::ConfigError` if required configuration is missing
    /// or if timeout parsing fails.
    ///
    /// # Examples
    ///
    /// ```rust,no_run
    /// use std::env;
    ///
    /// env::set_var("LDAP_URL", "ldaps://ldap.company.com:636");
    /// env::set_var("LDAP_DOMAIN", "COMPANY.com");
    ///
    /// // Then in your code:
    /// // let config = LdapConfig::from_env()?;
    /// ```
    pub fn from_env() -> LdapResult<Self> {
        let url = env::var(Self::ENV_URL)
            .unwrap_or_else(|_| Self::DEFAULT_URL.to_string());

        let domain = env::var(Self::ENV_DOMAIN)
            .unwrap_or_else(|_| Self::DEFAULT_DOMAIN.to_string());

        let base_dn = env::var(Self::ENV_BASE_DN)
            .unwrap_or_else(|_| Self::DEFAULT_BASE_DN.to_string());

        let timeout_secs = env::var(Self::ENV_TIMEOUT_SECS)
            .ok()
            .and_then(|s| s.parse::<u64>().ok())
            .unwrap_or(Self::DEFAULT_TIMEOUT_SECS);

        let timeout = Duration::from_secs(timeout_secs);

        let verify_certs = env::var(Self::ENV_VERIFY_CERTS)
            .ok()
            .map(|s| s.to_lowercase() != "false")
            .unwrap_or(true);

        let user_filter = env::var(Self::ENV_USER_FILTER)
            .unwrap_or_else(|_| Self::DEFAULT_USER_FILTER.to_string());

        // Validate configuration
        if !url.starts_with("ldap://") && !url.starts_with("ldaps://") {
            return Err(LdapError::ConfigError(
                format!("LDAP_URL must start with ldap:// or ldaps://, got: {}", url)
            ));
        }

        Ok(Self {
            url,
            domain,
            base_dn,
            timeout,
            verify_certs,
            user_filter,
        })
    }

    /// Build User Principal Name (UPN) from username
    ///
    /// If username already contains '@', it's returned as-is.
    /// Otherwise, the domain is appended.
    ///
    /// # Examples
    ///
    /// ```rust
    /// use crate::ldap::config::LdapConfig;
    ///
    /// let config = LdapConfig {
    ///     url: "ldaps://test".to_string(),
    ///     domain: "NWFTH.com".to_string(),
    ///     base_dn: "DC=NWFTH,DC=com".to_string(),
    ///     timeout: std::time::Duration::from_secs(5),
    ///     verify_certs: true,
    ///     user_filter: "(sAMAccountName={})".to_string(),
    /// };
    ///
    /// assert_eq!(config.build_upn("deachawat"), "deachawat@NWFTH.com");
    /// assert_eq!(config.build_upn("deachawat@NWFTH.com"), "deachawat@NWFTH.com");
    /// ```
    pub fn build_upn(&self, username: &str) -> String {
        if username.contains('@') {
            username.to_string()
        } else {
            format!("{}@{}", username, self.domain)
        }
    }

    /// Get the username part from a potentially full UPN
    ///
    /// # Examples
    ///
    /// ```rust
    /// use crate::ldap::config::LdapConfig;
    ///
    /// let config = LdapConfig {
    ///     url: "ldaps://test".to_string(),
    ///     domain: "NWFTH.com".to_string(),
    ///     base_dn: "DC=NWFTH,DC=com".to_string(),
    ///     timeout: std::time::Duration::from_secs(5),
    ///     verify_certs: true,
    ///     user_filter: "(sAMAccountName={})".to_string(),
    /// };
    ///
    /// assert_eq!(config.extract_username("deachawat@NWFTH.com"), "deachawat");
    /// assert_eq!(config.extract_username("deachawat"), "deachawat");
    /// ```
    pub fn extract_username(&self, upn: &str) -> String {
        upn.split('@')
            .next()
            .unwrap_or(upn)
            .to_string()
    }

    /// Build search filter for finding a user
    pub fn build_search_filter(&self, username: &str) -> String {
        let clean_username = self.extract_username(username);
        self.user_filter.replace("{}", &clean_username)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_upn() {
        let config = LdapConfig {
            url: "ldaps://test".to_string(),
            domain: "NWFTH.com".to_string(),
            base_dn: "DC=NWFTH,DC=com".to_string(),
            timeout: Duration::from_secs(5),
            verify_certs: true,
            user_filter: "(sAMAccountName={})".to_string(),
        };

        assert_eq!(config.build_upn("deachawat"), "deachawat@NWFTH.com");
        assert_eq!(config.build_upn("deachawat@NWFTH.com"), "deachawat@NWFTH.com");
        assert_eq!(config.build_upn("user@OTHER.com"), "user@OTHER.com");
    }

    #[test]
    fn test_extract_username() {
        let config = LdapConfig {
            url: "ldaps://test".to_string(),
            domain: "NWFTH.com".to_string(),
            base_dn: "DC=NWFTH,DC=com".to_string(),
            timeout: Duration::from_secs(5),
            verify_certs: true,
            user_filter: "(sAMAccountName={})".to_string(),
        };

        assert_eq!(config.extract_username("deachawat@NWFTH.com"), "deachawat");
        assert_eq!(config.extract_username("deachawat"), "deachawat");
    }

    #[test]
    fn test_build_search_filter() {
        let config = LdapConfig {
            url: "ldaps://test".to_string(),
            domain: "NWFTH.com".to_string(),
            base_dn: "DC=NWFTH,DC=com".to_string(),
            timeout: Duration::from_secs(5),
            verify_certs: true,
            user_filter: "(sAMAccountName={})".to_string(),
        };

        assert_eq!(config.build_search_filter("deachawat"), "(sAMAccountName=deachawat)");
        assert_eq!(config.build_search_filter("deachawat@NWFTH.com"), "(sAMAccountName=deachawat)");
    }
}
