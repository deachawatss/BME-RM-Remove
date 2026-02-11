use actix_web::{post, web, HttpResponse, Responder};
use jsonwebtoken::{encode, EncodingKey, Header};
use log::{error, info, warn};
use std::env;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::db::mssql::{get_string, MssqlPool};
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
        Ok(true) => {
            info!("LDAP authentication successful for user: {}", username);
            let display_name = username.clone();
            match generate_token(&username) {
                Ok(token) => HttpResponse::Ok().json(LoginResponse {
                    success: true,
                    token: Some(token),
                    user: Some(UserInfo {
                        username: username.clone(),
                        display_name,
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
        Ok(false) => {
            warn!("LDAP authentication failed for user: {}", username);
            HttpResponse::Unauthorized().json(LoginResponse {
                success: false,
                token: None,
                user: None,
                message: "Invalid username or password".to_string(),
            })
        }
        Err(e) => {
            error!("LDAP error for user {}: {}", username, e);
            // Fall back to SQL authentication
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
    // TODO: Implement bcrypt password hashing in production
    let sql = r#"
        SELECT UserLogon, UserName, Password
        FROM Users
        WHERE UserLogon = @P1 AND Active = 1
        "#;

    let result = pool
        .execute_query_with_params(
            sql,
            move |query| {
                query.bind(username.clone());
            },
            |row| {
                Ok((
                    get_string(row, "UserLogon"),
                    get_string(row, "UserName"),
                    get_string(row, "Password"),
                ))
            },
        )
        .await;

    match result {
        Ok(users) if !users.is_empty() => {
            let (user_logon, user_name, stored_password) = &users[0];
            // TODO: Use bcrypt::verify in production for secure password comparison
            if *stored_password != password {
                return HttpResponse::Unauthorized().json(LoginResponse {
                    success: false,
                    token: None,
                    user: None,
                    message: "Invalid username or password".to_string(),
                });
            }
            let user = UserInfo {
                username: user_logon.clone(),
                display_name: user_name.clone(),
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

    // Use parameterized query to prevent SQL injection
    // TODO: Implement bcrypt password hashing in production
    let sql = r#"
        SELECT UserLogon, UserName, Password
        FROM Users
        WHERE UserLogon = @P1 AND Active = 1
        "#;

    let result = pool
        .execute_query_with_params(
            sql,
            move |query| {
                query.bind(username.clone());
            },
            |row| {
                Ok((
                    get_string(row, "UserLogon"),
                    get_string(row, "UserName"),
                    get_string(row, "Password"),
                ))
            },
        )
        .await;

    match result {
        Ok(users) if !users.is_empty() => {
            let (user_logon, user_name, stored_password) = &users[0];
            // TODO: Use bcrypt::verify in production for secure password comparison
            if *stored_password != password {
                return HttpResponse::Unauthorized().json(LoginResponse {
                    success: false,
                    token: None,
                    user: None,
                    message: "Invalid username or password".to_string(),
                });
            }
            let user = UserInfo {
                username: user_logon.clone(),
                display_name: user_name.clone(),
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

async fn authenticate_ldap(
    username: &str,
    _password: &str,
) -> Result<bool, Box<dyn std::error::Error>> {
    let ldap_url =
        env::var("LDAP_URL").unwrap_or_else(|_| "ldaps://ldap.nwfth.com:636".to_string());
    let _base_dn = env::var("LDAP_BASE_DN").unwrap_or_else(|_| "DC=NWFTH,DC=com".to_string());
    let domain = env::var("LDAP_DOMAIN").unwrap_or_else(|_| "NWFTH.com".to_string());
    let _timeout_secs = env::var("LDAP_TIMEOUT_SECS")
        .unwrap_or_else(|_| "5".to_string())
        .parse::<u64>()?;

    // Build user principal name
    let user_principal = if username.contains('@') {
        username.to_string()
    } else {
        format!("{}@{}", username, domain)
    };

    // For now, return false to trigger SQL fallback
    // In production, this would connect to LDAP and authenticate
    info!(
        "LDAP authentication not fully implemented, would authenticate: {} at {}",
        user_principal, ldap_url
    );

    // Placeholder: In production, implement actual LDAP bind
    // This is a simplified version - real implementation would use ldap3 crate
    Ok(false)
}

fn generate_token(username: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let secret = env::var(JWT_SECRET_ENV).unwrap_or_else(|_| DEFAULT_JWT_SECRET.to_string());

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs() as usize;

    let exp = now + (TOKEN_EXPIRATION_HOURS * 3600);

    let claims = Claims {
        sub: username.to_string(),
        exp,
        iat: now,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}
