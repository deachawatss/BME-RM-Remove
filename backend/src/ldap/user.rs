//! LDAP User Model
//!
//! Represents a user authenticated via LDAP/Active Directory.
//! Contains user attributes commonly available in AD.

use ldap3::SearchEntry;

/// User information retrieved from LDAP/Active Directory
#[derive(Debug, Clone)]
pub struct LdapUser {
    /// Username (sAMAccountName)
    pub username: String,

    /// Display name (displayName or cn)
    pub display_name: String,
}

impl LdapUser {
    /// Build an LdapUser from an LDAP SearchEntry
    pub fn from_search_entry(entry: SearchEntry, fallback_username: String) -> Self {
        let attrs = &entry.attrs;

        // Extract username (sAMAccountName)
        let username = attrs
            .get("sAMAccountName")
            .and_then(|v| v.first())
            .cloned()
            .unwrap_or_else(|| fallback_username.clone());

        // Extract display name - prefer displayName, fall back to cn
        let display_name = attrs
            .get("displayName")
            .and_then(|v| v.first())
            .cloned()
            .or_else(|| {
                attrs
                    .get("cn")
                    .and_then(|v| v.first())
                    .cloned()
            })
            .or_else(|| {
                // Build from givenName + sn
                let first = attrs.get("givenName").and_then(|v| v.first());
                let last = attrs.get("sn").and_then(|v| v.first());
                match (first, last) {
                    (Some(f), Some(l)) => Some(format!("{} {}", f, l)),
                    (Some(f), None) => Some(f.clone()),
                    (None, Some(l)) => Some(l.clone()),
                    (None, None) => None,
                }
            })
            .unwrap_or_else(|| fallback_username.clone());

        Self {
            username,
            display_name,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ldap3::SearchEntry;
    use std::collections::HashMap;

    fn create_test_entry() -> SearchEntry {
        let mut attrs = HashMap::new();
        attrs.insert("sAMAccountName".to_string(), vec!["johndoe".to_string()]);
        attrs.insert("displayName".to_string(), vec!["John Doe".to_string()]);
        attrs.insert("givenName".to_string(), vec!["John".to_string()]);
        attrs.insert("sn".to_string(), vec!["Doe".to_string()]);

        SearchEntry {
            dn: "CN=John Doe,DC=example,DC=com".to_string(),
            attrs,
            bin_attrs: Default::default(),
        }
    }

    #[test]
    fn test_from_search_entry() {
        let entry = create_test_entry();
        let user = LdapUser::from_search_entry(entry, "fallback".to_string());

        assert_eq!(user.username, "johndoe");
        assert_eq!(user.display_name, "John Doe");
    }

    #[test]
    fn test_from_search_entry_fallback_display_name() {
        // Test when displayName is missing but cn is present
        let mut attrs = HashMap::new();
        attrs.insert("sAMAccountName".to_string(), vec!["johndoe".to_string()]);
        attrs.insert("cn".to_string(), vec!["John Doe".to_string()]);

        let entry = SearchEntry {
            dn: "CN=John Doe,DC=example,DC=com".to_string(),
            attrs,
            bin_attrs: Default::default(),
        };

        let user = LdapUser::from_search_entry(entry, "fallback".to_string());
        assert_eq!(user.display_name, "John Doe");
    }

    #[test]
    fn test_from_search_entry_fallback_to_names() {
        // Test when displayName and cn are missing, builds from givenName + sn
        let mut attrs = HashMap::new();
        attrs.insert("sAMAccountName".to_string(), vec!["johndoe".to_string()]);
        attrs.insert("givenName".to_string(), vec!["John".to_string()]);
        attrs.insert("sn".to_string(), vec!["Doe".to_string()]);

        let entry = SearchEntry {
            dn: "CN=John Doe,DC=example,DC=com".to_string(),
            attrs,
            bin_attrs: Default::default(),
        };

        let user = LdapUser::from_search_entry(entry, "fallback".to_string());
        assert_eq!(user.display_name, "John Doe");
    }

    #[test]
    fn test_from_search_entry_fallback_username() {
        // Test when all else fails, uses fallback username
        let mut attrs = HashMap::new();
        attrs.insert("sAMAccountName".to_string(), vec!["johndoe".to_string()]);

        let entry = SearchEntry {
            dn: "CN=John Doe,DC=example,DC=com".to_string(),
            attrs,
            bin_attrs: Default::default(),
        };

        let user = LdapUser::from_search_entry(entry, "fallback".to_string());
        assert_eq!(user.username, "johndoe");
        assert_eq!(user.display_name, "fallback"); // Falls back to passed username
    }
}
