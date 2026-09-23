## Plan

### Recurring Investments landing screen

- Change the **Recurring Investment** entry so it opens a dedicated landing state instead of immediately showing the investment form.
- For a first-time user, show a simple empty state saying there are no recurring investments yet, with one clear **Add recurring investment** action.
- Keep the existing dark translucent visual style, blue selected/action color, white text, and compact Monzo-like spacing.

### Create a recurring investment

- Tapping **Add recurring investment** opens the existing recurring setup flow with amount, fund, sub-account, bank account, start date, and monthly frequency.
- Keep the existing review step, but carry the recurring schedule details through to the review page so the user can verify them before confirming.
- On confirmation, save the recurring investment and return to the recurring landing screen with the new plan visible.

### Saved plan card and management

- Replace the empty state with a compact card showing the essential details: amount, fund/sub-account, frequency, next investment date, and active status.
- Make the entire card tappable. Opening it shows a management screen where the user can review the full plan, pause or resume it, change its details, or remove it.
- Use the shared green saved confirmation inside the bottom sheet after edits, keeping feedback consistent with the rest of the app.
- Store the prototype state in the browser so the plan remains after leaving or refreshing the app; no online account storage will be added.

### Validation

- Verify the first-time empty state, add flow, review/confirm flow, saved card, edit, pause/resume, and remove behavior on a mobile-sized preview.
- Confirm the existing Direct Invest recurring toggle still works independently and that all updated screens load without errors.