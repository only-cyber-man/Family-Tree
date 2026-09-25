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

## Deep links

- `familytree://tree/<treeId>` makes that tree active and opens the Tree tab.
- `familytree://tree/<treeId>/person/<personId>` does the same and opens the person sheet. Reminder notifications open this link.

## What lives on the device only

- **"This is me"** (per tree), used by "How are we related". The design proposes `ft_trees.meNode`, but the backend does not have it, so the app stores the choice locally (AsyncStorage, `ft.settings`).
- **Reminders.** All reminders are local notifications, scheduled from the birth and death dates of the active tree, capped at 60. They are opt-in: the app asks for permission only from onboarding or the first "Remind me".
- **Read-only offline copies of opened trees**, so trees can be viewed offline. Changes need a connection: while offline, write actions are disabled with a hint. A failed save keeps the form open with the input intact and a "Try again" button. Creates use record ids generated on the phone, so retrying a submit whose response was lost never makes a duplicate.
- **Auth token**, kept in expo-secure-store (split into chunks because of SecureStore's size limit). Its expiry is checked on the phone before every request and when the app returns to the foreground; the app refreshes the token when it is close to expiry. PocketBase answers an expired token as a guest, not with an error, so this can't be left to the server.
