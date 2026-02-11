# Project Summary: RM Partial Picking Remover

## Description
Web application for removing partial Raw Material (RM) picking entries with LDAP authentication and full audit logging.

## Tech Stack
- Frontend: Next.js 16 + TypeScript + Tailwind CSS
- Backend: Rust + Actix-web
- Database: MSSQL (BME-MSSQL MCP)
- Auth: LDAP
- Docker: Multi-stage builds with Docker Compose

## NWFTH Theme
- Primary Brown: #3A2920
- Forest Green: #3F7D3E
- Accent Gold: #E0AA2F
- Background: #FAF8F4

## Ports
| Service | Port |
|---------|------|
| Frontend | 6065 |
| Backend | 6066 |

## Database
cust_PartialPicked table with audit columns User8, User9, User3
