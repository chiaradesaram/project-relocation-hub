## Contextual Help page based on `?topic=` search param

Update `src/routes/help.index.tsx` so that when the user arrives with a topic (e.g. `/help?topic=transactions` from the transaction page's help icon), the page shows FAQs relevant to that topic instead of the generic Quick Links.

### Behavior

- Keep the hero heading ("Hi, how can we help?"), search bar, and Contact us card unchanged.
- Read `topic` from `Route.useSearch()` (already validated).
- Treat `topic` as contextual when it is one of the FAQ topics (`invest`, `rates`, `unit-trusts`, `transactions`, `account`). `general` or missing = no context → current behavior (Quick Links + Suggested Topics).
- When contextual and not searching:
  - **Replace** the Quick Links section with a **Suggested FAQs** section:
    - Heading: "Suggested FAQs"
    - Show up to 3 FAQs from `FAQS` filtered by the current topic. Prefer `featured: true` first, then fill in order until 3.
    - Reuse the existing expandable FAQ row styling from `TopicView` / search results (chevron down, toggle on click, `openKey` state).
  - **Rename** the "Suggested Topics" section heading to "Other Topics" and exclude the current topic from the list so the user only sees the other categories.
- Search behavior (typing in the search bar) stays exactly as it is today — results replace both sections, contextual or not.
- Topic drill-down (tapping an item in Other Topics) still opens the existing `TopicView`; back button behavior unchanged.

### Transactions-page mapping (already wired)

`PageHeader` on the transactions screen already links to `/help` with `search={{ topic: "transactions" }}` via its `helpTopic` prop, so no change needed there — this plan just makes the destination page respect it. Same applies to any other screen that already passes `helpTopic`.

### Files

- `src/routes/help.index.tsx` — add topic-aware branch rendering Suggested FAQs + Other Topics; leave search, hero, header, TopicView, and Contact us untouched.

### Out of scope

- No changes to `PageHeader`, `help.contact.tsx`, `help.tsx`, or any caller pages.
- No new FAQ content — uses existing entries in the `FAQS` array (the three transaction FAQs the user listed are already present).
- No design-token or style changes.
