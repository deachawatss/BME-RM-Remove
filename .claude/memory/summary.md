# 📋 Project Summary

## Project Overview
- Name: RM Partial Pick Remover
- Type: Internal ERP Tool for NWFTH
- Tech Stack: Rust (Actix-web) + MSSQL + Next.js + TypeScript

## Completed Features
- ✅ Rust backend API with Actix-web
- ✅ MSSQL database integration (Tiberius)
- ✅ Authentication system (LDAP + SQL fallback)
- ✅ JWT token-based auth
- ✅ RM line search by RunNo
- ✅ RM partial quantity removal with audit trail
- ✅ CORS enabled for frontend
- ✅ Structured logging with env_logger
- ✅ Next.js frontend with TypeScript
- ✅ Zustand state management
- ✅ API clients for auth and RM operations
- ✅ Frontend-backend integration complete
- ✅ Login page with BME-Partial-Picking style UI
- ✅ Connection status indicator
- ✅ SQL authentication using tbl_user table

## Current State
Full-stack application complete with frontend connected to Rust backend. Docker containers running on ports 6065 (frontend) and 6066 (backend).

## Key Files
### Backend
- `/backend/Cargo.toml` - Rust dependencies
- `/backend/src/main.rs` - Server setup
- `/backend/src/db/mssql.rs` - MSSQL connection pool
- `/backend/src/routes/rm.rs` - RM API endpoints
- `/backend/src/routes/auth.rs` - Auth endpoints (tbl_user auth)
- `/backend/src/models/` - Data models

### Frontend
- `/frontend/lib/api/auth.ts` - Auth API client
- `/frontend/lib/api/rm.ts` - RM API client
- `/frontend/stores/authStore.ts` - Auth state management
- `/frontend/stores/rmStore.ts` - RM state management
- `/frontend/app/login/page.tsx` - Login page with connection status
- `/frontend/app/dashboard/page.tsx` - Main dashboard

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/login | Login with LDAP/SQL |
| GET | /api/rm/search?runno={id} | Search RM lines |
| POST | /api/rm/remove | Remove partial quantities |

## Important Notes
- Uses cust_PartialPicked table
- Audit trail: User8, User9, User3 fields
- LDAP auth with SQL fallback for LOCAL users only
- SQL auth uses tbl_user table (uname, Fname, Lname, pword, auth_source)
- Frontend runs on port 6065
- Backend runs on port 6066

---
*Last updated: 2026-02-11*
