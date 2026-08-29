# Pagos project state

Last verified: 2026-08-29 (America/New_York)

## Current step

The reference-fidelity UI remains in place, and the card/tab collapse reported from the latest device view has been fixed at its source. Home and People cards and both bottom tabs no longer rely on Expo Router `Link asChild` style merging. The code compiles and exports; physical-iPhone confirmation is the remaining UI step. Step 2 data work is still paused and unstarted.

## Completed work

- The original single-file web app remains in `pagos.html` as the legacy implementation and future import source.
- Native Expo setup is committed in `ca32de9`: Expo SDK 57, React Native 0.86, TypeScript, Expo Router, bilingual strings, theme support, and `expo-dev-client`.
- Development-build configuration is committed in `dca1643`: internal physical-iPhone profile in `eas.json`; `npm start` uses an Expo tunnel because LAN access is blocked by the firewall.
- React and `react-dom` remain pinned and resolved at exactly `19.2.3`.
- `AGENTS.md` and this file provide mandatory cross-session continuity.
- The uncommitted native UI fidelity pass includes:
  - Pure black screens, flat `#1C1C1E` cards/inputs, `#FF375F` pink accent, white primary type, reference-scale gray secondary type, and OweMe-like radii and control heights in `src/theme.ts`.
  - Reusable buttons, fields, person silhouettes, empty states, and a seamless black two-item bottom tab bar with original CSS-drawn list/person glyphs in `src/components/ui.tsx`.
  - Home: simple pink settings/add controls, centered Pagos title, free-floating 64px total, approximately 100px separation before the debt section, flat 98px debt cards, pink amounts, and circular overflow controls. A generic double-ring dollar empty graphic replaces the reference's proprietary artwork.
  - People: centered title-only header, flat 91px rows with gray person silhouettes and secondary balances, plus the reference-style two-line empty state.
  - Add Entry: pink text Cancel control, centered New title, 68px amount/currency/person/date controls, reference-matched vertical section spacing, 178px note field, fixed dark footer, and pink primary action.
  - Person chooser: reference-style dimmed overlay, three grouped 64px action rows, separators, and a separate 64px Cancel row.
  - Person Detail: the same black/free-floating-total/flat-card hierarchy, compact history rows, and reference-shaped bottom actions while retaining Pagos debt/payment routing.
  - Options: the existing Pagos-specific bilingual language and backup/export/restore content remains in a dark bottom sheet.
  - All new or changed interface wording exists in both Spanish and English. The Home tab is branded Pagos in both languages.
- The collapsed-container regression was fixed:
  - Cause: Expo Router's native `Link asChild`/Slot merge was wrapping `Pressable` elements whose `style` prop was a callback. Slot treats styles as flattenable objects, so the callback-provided background, dimensions, radius, flex, centering, and gap were not preserved. Text rendered, but Home/People containers disappeared and tab contents collapsed.
  - Home and People now navigate through direct `onPress` router calls on their styled cards. Cards have explicit full width, fixed height, dark-gray background, radius, padding, and clipping.
  - Bottom tabs now navigate through direct `onPress` router calls, divide the full width evenly, place fixed-size icons above labels with explicit spacing, and include the iPhone bottom inset without overlap.
  - Add Entry now gives the form ScrollView the available flex space, automatically adjusts keyboard insets on iOS, adds bottom scroll padding, and prevents the safe-area footer/button from shrinking.

## Step 2 data model status

Not started. There are no native Person/Transaction model definitions, storage service/dependency, schema version, migrations, or legacy JSON importer. Language selection is memory-only. Routes still use explicit sample people/history, and Add Entry/person selection/options actions do not persist or mutate data. Future money values must use integer cents and saved-shape changes must have migrations.

## Expo / EAS development build status

- `app.json` contains EAS project ID `21c5fe80-6999-45e5-bd3d-ac38995042bd` and `ITSAppUsesNonExemptEncryption: false`; these were pre-existing worktree changes preserved through the UI work.
- `eas.json` targets an internal physical-iPhone development client.
- The repository is linked and configured, but local evidence still does not confirm a completed EAS development build, iPhone installation, or on-device execution.

## Test and build status

- `npx tsc --noEmit`: PASS on 2026-08-29 after the card/tab/safe-area fix.
- `npx expo config --type public`: PASS on 2026-08-29 after the fix.
- `npx expo export --platform ios --output-dir .expo/ui-export`: PASS on 2026-08-29 after the fix; production iOS bundle completed with 1,556 modules.
- `git diff --check`: PASS except expected Windows LF-to-CRLF notices.
- No automated test suite is configured.
- No iOS simulator or physical-device visual QA was available in this session.

## Important decisions and constraints

- The screenshots are now the visual specification, not loose inspiration. Visual fidelity takes priority over independent styling, subject to retaining the Pagos brand and avoiding copied proprietary artwork/logo assets.
- Pink is the active UI accent requested by the user. This replaces the rejected first pass's green/coral visual identity but does not change debt/payment logic or stored meaning.
- The task remains UI-only. No contacts, notification scheduling, persistence, backup behavior, transaction behavior, or data-model work was added.
- The app stays bilingual with Spanish default, on-device only, with no accounts/backend/cloud sync.
- Development is on Windows; iOS builds and submission use EAS cloud services and testing targets a physical iPhone.
- Keep the narrow v1 scope in `CLAUDE.md`; do not add unrequested features.

## Unresolved issues and remaining polish

- The fidelity pass needs screenshots from the physical iPhone for a direct side-by-side/overlay check of actual San Francisco font metrics, safe areas, switch rendering, keyboard movement, and device-specific vertical placement.
- Home and People contain the existing two-person sample data, so their empty-state branches are implemented but not visible in the default demo path.
- Add Entry submission, actual person selection, backup/export/restore, and persistence remain deliberately nonfunctional presentation scaffolding until their product steps are authorized.
- `CLAUDE.md` still has a pre-existing uncommitted edit with conflicting legacy web-only and current Expo-native guidance; Expo is established as active by Git history and source, but the stale section awaits user-approved cleanup.
- `main` remains two commits ahead of `origin/main`. Continuity files, EAS linkage, UI work, and the existing `CLAUDE.md` edit are uncommitted.

## Exact next action

Run Pagos in the linked development build on the physical iPhone and confirm that Home/People dark cards render at full width, bottom-tab icons and labels do not overlap, and Add Entry can scroll its note field fully above the safe-area button; then capture screenshots for measured visual comparison.
