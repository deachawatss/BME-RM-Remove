# 🏗️ Project Architecture

> Semantic overview of project structure for AI context loading
> **Update:** After any structural changes (new pages, routes, modules, services)

---

## 📁 Entry Points

| Type | Path | Purpose |
|------|------|---------|
| Main | `app/page.tsx` | Redirects to /login |
| Layout | `app/layout.tsx` | Root layout with Inter font |
| Login | `app/login/page.tsx` | LDAP authentication |
| Dashboard | `app/dashboard/page.tsx` | Main application interface |

---

## 🗂️ Core Modules

### `/app` - Pages & Routes

| Route | File | Description | Key Functions |
|-------|------|-------------|---------------|
| `/` | `app/page.tsx` | Landing redirect | redirect('/login') |
| `/login` | `app/login/page.tsx` | LDAP login form | login(username, password) |
| `/dashboard` | `app/dashboard/page.tsx` | Main RM interface | search, remove |

### `/components` - UI Components

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| `ui/` | shadcn/ui components | button, card, input, table, checkbox, dialog, label, alert |
| `layout/` | Layout components | Header.tsx |
| `features/` | Feature-specific | RunNoInput.tsx, RMDataTable.tsx, RemoveButton.tsx |

### `/lib` - Utilities & Services

| File | Purpose | Key Functions |
|------|---------|---------------|
| `lib/utils.ts` | Utility functions | cn(), formatDate() |
| `lib/nwfth-theme.ts` | Theme constants | NWFTH_COLORS, NWFTH_TYPOGRAPHY |
| `lib/mock-data.ts` | Mock data | generateMockRMData(), getMockRMData() |

### `/types` - TypeScript Types

| File | Purpose | Key Types |
|------|---------|-----------|
| `types/rm.ts` | RM data types | RMLine, RMFilterCriteria, RMSelectionState |

### `/stores` - State Management

| File | Purpose | Key Exports |
|------|---------|-------------|
| `stores/authStore.ts` | Auth state | useAuthStore, User, AuthState |

---

## 🔄 Data Flow Pattern

```
User Action → Component → Zustand Store → API/Lib → Database (MSSQL)
     ↑                                                    |
     └────────────── UI Update ← Response ←───────────────┘
```

---

## 🔌 External Services

| Service | Purpose | Config Location |
|---------|---------|-----------------|
| LDAP | Authentication | Backend (Rust) |
| MSSQL | Database | Backend (Rust) |

---

## 🐳 Docker Architecture

### Services
| Service | Port | Dockerfile | Notes |
|---------|------|------------|-------|
| frontend | 6065 | `frontend/Dockerfile` | Node 20, standalone output |
| backend | 6066 | `backend/Dockerfile` | Rust 1.82, Ubuntu runtime |
| autoheal | - | willfarrell/autoheal | Container health monitoring |

### Network
- Bridge network: `rm-remover-network`
- Frontend depends on backend health check

### Build Strategy
- **Frontend**: Multi-stage (builder → runtime)
  - Stage 1: Build Next.js standalone output
  - Stage 2: Serve with Node.js (non-root user)
- **Backend**: Multi-stage (builder → runtime)
  - Stage 1: Compile Rust binary
  - Stage 2: Ubuntu 22.04 with CA certificates

---

## 📝 Notes

- Frontend: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- State: Zustand with persist middleware
- Theme: NWFTH Warm Elegant Industrial
- Build: Verified (0 errors)

### Deployment
```bash
# Docker
docker-compose up -d

# Local development
cd backend && cargo run --release  # Port 6066
cd frontend/my-app && npm run dev  # Port 6065
```

---
*Last updated: 2026-02-11*
