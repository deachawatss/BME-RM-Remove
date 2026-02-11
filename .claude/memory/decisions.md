# 🧠 Key Decisions

## Architecture Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-02-10 | Use Toh Framework | AI-Orchestration Driven Development |
| 2026-02-11 | Rust + Actix-web for backend | Performance, type safety, MSSQL support via Tiberius |
| 2026-02-11 | Tiberius for MSSQL | Native async Rust driver, no ODBC required |
| 2026-02-11 | JWT for auth tokens | Stateless, widely supported |

## Design Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-02-11 | LDAP primary, SQL fallback | NWFTH uses LDAP, but LOCAL users need SQL auth |
| 2026-02-11 | Audit fields (User8, User9, User3) | Preserve original values and track changes |
| 2026-02-11 | Parameterized queries for auth | Prevents SQL injection attacks |
| 2026-02-11 | Password comparison in Rust code | Avoids plaintext password in SQL queries |
| 2026-02-11 | Custom toast notification system | Better UX than browser alerts, matches NWFTH theme |
| 2026-02-11 | CSS-based animations (not Framer Motion) | Lighter bundle, sufficient for this app's needs |
| 2026-02-11 | Button press feedback (scale 0.98) | Provides tactile feedback on click |
| 2026-02-11 | Card hover lift effect | Visual affordance for interactive elements |
| 2026-02-11 | Custom scrollbar styling | Consistent NWFTH theme throughout UI |
| 2026-02-11 | Input focus ring with NWFTH green | Clear focus indicator, matches brand |
| 2026-02-11 | Login page gradient background | Matches BME-Partial-Picking style |
| 2026-02-11 | Connection status indicator | Visual feedback for backend connectivity |
| 2026-02-11 | Health check polling every 30s | Real-time connection status updates |

## Authentication Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-02-11 | Use tbl_user instead of Users | Consistent with BME-Partial-Picking |
| 2026-02-11 | auth_source field for user type | Distinguishes LOCAL vs LDAP users |
| 2026-02-11 | Deny LDAP users from SQL fallback | Security - LDAP users must use LDAP |
| 2026-02-11 | Display name from Fname + Lname | Proper name display from tbl_user |

## Business Logic
| Date | Decision | Reason |
|------|----------|--------|
| 2026-02-11 | Filter: ToPickedPartialQty > 0 AND (PickedPartialQty IS NULL OR <= 0) | Only show unprocessed partial picks |
| 2026-02-11 | Update with timestamp in User9 | Unix timestamp for audit trail |

## Rejected Ideas
| Date | Idea | Why Rejected |
|------|------|--------------|
| 2026-02-11 | SQLx instead of Tiberius | SQLx doesn't support MSSQL well |
| 2026-02-11 | ODBC bridge | Adds complexity, requires system dependencies |

---
*Last updated: 2026-02-11*
