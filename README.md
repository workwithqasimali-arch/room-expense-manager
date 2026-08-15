# Room Expense App

A complete starter web app for managing shared-room expenses.

## Features
- Add, rename, deactivate, and remove roommates
- Record expenses with payer, amount, date, category, and notes
- Equal-split calculation across active roommates
- Automatic balances: who owes whom and who should receive
- Monthly records with automatic month boundaries
- Previous-month history and summaries
- Audit log showing who created/edited/deleted each record
- Responsive UI for phones, tablets, and desktop
- Local browser storage for an easy no-server demo
- Export current month / all data as JSON
- Import previously exported JSON

## Important
This ZIP is a working client-side prototype. Data is stored in the browser on each device, so it is NOT automatically synchronized between devices.

For true multi-device sharing, connect the same UI to a backend such as Supabase/Firebase/PostgreSQL and add authentication. The data model and service boundary are already separated so that can be added cleanly.
