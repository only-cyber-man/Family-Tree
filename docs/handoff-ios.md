# Handoff: ship Family Tree to the App Store (MacBook agent)

You are picking up the iOS side of **Family Tree**. Android is already in Google Play review; the web app is live. Your job: build the iOS app, check it really works on iPhone and iPad, and prepare the App Store Connect submission. **Ask the user before anything outward-facing** (creating the App Store Connect app record, uploading a build, submitting for review).

## Repo and state

- Repo: `git@github.com:only-cyber-man/Family-Tree.git`, branch `master` (pushing to `master` deploys the **web** app to production via GitHub Actions — don't push web changes casually).
- `src/` — Next.js 14 web app (live at https://family-tree.cyber-man.pl).
- `mobile/` — the Expo app (Expo SDK 57, React Native 0.86, New Architecture, expo-router, TypeScript). Read `mobile/README.md` and `mobile/CLAUDE.md` first.
- Backend: PocketBase at https://pocketbase.cyber-man.pl (collections `ft_users`, `ft_trees`, `ft_nodes`, `ft_relationships`, `ft_relationships_names`). Shared with the web app — never change schema or data from the app side.
- Design handoff (source of truth for visuals): `docs/design/handoff/family-tree-visual-identity/`.
- Store material already made: `store/play/` (listing copy EN + PL in `listing.md`, icon, feature graphic, Android phone/tablet screenshots). Reuse the copy for the App Store.

Checks that must stay green: `cd mobile && yarn install && yarn typecheck && yarn test` (112 tests).

## What has NOT been verified yet (your main job)

The app has only ever run on **Android emulators** (Pixel 7 phone, 10" tablet, landscape and portrait). It has **never run on iOS**. Before any submission, run it on iOS simulators and a real iPhone if available, and check:

1. Sign in / sign up / sign out, onboarding, language (EN/PL) and theme (System/Light/Dark) switches — also before sign-in.
2. Tree tab: pan/pinch, generation bands, tap a person → sheet (phone) / right panel (iPad landscape), Focus mode, "How are we related", filters (include + exclude by name).
3. Add / edit person: camera and photo library (permission prompts; strings are in `app.json` → `ios.infoPlist`), birth/death date pickers, note field, "Linked account" picker.
4. Dates tab + reminders: notification permission prompt, a scheduled local notification actually firing, tapping it deep-links to the person.
5. Settings: Delete account flow (use a throwaway account you create yourself only if the user agrees — never delete the demo account), Privacy policy link, export .ics via the share sheet.
6. iPad (`supportsTablet: true`, `orientation: "default"`): navigation rail instead of tab bar, persistent person panel in landscape, master–detail Home and Dates, centred forms, rotation in both directions, split view / slide over. Phones should stay portrait.
7. Safe areas / Dynamic Island / home indicator, keyboard avoidance in forms, dark mode status bar.

Fix what's broken in `mobile/` only, keep typecheck/tests green, commit with clear messages. Don't touch `src/` unless the user asks.

## Build setup

- Bundle id `pl.cyberman.familytree`, version `1.0.0`, `ios.buildNumber` `1`, `ITSAppUsesNonExemptEncryption` already false.
- **Not done yet:** `appleTeamId` is missing from `mobile/app.json` (the owner's other apps use `WWJ5SV87NB` — confirm with the user), and there is no EAS project yet. Either:
  - **EAS:** `cd mobile && npx eas init` (the owner's other Expo app uses owner `makefriends`; confirm), then `npx eas build -p ios --profile production` and `npx eas submit -p ios`, or
  - **Local:** `npx expo prebuild --platform ios --clean` then build/archive in Xcode (`ios/` is generated and gitignored — put any native changes in `app.json` or a config plugin, never hand-edit `ios/`).
- `mobile/app.config.js` only matters when `FT_SCREENSHOT_BUILD=1` (Android cleartext for a local mock backend). Leave it unset for store builds.
- The Android signing setup (`mobile/plugins/with-release-signing.js`, gitignored `keystore.properties`) is Android-only; ignore it.

## App Store Connect: what to fill in

**App information**
- Name: `Family Tree` (if taken, ask the user; Play uses "Family Tree"). Subtitle idea: "Your family, drawn as a graph".
- Primary language English (U.K.); add Polish localisation. Category: Lifestyle.
- Description / keywords / promo text: adapt `store/play/listing.md` (EN + PL).
- Support URL / marketing URL: https://family-tree.cyber-man.pl · Privacy policy URL: https://family-tree.cyber-man.pl/privacy
- Contact: family-tree@cyber-man.pl

**App Review information**
- Sign-in required: yes. Demo account username `familytree-review` (email `demo-ft@cyber-man.pl`); **get the password from the user** — it is not stored in the repo. The account owns a sample tree "Kowalski family" (10 people).
- Notes: "Private family-tree app. Sign in with the demo account; it owns a sample tree. Account deletion: Settings → Delete account. No purchases, no ads, no tracking."
- Account deletion is in-app (Settings → Delete account) and on the web (https://family-tree.cyber-man.pl/delete-account) — required by guideline 5.1.1(v).
- No third-party login, so Sign in with Apple is not required.

**App Privacy (nutrition label)** — keep consistent with the Google Play data safety form:
- Data used to track you: **none**. No third-party SDKs, analytics or ads.
- Data linked to you, all for **App Functionality** (name/email/user ID also "account management" where offered):
  - Contact Info → Name, Email Address
  - Identifiers → User ID (username)
  - User Content → Photos, Other User Content (family trees: people's names, dates, genders, notes, relationships)
- Not collected: location, contacts, browsing, search history, diagnostics, purchases, health, financial.

**Age rating**: user-generated content shared only with invited people (no public sharing), no chat, no mature content. Google's IARC gave Teen / 12+; answer Apple's questionnaire truthfully (unrestricted web access: no; UGC: yes, limited to invited users). Target audience in Play is 13+; the privacy policy says 16+, or 13–15 with a parent's or guardian's permission.

**Screenshots** — must be real iOS captures, not the Android ones:
- iPhone 6.9" (e.g. iPhone 16/17 Pro Max simulator, 1320×2868 portrait) and iPad 13" (2064×2752, landscape shows the tablet layout best).
- Sign in with the demo account (production backend) so the Kowalski tree is on screen.
- Good screens (same story as Play): Focus mode on a person, "How are we related" path, Home with upcoming dates, Dates list, person details; one Polish + dark-mode set for the PL localisation.
- The Play screenshots in `store/play/screenshots/` were composed as caption + framed device on a brand-green (#2F5D46) background with Literata SemiBold captions; match that look. Fonts are in `mobile/node_modules/@expo-google-fonts/literata`.

**Release notes (What's New)** — same as Play:
- EN: First release of Family Tree: build your family as a graph with generations by birth year; see how you're related to anyone; birthdays and remembrance days with optional reminders; people with photos, notes and linked accounts; filters, calendar export, tablet layouts, English and Polish, light and dark mode.
- PL: Pierwsze wydanie Family Tree: rodzina jako graf z pokoleniami według roku urodzenia; zobacz, jak jesteś spokrewniony z każdą osobą; urodziny i rocznice śmierci z opcjonalnymi przypomnieniami; osoby ze zdjęciami, notatkami i powiązaniem z kontem; filtry, eksport do kalendarza, widok na tablety, polski i angielski, jasny i ciemny motyw.

## Known open items (tell the user if you touch them)

- Godparent relationship type: the backend has no `IS_GODPARENT_OF`; the real name is different, so its Polish label falls back to humanised English. Ask the user for the real type names and add them to the app's i18n (`mobile/src/i18n/`) and web (`src/i18n/`).
- `ft_nodes.user` (link person ↔ account) must not have cascade delete on the server; the user should confirm in PocketBase.
- A brief server error during token refresh on app start sends the user to "sign in again" (no data loss). Could retry instead.
- Don't create accounts or type passwords into web forms on the user's behalf; hand those steps to the user.
