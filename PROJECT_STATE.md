# Pagos project state

Last verified: 2026-08-29 (America/New_York)

Everything below was checked against the code in this session. The previous
version of this file claimed the data layer was "not started" while
`src/data/store.tsx` already existed and worked — do not trust a claim here that
you have not re-verified.

## How this ships

- Standalone EAS `preview` build on a physical iPhone. No Metro, no tunnel.
- JavaScript-only changes ship over the air: `npx eas-cli update --branch preview
  --platform ios --environment preview --non-interactive`. `--platform ios` is
  required or the export tries to bundle for web and fails on `react-native-web`.
- Native changes (new native dependency, app config, plugins) need a full
  `npx eas-cli build --platform ios --profile preview` and a reinstall.
- `runtimeVersion` uses the `fingerprint` policy, so an installed build silently
  ignores an update it cannot run rather than crashing.

## What works

- **Data layer** (`src/data/store.tsx`) — AsyncStorage persistence, schema
  version 1, integer cents throughout, type validation on load, add / rename /
  delete / restore. A new install starts empty.
- **Bilingual strings** (`src/i18n/`) — language choice persists. Parity is
  compiler-enforced: `en` is typed as `Strings = typeof es`, so adding a key to
  one language without the other fails the build.
- **Theme** (`src/theme.ts`) — light and dark palettes behind a context; screens
  build their StyleSheet from the active palette via `useStyles`. Follows the
  device setting.
- **Money formatting** (`src/data/format.ts`) — `$1.234,56` in Spanish,
  `$1,234.56` in English, done by hand rather than through Intl because Hermes
  and Node disagree and Spanish CLDR drops the separator for four-digit numbers.
  The parser accepts either separator style. Round trips verified.
- **Screens** — list with grand total and the free-limit notice, people A–Z,
  person detail with history, entry with amount / currency / person / note /
  due date.
- **Send balance** — composes a short neutral summary and opens the share sheet.
  The user sends it themselves; the other person is never notified.
- **Share PDF** — per-person balance and full history, rendered on device,
  app name at the bottom, user text HTML-escaped.
- **Backup and restore** — `src/data/files.ts`, wired into Options. Restore
  confirms before overwriting. Legacy `pagos.html` JSON import is implemented in
  `parseLegacyData` but has not been exercised against a real old backup file.
- **Due-date reminders** — schedule a local notification at noon on the due
  date and store the identifier so deleting the entry cancels it. Permission is
  requested when a reminder is set, never at launch.
- **Deletes** — every delete has a visible labelled control. Nothing is
  swipe-only.

## Not built

- **No monetization code at all.** No ads, no AdMob, no banner, no in-app
  purchase, no purchase restore. The 12-person limit is *displayed* but not
  enforced — enforcing it before a purchase path exists would strand users.
- **No review prompt** at zero balance.
- **No find-a-person** search or A–Z toggle (scope item 12).
- **Green/red semantics are not implemented.** Every amount renders in the pink
  accent; `up` and `down` in the palette are both red. CLAUDE.md calls for green
  = they owe you more, red = they paid you back. This is a deliberate open
  question, not an oversight.
- No automated tests. Money formatting was verified by a throwaway script, not a
  checked-in suite.

## Known gaps and risks

- Existing installs still hold the sample people (Juan, María) that earlier
  builds wrote into storage. Removing the seed only affects fresh installs;
  delete them by hand on a device that already has them.
- `parseLegacyData` is untested against a real export from `pagos.html`.
- Reminder scheduling has not been confirmed firing on a physical device.
- The App Store description must state the 12-person limit before launch.

## Test and build status

- `npx tsc --noEmit`: PASS
- `npx expo export --platform ios`: PASS
- Money format/parse round trips: PASS (throwaway script, not committed)
- No device QA was possible from this machine; every UI change needs a look on
  the iPhone.
