# Project architecture decisions

- Use native CSS scroll snapping for the dashboard portfolio carousel to keep touch interaction lightweight and dependency-free.
- Keep Rates as a layout with directory and fund-detail leaf routes backed by a shared fund catalogue; this supports shareable factsheets without duplicating fund data.
- Label illustrative fund chart series as sample data and leave unavailable holdings/documents unlinked; financial examples must not appear to be live disclosures.