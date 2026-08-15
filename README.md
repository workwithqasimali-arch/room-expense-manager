# Room Expense Manager — shared roommate version

This version adds the workflow requested:

- One household account uses one email + shared account password.
- The owner creates roommate profiles (Roommate 01, 02, 03, etc.).
- Every roommate gets a separate profile password.
- After household login, the user selects their roommate name and enters that profile password.
- Everyone sees the same monthly totals, every roommate's spending, equal share and settlements.
- A roommate can add only their own expenses.
- A roommate can correct only their own expense, including changing 40 SAR back to 30 SAR. They cannot edit another roommate's amount.
- Admin can add/rename/deactivate roommates and reset profile passwords.
- Month navigation and history remain available.
- Change log records additions and corrections.

## Live multi-device setup (Supabase)

1. Create a Supabase project.
2. Open SQL Editor and run **backend-schema.sql**.
3. Open Project Settings → API and copy the **Project URL** and **anon/public key**.
4. Put them into **config.js**:
   - `supabaseUrl`
   - `supabaseAnonKey`
5. Deploy the folder with the same Cloudflare deployment you already use.

Do not put a Supabase `service_role` key in the browser.

### Email verification
Supabase may require email confirmation depending on the project's Auth settings. If you want the household email/password to work immediately, configure the project's email-confirmation setting accordingly.

## Important security note
The requested design intentionally uses one shared Supabase login for the household and a second roommate-profile password. The profile check is enforced by the app UI. This is convenient for a small private household, but it is not equivalent to five independent authenticated user accounts. For stronger security, give each roommate their own Supabase Auth account/email and map each Auth user to exactly one member.

## Local/demo mode
If `config.js` is left blank, the app runs in local browser mode so the interface can still be tested. Local mode does **not** synchronize between devices.
