# Google Play Test Cases

Last updated: 2026-06-11

## Reviewer Access

- App: GomBill / Ordernows ledger
- Reviewer email: `play-review@ordernows.local`
- Reviewer password: `Review123!`
- Expected behavior: signing in with the reviewer credentials starts Google Play review access and loads the local demo ledger. This path does not require a real Supabase account.
- Demo data should include: 1 group (`Review Team`), 3 members, 1 place (`Review Cafe`), 3 cost items, and 4 transactions.

## Smoke Test Result

- Web preview: `http://localhost:22048`
- Login with reviewer credentials: pass
- Home, Members, Places tabs render with demo data: pass
- Member detail navigation and back button: pass
- Place item expansion: pass
- Settings menu opens with Export JSON, Import JSON, Sign Out: pass
- Language toggle EN/VI: pass
- Theme toggle light/dark: pass
- Mobile viewport 390x844: pass after header wrap fix
- Console: no runtime errors observed; remaining web dev warning is `props.pointerEvents is deprecated` from RN/web layer.

## Test Matrix

| ID | Area | Preconditions | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| GP-001 | Install and launch | Fresh Android install | Open the app from launcher. | App opens without crash and shows the login screen. |
| GP-002 | Reviewer login | Login screen visible | Enter reviewer email/password and tap Sign in. | App navigates to Home and loads Google Play review demo data. |
| GP-003 | Login validation | Login screen visible | Leave email or password empty and tap Sign in. | Inline error asks for both email and password; app does not crash. |
| GP-004 | Language toggle | Any screen visible | Tap the language button. | UI switches between English and Vietnamese immediately, including tab labels. |
| GP-005 | Theme toggle | Any screen visible | Tap the theme button. | UI switches between light and dark mode with readable text and controls. |
| GP-006 | Home ledger overview | Reviewer login complete | Open Home. | Totals show 4 rows, total spent 190.000đ, available balance 340.000đ. |
| GP-007 | Home filters | Home visible | Select `Review Team`, then activity filters Debit/Credit/Transfer. | Transaction list updates to the selected scope; empty states remain readable when no rows match. |
| GP-008 | Transaction detail | Home visible | Tap `Review Cafe Lunch`. | Transaction detail opens with participants, total, discount/share details, and back navigation works. |
| GP-009 | Delete/restore transaction | Home visible | Tap Delete on a row, choose Restore. Repeat and choose Delete. | Restore undoes balance impact; Delete removes only the ledger row; confirmation dialog is shown. |
| GP-010 | Quick delete mode | Home visible | Tap Quick Delete, select rows, cancel, then select rows again and confirm delete. | Selection state is clear, cancel exits safely, confirm removes selected rows without crashing. |
| GP-011 | Create transaction | Reviewer demo data loaded | Tap New Transaction, select group/place/member, enter member amount, save. | A debit transaction is created and appears in Home; member balance updates. |
| GP-012 | Add member | Members tab visible | Tap Add Member, enter name, optional phone/drink, select avatar/group, create. | New member appears in Members and related group filters. |
| GP-013 | Member detail | Members tab visible | Open Play Reviewer detail. | Profile, current balance, assigned group, and recent history render correctly. |
| GP-014 | Top up wallet | Members tab visible | Tap Top Up for a member, choose/enter amount, confirm. | Balance increases and a credit transaction appears in history. |
| GP-015 | Transfer wallet | At least two members exist | Tap Transfer for a member, choose receiver, enter amount, confirm. | Sender balance decreases, receiver balance increases, transfer transaction is recorded. |
| GP-016 | Manage groups | Members tab visible | Open Manage Groups, add a group, then delete it. | New group appears in filters; delete shows keep-history/delete-all choices. |
| GP-017 | Create place | Places tab visible | Tap New Place, enter required name and optional address/hours, save. | New place appears in Places and is selectable from New Transaction. |
| GP-018 | Cost item CRUD | A place exists | Expand a place, add a cost item, edit it, then delete it. | Cost item list updates locally and remains consistent after navigation. |
| GP-019 | Export JSON | Reviewer login complete | Open Account Settings and tap Export JSON. | App starts platform export/share flow without losing ledger data. |
| GP-020 | Import JSON | Reviewer login complete with a valid backup file available | Open Account Settings, tap Import JSON, confirm, pick file. | App replaces local ledger with the selected valid JSON and updates all tabs. |
| GP-021 | Sign out | Reviewer login complete | Open Account Settings and tap Sign Out. | Reviewer access ends and the app returns to Login. |
| GP-022 | Biometric setting | Android device with biometrics enrolled and real account session | Enable Face ID / fingerprint in Account Settings, background and reopen app. | Biometric lock appears and unlocks with successful device authentication. |
| GP-023 | Delete account | Real Supabase account session | Open Account Settings, tap Delete Account, confirm. | Account deletion request completes or shows a clear error; local ledger remains on device as described. |
| GP-024 | Offline/local data | Reviewer demo loaded | Disable network, reopen app, browse tabs and local detail screens. | Local JSON ledger remains available; local navigation does not require network. |
| GP-025 | Android back behavior | On any pushed detail/form screen | Press Android system Back or header back. | App returns to the previous valid screen; if no history exists it returns to Home. |
| GP-026 | Mobile layout | Android phone viewport/device | Check Login, Home, Members, Places, Settings in EN and VI. | No clipped header actions, overlapping text, or inaccessible bottom-tab controls. |
| GP-027 | Ads behavior | Android build with ad configuration | Open Home and create a new transaction. | Banner/interstitial ads, if available, do not block core navigation or form submission. |
| GP-028 | App restart persistence | Reviewer demo loaded and local changes made | Close and reopen app. | Local ledger changes persist from storage and totals remain consistent. |

## Release Notes for Testers

- Reviewer credentials intentionally load a local demo ledger so Google Play reviewers can test without receiving a real account.
- Biometric login is disabled during reviewer access because no real Supabase session is created.
- Export/import use local JSON files; destructive actions should be tested only on demo/review data unless a backup has been exported.
