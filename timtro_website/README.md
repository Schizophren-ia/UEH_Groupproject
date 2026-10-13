# TìmTrọ — repaired prototype build (any-input login)

## Important prototype login behavior
The entry screen is intentionally a demo bypass: click **Log In** or **Sign Up** with any text, random text, or empty fields and it opens the website. Email/password authentication and OTP validation are bypassed for this school prototype. Do not use this as a production authentication system.

## Included
- Fixes the entry-overlay/navigation conflict that could make account navigation appear unresponsive.
- Removes native browser form validation from the prototype entry form so arbitrary or empty values are accepted.
- Includes editable account profile, profile picture, optional contact details and local visibility preferences.
- Includes roommate discovery cards with compatibility scores, Pass/Interested actions, simulated matches and demo chat.
- Keeps demo interactions in the browser, not shared with other users or devices.

## Test before deploying
1. Extract the ZIP.
2. Open `timtro_website/index.html` in a modern browser.
3. At the entry screen, try a nonsense string in both fields, then try the fields empty; click **Log In** each time.
4. Confirm it enters the site, then click **Tài khoản** and verify the profile opens.
5. Test roommate discovery and local demo chat.
6. Only deploy after those checks work locally.

## Prototype limitations
Demo profile edits, demo matches and demo chat are saved in this browser only. The simulated login does not create a verified identity, so contact privacy and access controls are not production-secure. Do not enter sensitive real contact information. To make real cross-user profiles and chat, restore proper Supabase authentication and test the database access rules.


Update: roommate discovery now uses a swipe deck. Swipe left to pass and right to show interest; buttons use the TìmTrọ blue palette. Left/right keyboard arrows also work when the card is focused.


## Latest prototype updates
- The roommate page opens in a card-list view. Use the compact **↔ Chế độ vuốt** button next to Refresh to switch to swipe mode; both views use the same filtered profile list.
- Demo interactions reset on a full page refresh: local mock connections, passed/swiped state, and demo chat messages are cleared. Saved profile details, profile picture, and room listings are kept locally.
- This is prototype-only behavior; live Supabase connections/messages are not deleted by this local reset script.
