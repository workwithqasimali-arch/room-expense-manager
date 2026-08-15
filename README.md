# Room Expense Manager — Shared Multi-Device Fix

This update keeps the existing UI, PWA and Cloudflare deployment. It changes the application data layer so Supabase is the permanent source of truth.

## What changed
- No localStorage database.
- Same Supabase email/password loads the same household on every device.
- Roommates and Admin status come from Supabase.
- Expenses are read/written directly to Supabase.
- A roommate can correct/delete only their own expenses.
- Amount-only expenses are accepted; description defaults to `Expense`.
- Roommate changes and expense changes create audit records.
- Monthly history remains in the `expenses` table and is loaded from Supabase.
- Realtime refreshes changes across devices when enabled.
- Cloud failures do not silently create a separate local database.

## Configure Supabase
Open `config.js` and set:

```js
window.ROOM_EXPENSE_CONFIG = {
  supabaseUrl: 'YOUR_SUPABASE_PROJECT_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY'
};
```

Use only the browser-safe Publishable/anon key. Never put a `service_role`/secret key in this file.

## Database
The existing `backend-schema.sql` is compatible with this app. If Realtime is not already enabled, run `backend-schema-realtime.sql` once in Supabase SQL Editor.

## Deploy
Replace the repository's `app.js` with this version and commit/push to:

`workwithqasimali-arch/room-expense-manager`

Your existing Cloudflare project and public URL do not need to change.
