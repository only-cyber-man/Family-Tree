# Family Tree — mobile

Native iOS / Android app for Family Tree, built with Expo (SDK 57, React Native 0.86, New Architecture) and expo-router. It talks to the same PocketBase backend as the web app (`https://pocketbase.cyber-man.pl`) and uses the same collections: `ft_users`, `ft_trees`, `ft_nodes`, `ft_relationships`, `ft_relationships_names`, `ft_gettable_users_email`, `ft_gettable_users_id_email`.

The design is in `../docs/design/handoff/family-tree-visual-identity/project/` (`Mobile.dc.html`, `MobileHandoff.dc.html`, `tokens.json`).

## Run it

```sh
cd mobile
yarn install
yarn start            # Metro; needs a development build, not Expo Go (native modules)
yarn android          # expo run:android: builds and installs a debug build
yarn ios              # expo run:ios (macOS)
```

The `android/` and `ios/` folders are generated (Continuous Native Generation) and git-ignored. `expo run:*` or `npx expo prebuild` creates them.

## Checks

```sh
yarn typecheck        # tsc --noEmit
yarn test             # jest (jest-expo): pure logic in src/lib
yarn bundle:android   # expo export → /tmp/ft-export-android
yarn bundle:ios       # expo export → /tmp/ft-export-ios
```

Typed routes (`experiments.typedRoutes`) are generated into `.expo/types` the first time `yarn start` runs. Until then `tsc` checks routes as plain strings.

`npx expo-doctor` reports one warning on this machine: a duplicate `react` from `../node_modules`, the web app's install in the repo root. Metro resolves everything from `mobile/node_modules` first, and autolinking is limited to `./node_modules` (`package.json › expo.autolinking`). EAS never installs the root, so builds there are not affected.

## Builds (EAS)

`eas.json` has the same profiles as the other Expo apps:

| profile       | output                                  |
| ------------- | --------------------------------------- |
| `development` | dev client, APK / iOS simulator         |
| `preview`     | internal distribution, APK / simulator  |
| `production`  | store build (AAB / IPA), auto-increment |

```sh
npm i -g eas-cli
eas login
eas init                                   # still to do: links the project, writes extra.eas.projectId + owner into app.json
eas build --profile development --platform android
eas build --profile preview --platform all
eas build --profile production --platform all
eas submit --profile production --platform ios|android
```

**Still to do: `eas init`.** `app.json` has no `extra.eas.projectId` and no `owner` yet, on purpose. Run `eas init` once from `mobile/` and commit the change. iOS also needs the Apple team (EAS asks, or add `ios.appleTeamId`).

Identifiers: name **Family Tree**, slug `family-tree`, scheme `familytree`, bundle id / package `pl.cyberman.familytree`.

## App assets

PNG icons in `assets/` are rendered from the SVGs in `assets/svg/`, which are copied from the design handoff with their C2PA metadata removed. To regenerate them:

```sh
yarn icons            # scripts/build-icons.sh: rsvg-convert, or Inkscape as a fallback
```

Theme values in `src/theme/tokens.ts` are generated from the handoff `tokens.json`:

```sh
node scripts/gen-tokens.js [path/to/tokens.json]
```

## Backend URL (screenshots / demo backend)

The PocketBase URL defaults to `https://pocketbase.cyber-man.pl`. Set `EXPO_PUBLIC_POCKETBASE_URL` to point a build at a different backend. Expo copies the value into the bundle at build time:

```sh
EXPO_PUBLIC_POCKETBASE_URL=http://10.0.2.2:8090 yarn start     # Android emulator → host machine
```

Cleartext HTTP is **not** enabled in `app.json`. For a screenshot build against an `http://` backend, set `FT_SCREENSHOT_BUILD=1` when running `expo prebuild`: `app.config.js` then turns on cleartext through `expo-build-properties`. Store builds never set it, so they stay HTTPS-only.

## Account deletion and privacy

- Settings → **Delete account** asks for confirmation, then opens a screen where the user types `DELETE`. It works exactly like the web (`../src/lib/account.ts`): each tree the account created is deleted with its relationships and people, then the `ft_users` record is deleted, then the device is signed out and wiped. It needs a connection. If a server step fails, the screen shows the error and an **Email a deletion request** button (mailto `family-tree@cyber-man.pl` with the account email).
- Settings → **Privacy policy** and the sign-up screen link to `https://family-tree.cyber-man.pl/privacy`.

## Language and theme

- **Language:** English or Polish. It follows the device (`expo-localization`) unless you pick one in Settings → Appearance or with the switch on the onboarding and sign-in screens. The strings live in `src/i18n/en.ts`, the source of truth. `src/i18n/pl.ts` is typed as the same `Dict`, so a missing Polish key is a compile error. Polish plurals use `Intl.PluralRules` when the engine provides it, with the same CLDR rules built in as a fallback. Month names come from the dictionaries, not from Intl, because Hermes' Intl coverage varies.
- **Theme:** System / Light / Dark, in the same places. The choice applies app-wide at once, status bar included.

## People linked to accounts

`ft_nodes.note` (free text) and `ft_nodes.user` (the account this person is) can be edited in Add/Edit person. The account list shows the tree's creator and invitees. "This is me" uses the server link when one exists; the on-device pick is only a fallback. On trees you own, picking yourself offers to save the link on the tree.

## Deep links

- `familytree://tree/<treeId>` makes that tree active and opens the Tree tab.
- `familytree://tree/<treeId>/person/<personId>` does the same and opens the person sheet. Reminder notifications open this link.

## What lives on the device only

- **"This is me"** (per tree), used by "How are we related". The design proposes `ft_trees.meNode`, but the backend does not have it, so the app stores the choice locally (AsyncStorage, `ft.settings`).
- **Reminders.** All reminders are local notifications, scheduled from the birth and death dates of the active tree, capped at 60. They are opt-in: the app asks for permission only from onboarding or the first "Remind me".
- **Read-only offline copies of opened trees**, so trees can be viewed offline. Changes need a connection: while offline, write actions are disabled with a hint. A failed save keeps the form open with the input intact and a "Try again" button. Creates use record ids generated on the phone, so retrying a submit whose response was lost never makes a duplicate.
- **Auth token**, kept in expo-secure-store (split into chunks because of SecureStore's size limit). Its expiry is checked on the phone before every request and when the app returns to the foreground; the app refreshes the token when it is close to expiry. PocketBase answers an expired token as a guest, not with an error, so this can't be left to the server.
