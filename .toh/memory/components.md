# 📦 Component Registry

> Quick reference for all project components, hooks, and utilities
> **Update:** After creating/modifying any component, hook, or utility

---

## 📄 Pages

| Route | File | Description | Key Dependencies |
|-------|------|-------------|------------------|
| `/` | `app/page.tsx` | Redirects to /login | - |
| `/login` | `app/login/page.tsx` | LDAP Login page | authStore, nwfth-theme |
| `/dashboard` | `app/dashboard/page.tsx` | Main RM data interface | All components |

---

## 🧩 Components

### Layout Components

| Component | Location | Key Props | Used By |
|-----------|----------|-----------|---------|
| Header | `components/Header.tsx` | - | dashboard |

### Feature Components

| Component | Location | Key Props | Used By |
|-----------|----------|-----------|---------|
| RunNoInput | `components/RunNoInput.tsx` | value, onChange, onSearch, isLoading, error | dashboard |
| RMDataTable | `components/RMDataTable.tsx` | data, selectedRows, onSelectionChange, isLoading | dashboard |
| RemoveButton | `components/RemoveButton.tsx` | selectedCount, isLoading, onRemove | dashboard |

---

## 🪝 Custom Hooks

| Hook | Location | Purpose | Returns |
|------|----------|---------|---------|
| useAuthStore | `stores/authStore.ts` | Auth state management | user, token, isAuthenticated, login, logout |
| useHasRole | `stores/authStore.ts` | Check user role | boolean |
| useCurrentUsername | `stores/authStore.ts` | Get current user | string \| null |

---

## 🏪 Zustand Stores

| Store | Location | State Shape | Key Actions |
|-------|----------|-------------|-------------|
| authStore | `stores/authStore.ts` | user, token, isAuthenticated, isLoading, error | login, logout, clearError, setUser |

---

## 🛠️ Utility Functions

| Function | Location | Purpose | Params |
|----------|----------|---------|--------|
| cn | `lib/utils.ts` | Merge Tailwind classes | `...inputs` |
| generateMockRMData | `lib/mock-data.ts` | Generate test data | runNo: number |
| getMockRMData | `lib/mock-data.ts` | Get mock data | runNo: number |
| simulateDelay | `lib/mock-data.ts` | Simulate API delay | ms?: number |
| isRowSelectable | `lib/mock-data.ts` | Check row selectable | row: RMLine |

---

## 🎨 Theme

| File | Purpose |
|------|---------|
| `lib/nwfth-theme.ts` | NWFTH color constants and theme config |

---

## 📊 Component Statistics

| Category | Count |
|----------|-------|
| Pages | 3 |
| Components | 4 |
| Hooks | 3 |
| Stores | 1 |

---
*Last updated: 2026-02-10*
