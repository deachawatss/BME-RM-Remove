# 📦 Component Registry

> Quick reference for all project components, hooks, and utilities
> **Update:** After creating/modifying any component, hook, or utility

---

## 📄 Pages

| Route | File | Description | Key Dependencies |
|-------|------|-------------|------------------|
| `/` | `app/page.tsx` | Landing page - redirects to login | - |
| `/login` | `app/login/page.tsx` | LDAP Login page with NWFTH branding | authStore, toast |
| `/dashboard` | `app/dashboard/page.tsx` | Main RM Partial Picking interface | rmStore, authStore, toast |

---

## 🧩 Components

### Layout Components

| Component | Location | Key Props | Used By |
|-----------|----------|-----------|---------|
| Header | `components/Header.tsx` | - | dashboard/page.tsx |
| ToastContainer | `components/ui/toast.tsx` | - | layout.tsx |

### Feature Components

| Component | Location | Key Props | Used By |
|-----------|----------|-----------|---------|
| RunNoInput | `components/RunNoInput.tsx` | value, onChange, onSearch, isLoading, error | dashboard/page.tsx |
| RMDataTable | `components/RMDataTable.tsx` | data, selectedRows, onSelectionChange, isLoading | dashboard/page.tsx |
| RemoveButton | `components/RemoveButton.tsx` | selectedCount, isLoading, onRemove | dashboard/page.tsx |

### UI Components (shadcn/ui)

| Component | Location | Purpose |
|-----------|----------|---------|
| Button | `components/ui/button.tsx` | Primary action button |
| Card | `components/ui/card.tsx` | Content containers |
| Input | `components/ui/input.tsx` | Form text input |
| Label | `components/ui/label.tsx` | Form labels |
| Checkbox | `components/ui/checkbox.tsx` | Row selection |
| Table | `components/ui/table.tsx` | Data display |
| Dialog | `components/ui/dialog.tsx` | Confirmation modals |
| Alert | `components/ui/alert.tsx` | Error/success messages |
| Toast | `components/ui/toast.tsx` | Toast notification system |

---

## 🪝 Custom Hooks

| Hook | Location | Purpose | Returns |
|------|----------|---------|---------|
| useToasts | `components/ui/toast.tsx` | Subscribe to toast notifications | ToastItem[] |
| useSelectableCount | `stores/rmStore.ts` | Get count of selectable rows | number |
| useIsRowSelected | `stores/rmStore.ts` | Check if row is selected | boolean |
| useHasRole | `stores/authStore.ts` | Check user role | boolean |
| useCurrentUsername | `stores/authStore.ts` | Get current username | string \| null |

---

## 🏪 Zustand Stores

| Store | Location | State Shape | Key Actions |
|-------|----------|-------------|-------------|
| authStore | `stores/authStore.ts` | user, token, isAuthenticated, isLoading, error | login, logout, clearError, setUser |
| rmStore | `stores/rmStore.ts` | lines, selectedRows, currentRunNo, isLoading, error, hasSearched | search, remove, toggleSelection, selectAll, clearSelection, clearError, reset |

---

## 🛠️ Utility Functions

| Function | Location | Purpose | Params |
|----------|----------|---------|--------|
| cn | `lib/utils.ts` | Merge Tailwind classes | `...inputs` |
| formatNumber | `components/RMDataTable.tsx` | Format number to 2 decimals | num: number |
| isRowSelectable | `lib/mock-data.ts` | Check if row can be selected | row: RMLine |
| generateMockRMData | `lib/mock-data.ts` | Generate test data | runNo: number |
| getMockRMData | `lib/mock-data.ts` | Get mock data for RunNo | runNo: number |
| simulateDelay | `lib/mock-data.ts` | Simulate API delay | ms?: number |

---

## 📊 Component Statistics

| Category | Count |
|----------|-------|
| Pages | 3 |
| Layout Components | 2 |
| Feature Components | 3 |
| UI Components | 10 |
| Custom Hooks | 5 |
| Stores | 2 |

---

## 🎨 NWFTH Theme Classes

| Class | Purpose | Location |
|-------|---------|----------|
| `nwfth-fade-in` | Page fade-in animation | globals.css |
| `nwfth-slide-in` | List item slide animation | globals.css |
| `nwfth-card-hover` | Card lift on hover | globals.css |
| `nwfth-button-press` | Button press feedback | globals.css |
| `nwfth-row-hover` | Table row hover transition | globals.css |
| `nwfth-input-focus` | Input focus ring | globals.css |
| `nwfth-toast-enter` | Toast slide in | globals.css |
| `nwfth-toast-exit` | Toast slide out | globals.css |
| `nwfth-pulse` | Loading pulse | globals.css |
| `nwfth-transition` | General transition utility | globals.css |

---

## 🔔 Toast API

```typescript
import { toast } from '@/components/ui/toast';

// Usage
toast.success('Operation completed');
toast.error('Something went wrong');
toast.info('Information message');
toast.warning('Warning message');
```

---

*Last updated: 2026-02-11*
