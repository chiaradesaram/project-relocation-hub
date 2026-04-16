

# Plan: Migrate CAL Digital Dashboard to This Project

## Summary

Your other project is a mobile-first financial dashboard app (CAL Digital) built with React Router v6 + Tailwind CSS v3. This project uses TanStack Start + Tailwind CSS v4. I'll recreate all 12 pages and 3 shared components, adapting the routing and styling to work with the current stack.

## What Gets Migrated

**Pages (12 total) -> TanStack Start route files:**

| Source page | New route file | URL |
|---|---|---|
| Dashboard.tsx | `src/routes/index.tsx` | `/` |
| Invest.tsx | `src/routes/invest.tsx` | `/invest` |
| Transactions.tsx | `src/routes/transactions.tsx` | `/transactions` |
| Analytical.tsx | `src/routes/analytical.tsx` | `/analytical` |
| More.tsx | `src/routes/more.tsx` | `/more` |
| Rates.tsx | `src/routes/rates.tsx` | `/rates` |
| Learn.tsx | `src/routes/learn.tsx` | `/learn` |
| VStock.tsx | `src/routes/vstock.tsx` | `/vstock` |
| BankAccounts.tsx | `src/routes/bank-accounts.tsx` | `/bank-accounts` |
| Profile.tsx | `src/routes/profile.tsx` | `/profile` |
| UnitTrustPortfolio.tsx | `src/routes/unit-trusts.tsx` | `/unit-trusts` |
| Requests.tsx | `src/routes/requests.tsx` | `/requests` |

**Shared components (3):**
- `src/components/BottomNav.tsx` — mobile bottom navigation bar
- `src/components/MobileLayout.tsx` — layout wrapper with bottom nav
- `src/components/PageHeader.tsx` — back button + title header

## Key Adaptations

1. **Routing**: Replace all `react-router-dom` imports (`useNavigate`, `useLocation`, `NavLink`) with TanStack Router equivalents (`Link`, `useNavigate`, `useLocation` from `@tanstack/react-router`).

2. **Styling**: The original uses Tailwind v3 with HSL color variables. This project uses Tailwind v4 with oklch. I'll convert the dark theme colors (purple/pink gradient palette) to oklch format and add custom utility classes (`glass-card`, `gradient-primary`, `gradient-portfolio`, `text-gradient`, `nav-glass`) plus the custom `--success`, `--warning`, and `--portfolio-*` variables to `src/styles.css`.

3. **Root layout**: Update `__root.tsx` to include the Inter font import and set the app title to "CAL Digital".

4. **Mock data stays**: All portfolio values, fund data, transactions, etc. remain as hardcoded demo data — no backend needed.

## Technical Details

- **No new dependencies needed** — all required packages (lucide-react, recharts, etc.) are already installed.
- The dark theme is the only theme (no light mode toggle in the original).
- The original `App.css` is just Vite boilerplate and can be ignored.
- `NavLink.tsx` from the source is a react-router-dom wrapper — not needed since TanStack Router's `Link` has built-in active state support.

## Implementation Order

1. Update `src/styles.css` with the dark theme colors and custom utility classes
2. Update `__root.tsx` with Inter font and dark class
3. Create shared components: `MobileLayout`, `BottomNav`, `PageHeader`
4. Create all 12 route files with adapted code
5. Verify the build compiles

This will be a large set of file changes (~15 new/modified files). Shall I proceed?

