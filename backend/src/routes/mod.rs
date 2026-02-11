use actix_web::{get, web, HttpResponse, Responder};
use serde_json::json;

pub mod auth;
pub mod rm;

#[get("/")]
async fn root() -> impl Responder {
    HttpResponse::Ok().json(json!({
        "status": "ok",
        "service": "rm-partial-pick-remover-api",
        "version": "0.1.0",
        "endpoints": {
            "health": "/api/health",
            "auth": "/api/auth/login",
            "rm_search": "/api/rm/search?runno={runno}",
            "rm_remove": "/api/rm/remove"
        }
    }))
}

#[get("/health")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(json!({
        "status": "healthy",
        "service": "rm-partial-pick-remover-api"
    }))
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(root)
        .service(
            web::scope("/api")
                .configure(rm::config)
                .configure(auth::config)
                .service(health_check),
        );
}
