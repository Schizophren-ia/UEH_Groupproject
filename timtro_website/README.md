# TìmTrọ website prototype

## What's included
- Student room search, listing detail, favorites, reviews and verification.
- Supabase email/password authentication for UEH student addresses (`@st.ueh.edu.vn`) with signup OTP.
- Roommate finder with profile form, lifestyle tags, adjustable filters, compatibility estimate, saved profiles, connection requests, accept/decline, and private messaging after mutual acceptance.
- 36+ fictional roommate demo profiles cover varied genders, study levels, room types, budgets, campuses and lifestyle combinations for testing filters. Demo profiles are visibly labelled “HỒ SƠ MẪU · DEMO” and cannot receive real connection requests.

## Enable real roommate profiles and connection requests
1. Open the Supabase project for TìmTrọ.
2. Go to **SQL Editor** → **New query**.
3. Open `roommate_setup.sql`, copy all of it into the editor, and click **Run**.
4. Deploy the folder containing `index.html` to Netlify.
5. Sign in with a verified `@st.ueh.edu.vn` account, open **Tìm bạn cùng phòng**, and save a profile.

The SQL enables Row Level Security. Signed-in users can discover profiles, but can only edit their own profile. Connection requests are visible only to the two participants, and only the recipient can accept/decline. Private messages can only be sent between users whose connection is accepted.

## Important limitations
- The compatibility score is a simple estimate based on shared lifestyle tags, campus, budget overlap and room preference; it is not a guarantee.
- Demo profiles are illustrative. Only real profiles stored in Supabase can receive real connection requests.
- The compatibility score is a heuristic and demo profiles are illustrative; only real profiles stored in Supabase can receive real connection requests.
- The site uses a Supabase publishable key in the browser, which is intended to be public. Never put a Supabase secret or `service_role` key in `index.html`.
- Verify Supabase email delivery and RLS policies before using with real students.


## Student login and sign-up
The site opens directly to Log In / Sign Up. Sign-up uses username, UEH student email and password, followed by email OTP verification. Valid saved student sessions open the home page automatically; signing out returns to Log In. The role-selection screen, role controls and landlord management dashboard have been removed.

“Forgot Password?” appears only on Log In as a display-only placeholder; it has no click action or password-reset request.

Available demo listings saved by an earlier version can still be read from this browser. This version does not create or manage landlord listings.

## Check the login flow
Run `node tests/login.cjs` from this folder. The check executes the inline application script against a small simulated DOM and mocked Supabase. It covers student-only entry, tabs, email validation, signup/OTP, login, saved sessions, logout and service errors without creating real accounts or sending emails. Browser layout and live Supabase email delivery require separate verification.
