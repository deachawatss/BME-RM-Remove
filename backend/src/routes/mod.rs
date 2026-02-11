use actix_web::{get, web, HttpResponse, Responder};
use serde_json::json;

pub mod auth;
pub mod rm;

#[get("/health")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(json!({
        "status": "healthy",
        "service": "rm-partial-pick-remover-api"
    }))
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .configure(rm::config)
            .configure(auth::config)
            .service(health_check)
    );
}
