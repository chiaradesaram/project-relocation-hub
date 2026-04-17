
Goal: fix the “Still need help?” card so it actually opens the contact form.

What I found
- `src/routes/help.tsx` links correctly to `/help/contact`.
- `src/routes/help.contact.tsx` exists and the generated route tree includes `/help/contact`.
- The real issue is the route structure: `help.contact.tsx` is nested under `/help`, but `src/routes/help.tsx` does not render an `<Outlet />`.
- In TanStack Router, a child route under `/help` cannot render unless the parent `/help` route provides an outlet. So the URL can change, but nothing new appears.

Plan
1. Refactor `/help` into a layout route
- Update `src/routes/help.tsx` to be a parent layout that renders only `<Outlet />`.
- Match the existing pattern already used in `src/routes/unit-trusts.tsx`.

2. Move the current FAQ screen into an index child route
- Create `src/routes/help.index.tsx`.
- Move the current help hub UI there:
  - quick links
  - search bar
  - popular searches
  - FAQ list/accordion
  - bottom “Still need help?” card

3. Keep `/help/contact` as the full contact page
- Leave `src/routes/help.contact.tsx` as the child route for the form.
- Keep the current flow intact:
  - category dropdown
  - dynamic sub-category
  - smart suggestions
  - tailored fields
  - confirmation with team routing and 24-hour expectation

4. QA after the refactor
- Confirm `/help` still shows the FAQ hub.
- Confirm tapping “Still need help?” opens `/help/contact` and the form is visible.
- Confirm back navigation returns to `/help`.
- Confirm the dashboard/help icons still reach the help flow.

Technical details
- `src/routeTree.gen.ts` should not be edited manually; it will regenerate from the route file changes.
- This is a routing/layout fix, not a form-logic rewrite.
