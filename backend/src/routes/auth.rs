use actix_web::{post, web, HttpResponse, Responder};
use jsonwebtoken::{encode, EncodingKey, Header};
use log::{error, info, warn};
use std::env;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::db::mssql::{get_string, MssqlPool};
use crate::ldap::{self, LdapError, LdapUser};
use crate::models::auth::{Claims, LoginRequest, LoginResponse, UserInfo};

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(login);
}

const JWT_SECRET_ENV: &str = "JWT_SECRET";
const DEFAULT_JWT_SECRET: &str = "rm-partial-pick-remover-secret-key-change-in-production";
const TOKEN_EXPIRATION_HOURS: usize = 8;

#[post("/auth/login")]
async fn login(pool: web::Data<MssqlPool>, request: web::Json<LoginRequest>) -> impl Responder {
    let LoginRequest { username, password } = request.into_inner();

    info!("Login attempt for user: {}", username);

    // Check if it's a LOCAL user (SQL authentication)
    if username.to_uppercase().starts_with("LOCAL") {
        return handle_local_login(pool, username, password).await;
    }

    // Try LDAP authentication first
    match authenticate_ldap(&username, &password).await {
        Ok(ldap_user) => {
            info!(
                "LDAP authentication successful for user: {} (display_name: {})",
                username, ldap_user.display_name
            );
            match generate_token_with_display_name(&ldap_user.username, &ldap_user.display_name) {
                Ok(token) => HttpResponse::Ok().json(LoginResponse {
                    success: true,
                    token: Some(token),
                    user: Some(UserInfo {
                        username: ldap_user.username.clone(),
                        display_name: ldap_user.display_name.clone(),
                    }),
                    message: "Login successful".to_string(),
                }),
                Err(e) => {
                    error!("Failed to generate token: {}", e);
                    HttpResponse::InternalServerError().json(LoginResponse {
                        success: false,
                        token: None,
                        user: None,
                        message: "Failed to generate authentication token".to_string(),
                    })
                }
            }
        }
        Err(LdapError::AuthError(_)) => {
            // LDAP authentication explicitly failed (invalid credentials)
            warn!("LDAP authentication failed for user: {}", username);
            HttpResponse::Unauthorized().json(LoginResponse {
                success: false,
                token: None,
                user: None,
                message: "Invalid username or password".to_string(),
            })
        }
        Err(LdapError::UserNotFound) => {
            // User not found in LDAP - this is still an auth failure
            warn!("LDAP user not found: {}", username);
            HttpResponse::Unauthorized().json(LoginResponse {
                success: false,
                token: None,
                user: None,
                message: "Invalid username or password".to_string(),
            })
        }
        Err(e) => {
            // LDAP error (connection, configuration, timeout, etc.)
            // Fall back to SQL authentication for non-LDAP users
            error!("LDAP error for user {}: {}", username, e);
            handle_sql_fallback(pool, username, password).await
        }
    }
}

async fn handle_local_login(
    pool: web::Data<MssqlPool>,
    username: String,
    password: String,
) -> HttpResponse {
    // Use parameterized query to prevent SQL injection
    // Query tbl_user table for LOCAL authentication
    let sql = r#"
        SELECT uname, Fname, Lname, pword, auth_source
        FROM tbl_user
        WHERE uname = @P1 AND auth_source = 'LOCAL'
        "#;

    let result = pool
        .execute_query_with_params(
            sql,
            move |query| {
                query.bind(username.clone());
            },
            |row| {
                Ok((
                    get_string(row, "uname"),
                    get_string(row, "Fname"),
                    get_string(row, "Lname"),
                    get_string(row, "pword"),
                    get_string(row, "auth_source"),
                ))
            },
        )
        .await;

    match result {
        Ok(users) if !users.is_empty() => {
            let (uname, fname, lname, stored_password, auth_source) = &users[0];

            // Verify this is a LOCAL user
            if auth_source != "LOCAL" {
                return HttpResponse::Unauthorized().json(LoginResponse {
                    success: false,
                    token: None,
                    user: None,
                    message: "Invalid authentication method for this user".to_string(),
                });
            }

            // Plaintext password comparison (matches BME-Partial-Picking)
            if *stored_password != password {
                return HttpResponse::Unauthorized().json(LoginResponse {
                    success: false,
                    token: None,
                    user: None,
                    message: "Invalid username or password".to_string(),
                });
            }

            // Combine Fname and Lname for display name
            let display_name = format!("{} {}", fname, lname).trim().to_string();
            let user = UserInfo {
                username: uname.clone(),
                display_name: if display_name.is_empty() { uname.clone() } else { display_name },
            };

            match generate_token(&user.username) {
                Ok(token) => HttpResponse::Ok().json(LoginResponse {
                    success: true,
                    token: Some(token),
                    user: Some(user),
                    message: "Login successful".to_string(),
                }),
                Err(e) => {
                    error!("Failed to generate token: {}", e);
                    HttpResponse::InternalServerError().json(LoginResponse {
                        success: false,
                        token: None,
                        user: None,
                        message: "Failed to generate authentication token".to_string(),
                    })
                }
            }
        }
        Ok(_) => HttpResponse::Unauthorized().json(LoginResponse {
            success: false,
            token: None,
            user: None,
            message: "Invalid username or password".to_string(),
        }),
        Err(e) => {
            error!("Database error during local login: {}", e);
            HttpResponse::InternalServerError().json(LoginResponse {
                success: false,
                token: None,
                user: None,
                message: "Authentication error".to_string(),
            })
        }
    }
}

