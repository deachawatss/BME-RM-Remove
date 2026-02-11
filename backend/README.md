# RM Partial Pick Remover API

Rust backend API for the Raw Material Partial Picking Remover webapp.

## Tech Stack

- **Framework**: Actix-web 4
- **Database**: MSSQL (Tiberius)
- **Auth**: JWT + LDAP (with SQL fallback)
- **Logging**: env_logger

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password

### RM Operations
- `GET /api/rm/search?runno={id}` - Search RM lines by RunNo
- `POST /api/rm/remove` - Remove partial quantities

## Setup

1. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

2. Update database credentials in `.env`:
```
DB_SERVER=your_server
DB_DATABASE=your_db
DB_USERNAME=your_user
DB_PASSWORD=your_password
```

3. Build and run:
```bash
cargo build --release
cargo run
```

## Development

```bash
# Run with hot reload (requires cargo-watch)
cargo watch -x run

# Run tests
cargo test
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RUST_LOG` | Log level | `info` |
| `SERVER_PORT` | Server port | `8080` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `DB_SERVER` | MSSQL server | (required) |
| `DB_DATABASE` | Database name | (required) |
| `DB_USERNAME` | DB username | (required) |
| `DB_PASSWORD` | DB password | (required) |
| `LDAP_URL` | LDAP server URL | `ldaps://ldap.nwfth.com:636` |
| `LDAP_BASE_DN` | LDAP base DN | `DC=NWFTH,DC=com` |
| `LDAP_DOMAIN` | LDAP domain | `NWFTH.com` |

## SQL Queries

### Search Query
Filters for lines where:
- `ToPickedPartialQty > 0`
- `PickedPartialQty IS NULL OR PickedPartialQty <= 0`

### Remove Query
Updates with audit trail:
- `User8` = Original ToPickedPartialQty
- `User9` = Unix timestamp
- `User3` = User logon (first 8 chars)
- `ToPickedPartialQty` = 0
- `ModifiedBy` = User logon
- `ModifiedDate` = Current timestamp
