## Use dark navy from bottom sheet for nav cards and contact link buttons

Match the dark navy card surface seen in the transaction bottom sheet (`#0a1422`) across the More section's nav cards and the Contact Us page's link-out buttons.

### Changes

**1. `src/routes/more.tsx` — nav cards**
- Replace `glass-card` with `bg-[#0a1422] rounded-2xl` on:
  - The profile card (line 59)
  - Each section nav card wrapper (line 75)
- Keep the `divide-y divide-border/30` row dividers and rounded corners.
- Leave icon colors (`text-pill`) and chevron colors untouched.

**2. `src/routes/help.contact.tsx` — link-out cards**
- Quick-link cards (Start Application, Browse unit trust funds, etc., line 658):
  - `bg-primary` → `bg-[#0a1422]`
  - Hover `hover:bg-primary/90` → `hover:bg-[#0a1422]/80`
  - Icon container `bg-primary-foreground/20` → `bg-pill/90` (bright blue circle, matching the bottom-sheet style in the screenshot)
  - Icon color `text-primary-foreground` → `text-pill-foreground`
  - Title `text-primary-foreground` → `text-foreground`
  - Description `text-primary-foreground/80` → `text-muted-foreground`
  - Chevron `text-primary-foreground/70` → `text-muted-foreground`

### Out of scope
- No changes to inline link pills, form submit buttons, the "Continue to ticket" button, or the success screen — those use the brand `bg-primary` deliberately as action CTAs. Only link-out navigation cards swap to dark navy.
- No design-token edits in `src/styles.css` — using literal `#0a1422` to exactly match the bottom-sheet drawer.
- No new dependencies or backend changes.