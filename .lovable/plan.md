## Plan

Update `src/routes/notifications.settings.tsx` to make two small changes:

1. Remove the "How to reach me" section entirely:
   - Delete the `initialChannels` array and its related `channels` state.
   - Remove the `<Section title="How to reach me" ... />` render line.
   - Clean up any now-unused imports (`Mail`, `Smartphone`, `MessageSquare`).

2. Rename the "Promotions & news" notification category to "Product and Service updates".

No other files are affected; the search confirmed these strings only appear in this route.