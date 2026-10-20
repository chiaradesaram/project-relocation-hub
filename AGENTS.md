# Project architecture decisions

- Keep the dashboard as a single compact overview with a CSS allocation bar and lightweight SVG market sparkline; no carousel dependency is needed.
- Keep Rates as a layout with directory and fund-detail leaf routes backed by a shared fund catalogue; this supports shareable factsheets without duplicating fund data.
- Label illustrative fund chart series as sample data and leave unavailable holdings/documents unlinked; financial examples must not appear to be live disclosures.
- Keep selected investment bank-account labels presentation-only through a shared formatter; retain full selection values for requests and picker details.
- Keep invest/redeem bottom actions disabled until every required field is complete; the user rejected inline validation messaging, so gate the action instead of highlighting fields.
- Style Radix Select internals (trigger value, option rows) from the parent with arbitrary-variant child selectors such as `[&>span]:flex-1`, never by passing className to `SelectValue`/`SelectItemText`; those primitives drop the prop, so pills and labels would not stretch.