use actix_cors::Cors;
use actix_web::{middleware, web, App, HttpServer};
use dotenv::dotenv;
use log::info;
use std::env;

mod db;
mod ldap;
mod models;
mod routes;

use db::mssql::MssqlPool;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let server_port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("SERVER_PORT must be a valid port number");

    info!(
        "Starting RM Partial Pick Remover API server on port {}",
        server_port
    );

    // Initialize MSSQL connection pool
    let db_pool = MssqlPool::new()
        .await
        .expect("Failed to create MSSQL connection pool");

    info!("MSSQL connection pool initialized successfully");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .app_data(web::Data::new(db_pool.clone()))
            .configure(routes::config)
    })
    .bind(format!("0.0.0.0:{}", server_port))?
    .run()
    .await
}