async fn handle_sql_fallback(
    pool: web::Data<MssqlPool>,
    username: String,
    password: String,
) -> HttpResponse {
    info!(
        "Attempting SQL fallback authentication for user: {}",
        username
    );

    // Clone username for the closure to avoid move issues
    let username_for_query = username.clone();

    // Use parameterized query to prevent SQL injection
    // Query tbl_user table - only allow LOCAL users for SQL fallback
    let sql = r#"
        SELECT uname, Fname, Lname, pword, auth_source
        FROM tbl_user
        WHERE uname = @P1
        "#;

    let result = pool
        .execute_query_with_params(
            sql,
            move |query| {
                query.bind(username_for_query);
            },
            |row| {
                Ok((
                    get_string(row, "uname"),
                    get_string(row, "Fname"),
                    get_string(row, "Lname"),
                    get_string(row, "pword"),
                    get_string(row, "auth_source"),
                ))
            },
        )
        .await;

    match result {
        Ok(users) if !users.is_empty() => {
            let (uname, fname, lname, stored_password, auth_source) = &users[0];

            // Only allow SQL fallback for LOCAL users
            // LDAP users must authenticate via LDAP
            if auth_source == "LDAP" {
                warn!(
                    "LDAP user {} attempted SQL fallback - denied",
                    username
                );
                return HttpResponse::Unauthorized().json(LoginResponse {
                    success: false,
                    token: None,
                    user: None,
                    message: "LDAP users must authenticate via LDAP".to_string(),
                });
            }

            // Only LOCAL users can use SQL fallback
            if auth_source != "LOCAL" {
                return HttpResponse::Unauthorized().json(LoginResponse {
                    success: false,
                    token: None,
                    user: None,
                    message: "Invalid authentication method for this user".to_string(),
                });
            }

            // Plaintext password comparison (matches BME-Partial-Picking)
            if *stored_password != password {
                return HttpResponse::Unauthorized().json(LoginResponse {
                    success: false,
                    token: None,
                    user: None,
                    message: "Invalid username or password".to_string(),
                });
            }

            // Combine Fname and Lname for display name
            let display_name = format!("{} {}", fname, lname).trim().to_string();
            let user = UserInfo {
                username: uname.clone(),
                display_name: if display_name.is_empty() { uname.clone() } else { display_name },
            };

            match generate_token(&user.username) {
                Ok(token) => HttpResponse::Ok().json(LoginResponse {
                    success: true,
                    token: Some(token),
                    user: Some(user),
                    message: "Login successful (SQL fallback)".to_string(),
                }),
                Err(e) => {
                    error!("Failed to generate token: {}", e);
                    HttpResponse::InternalServerError().json(LoginResponse {
                        success: false,
                        token: None,
                        user: None,
                        message: "Failed to generate authentication token".to_string(),
                    })
                }
            }
        }
        Ok(_) => HttpResponse::Unauthorized().json(LoginResponse {
            success: false,
            token: None,
            user: None,
            message: "Invalid username or password".to_string(),
        }),
        Err(e) => {
            error!("Database error during SQL fallback: {}", e);
            HttpResponse::InternalServerError().json(LoginResponse {
                success: false,
                token: None,
                user: None,
                message: "Authentication error".to_string(),
            })
        }
    }
}

/// Authenticate a user against LDAP/Active Directory
///
/// Returns the LdapUser on success, or an LdapError on failure.
/// Note: AuthError and UserNotFound are explicit authentication failures,
/// while other errors may indicate configuration or connection issues.
async fn authenticate_ldap(username: &str, password: &str) -> Result<LdapUser, LdapError> {
    ldap::authenticate(username, password).await
}

fn generate_token(username: &str) -> Result<String, jsonwebtoken::errors::Error> {
    generate_token_with_display_name(username, username)
}

fn generate_token_with_display_name(
    username: &str,
    display_name: &str,
) -> Result<String, jsonwebtoken::errors::Error> {
    let secret = env::var(JWT_SECRET_ENV).unwrap_or_else(|_| DEFAULT_JWT_SECRET.to_string());

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs() as usize;

    let exp = now + (TOKEN_EXPIRATION_HOURS * 3600);

    let claims = Claims {
        sub: username.to_string(),
        display_name: display_name.to_string(),
        exp,
        iat: now,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}
