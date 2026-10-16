# Project architecture decisions

- Keep the dashboard as a single compact overview with a CSS allocation bar and lightweight SVG market sparkline; no carousel dependency is needed.
- Keep Rates as a layout with directory and fund-detail leaf routes backed by a shared fund catalogue; this supports shareable factsheets without duplicating fund data.
- Label illustrative fund chart series as sample data and leave unavailable holdings/documents unlinked; financial examples must not appear to be live disclosures.
- Keep selected investment bank-account labels presentation-only through a shared formatter; retain full selection values for requests and picker details.