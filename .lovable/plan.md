
What I found

- The click is wired up: each sub-account row already links to `/unit-trusts/$subAccountId`.
- The detailed page also already exists in `src/routes/unit-trusts.$subAccountId.tsx`.
- The real bug is routing structure: `src/routes/unit-trusts.tsx` is acting like the parent route for that detail page, but it does not render an `<Outlet />`.
- So the URL can change to something like `/unit-trusts/fi-emergency`, while the detail screen never mounts. That makes it feel like “nothing happens”.

Plan

1. Refactor `/unit-trusts` into a proper layout route
   - Update `src/routes/unit-trusts.tsx` so it renders an `<Outlet />` instead of holding the portfolio screen directly.

2. Move the current portfolio screen into an index child route
   - Create `src/routes/unit-trusts.index.tsx`.
   - Move the existing Unit Trusts list UI there so `/unit-trusts` still shows the portfolio list.

3. Keep the detail page as the child route
   - Leave `src/routes/unit-trusts.$subAccountId.tsx` as the detailed page for Emergency, Retirement, Growth, etc.
   - Reuse the richer content already in that file: goal details, add money CTA, holdings, last invested date/amount, last redeemed date/amount.

4. Verify the navigation flow
   - Tapping any sub-account row or chevron should open the matching detail page.
   - The back button should return to the Unit Trusts list.
   - `/unit-trusts` should still show the normal portfolio overview.

Technical details

```text
Current structure
/unit-trusts                  -> portfolio page
/unit-trusts/$subAccountId    -> child detail route
Problem: parent route does not render <Outlet />

Fixed structure
unit-trusts.tsx               -> layout route with <Outlet />
unit-trusts.index.tsx         -> portfolio list page
unit-trusts.$subAccountId.tsx -> full detail page
```

Expected result

- Clicking Emergency / Retirement / other sub-accounts will actually open the detailed screen instead of seeming unresponsive.
- This fixes the navigation bug without changing the URL structure you already wanted.
