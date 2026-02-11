use anyhow::{Context, Result};
use log::info;
use std::env;
use tiberius::{AuthMethod, Client, Config, Query, Row};
use tokio::net::TcpStream;
use tokio_util::compat::{Compat, TokioAsyncWriteCompatExt};

pub type DbClient = Client<Compat<TcpStream>>;

#[derive(Clone)]
pub struct MssqlPool {
    config: Config,
    host: String,
}

impl MssqlPool {
    pub async fn new() -> Result<Self> {
        let server = env::var("DB_SERVER").context("DB_SERVER not set")?;
        let database = env::var("DB_DATABASE").context("DB_DATABASE not set")?;
        let username = env::var("DB_USERNAME").context("DB_USERNAME not set")?;
        let password = env::var("DB_PASSWORD").context("DB_PASSWORD not set")?;

        let mut config = Config::new();
        config.host(&server);
        config.database(database);
        config.authentication(AuthMethod::sql_server(username, password));
        config.trust_cert();

        info!("MSSQL configuration initialized for server: {}", server);

        Ok(MssqlPool {
            config,
            host: server,
        })
    }

    pub async fn get_client(&self) -> Result<DbClient> {
        let tcp = TcpStream::connect(format!("{}:1433", self.host))
            .await
            .context("Failed to connect to MSSQL server")?;

        tcp.set_nodelay(true)?;

        let client = Client::connect(self.config.clone(), tcp.compat_write())
            .await
            .context("Failed to authenticate with MSSQL server")?;

        Ok(client)
    }

    pub async fn execute_query<T, F>(&self, query_str: &str, mapper: F) -> Result<Vec<T>>
    where
        F: Fn(&Row) -> Result<T>,
    {
        let mut client = self.get_client().await?;
        let query = Query::new(query_str);

        let stream = query.query(&mut client).await?;
        let rows = stream.into_first_result().await?;

        let results: Result<Vec<T>> = rows.iter().map(mapper).collect();
        results
    }

    pub async fn execute_query_with_params<T, F>(
        &self,
        query_str: &str,
        bind_fn: impl FnOnce(&mut Query<'_>),
        mapper: F,
    ) -> Result<Vec<T>>
    where
        F: Fn(&Row) -> Result<T>,
    {
        let mut client = self.get_client().await?;
        let mut query = Query::new(query_str);
        bind_fn(&mut query);

        let stream = query.query(&mut client).await?;
        let rows = stream.into_first_result().await?;

        let results: Result<Vec<T>> = rows.iter().map(mapper).collect();
        results
    }

    pub async fn execute_update(
        &self,
        query_str: &str,
        bind_fn: impl FnOnce(&mut Query<'_>),
    ) -> Result<u64> {
        let mut client = self.get_client().await?;
        let mut query = Query::new(query_str);
        bind_fn(&mut query);

        let result = query.execute(&mut client).await?;
        let affected_rows = result.total();

        Ok(affected_rows)
    }
}

pub fn get_string(row: &Row, col: &str) -> String {
    row.try_get::<&str, _>(col)
        .unwrap_or(None)
        .unwrap_or("")
        .to_string()
}

pub fn get_i32(row: &Row, col: &str) -> i32 {
    row.try_get::<i32, _>(col).unwrap_or(None).unwrap_or(0)
}

pub fn get_f64(row: &Row, col: &str) -> f64 {
    row.try_get::<f64, _>(col).unwrap_or(None).unwrap_or(0.0)
}

pub fn get_optional_f64(row: &Row, col: &str) -> Option<f64> {
    row.try_get::<f64, _>(col).unwrap_or(None)
}
