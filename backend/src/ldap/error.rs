//! LDAP Error Types
//!
//! Defines comprehensive error types for LDAP operations following Rust best practices.
//! Uses `thiserror` for ergonomic error handling with proper error messages.

use thiserror::Error;

/// Errors that can occur during LDAP operations
#[derive(Error, Debug)]
pub enum LdapError {
    /// Configuration is missing or invalid
    #[error("Configuration error: {0}")]
    ConfigError(String),

    /// Failed to establish connection to LDAP server
    #[error("Connection failed: {0}")]
    ConnectionError(String),

    /// Authentication failed (invalid credentials)
    #[error("Authentication failed: {0}")]
    AuthError(String),

    /// User not found in directory
    #[error("User not found")]
    UserNotFound,

    /// Search operation failed
    #[error("Search failed: {0}")]
    SearchError(String),

    /// Bind operation failed
    #[error("Bind failed: {0}")]
    BindError(String),

    /// Timeout during LDAP operation
    #[error("Operation timed out after {0:?}")]
    TimeoutError(std::time::Duration),

    /// IO error during LDAP operation
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

/// Result type alias for LDAP operations
pub type LdapResult<T> = Result<T, LdapError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_display() {
        let err = LdapError::ConfigError("missing URL".to_string());
        assert_eq!(err.to_string(), "Configuration error: missing URL");

        let err = LdapError::AuthError("invalid password".to_string());
        assert_eq!(err.to_string(), "Authentication failed: invalid password");

        let err = LdapError::UserNotFound;
        assert_eq!(err.to_string(), "User not found");
    }
}
