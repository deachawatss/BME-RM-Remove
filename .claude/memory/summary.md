# 📋 Project Summary

## Project Overview
- Name: RM Partial Pick Remover
- Type: Internal ERP Tool for NWFTH
- Tech Stack: Rust (Actix-web) + MSSQL + React (planned)

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

## Current State
Full-stack application complete with frontend connected to Rust backend

## Key Files
### Backend
- `/backend/Cargo.toml` - Rust dependencies
- `/backend/src/main.rs` - Server setup
- `/backend/src/db/mssql.rs` - MSSQL connection pool
- `/backend/src/routes/rm.rs` - RM API endpoints
- `/backend/src/routes/auth.rs` - Auth endpoints
- `/backend/src/models/` - Data models

### Frontend
- `/frontend/my-app/lib/api/auth.ts` - Auth API client
- `/frontend/my-app/lib/api/rm.ts` - RM API client
- `/frontend/my-app/stores/authStore.ts` - Auth state management
- `/frontend/my-app/stores/rmStore.ts` - RM state management
- `/frontend/my-app/app/dashboard/page.tsx` - Main dashboard
- `/frontend/my-app/.env.local` - API URL configuration

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login with LDAP/SQL |
| GET | /api/rm/search?runno={id} | Search RM lines |
| POST | /api/rm/remove | Remove partial quantities |

## Important Notes
- Uses cust_PartialPicked table
- Audit trail: User8, User9, User3 fields
- LDAP auth with SQL fallback for LOCAL users
- Server runs on port 8080

---
*Last updated: 2026-02-11*
