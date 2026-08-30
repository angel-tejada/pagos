# Pagos — Project Rules

## Before you do anything: read `PROJECT_STATE.md`

**Every session starts by reading `PROJECT_STATE.md`, and every task ends by
updating it.** Both, every time — including tasks that change no code, and
including tasks where the user did not mention it.

`PROJECT_STATE.md` carries the things this file cannot: what is half-finished,
what is broken right now, what has never been tested on the device, why a
design decision was made so you do not undo it, and the traps that have already
cost hours. Skipping it is how a session re-derives decisions that were already
settled, or reverses one on the assumption it was an oversight.

This instruction has been ignored before. If you are about to write a final
response and have not updated `PROJECT_STATE.md`, you are not finished.

---

Read this before every task. These rules override any instinct to "improve" things.

Research backing for many of these decisions is in `research/market-analysis.md`
(12,217 harvested App Store and Play reviews). Where a rule below cites evidence,
that is where it comes from. Do not overturn an evidence-backed rule without
better evidence.

---

## What this app is

Pagos tracks money other people owe you. One list of people, one balance each, a
history of what they borrowed and what they paid back. That is the entire product.

It exists because the simple debt trackers on the App Store all disappeared or turned
into $10/month subscriptions stuffed with features nobody asked for.

**Target user:** someone in their 50s or 60s who wants a notepad with math. Not a
finance nerd. Big text, obvious buttons, no jargon, no onboarding, no tutorial.

**The job we serve:** a person lent real money to family or a close friend and is
afraid of losing both the money and the relationship. Not bill splitting. Not
merchant receivables. Those are different products.

---

## Hard rules — never break these

### 1. Every string exists in Spanish AND English
One strings file with `es` and `en` objects. Add to one, add to the other in the same
edit. Never hardcode an English string in a component. Spanish is the default.

### 2. Money is stored as integer cents — never floats
`4.99` is stored as `499`. All math is integer math. Format to currency only at
display time.

### 3. Number formatting follows the locale
Spanish convention is `1.234,56`. English is `1,234.56`. Storage is unaffected; this
is display only. *(Evidence: direct review complaint — "que tan difícil es poner , y .")*

### 4. Never change the saved data shape without a migration
Real people have real balances on their phones. If a field changes, write a migration
that upgrades old data first. When in doubt, add a field rather than rename one.

### 5. Backup and restore are permanent features — never remove them
Losing the ledger is the #1 complaint in this category: 9.1% of low reviews for
one-to-one debt trackers, vs 1.2% for bill splitters. Competitors have reviews reading
"years worth of data gone." A local file export the user drops in Files or iCloud
Drive is the whole requirement — no account, no server. Also tell the user in the app
that their data is included in their iPhone backup, because the fear does as much
damage as the risk.

### 6. No accounts, no login, no server, no cloud sync
Data lives on the device. Nothing is uploaded. If a feature needs a backend, it does
not go in this app.

### 7. No Face ID / passcode lock
Deliberate decision. Do not add it, do not suggest it.

### 8. Nothing appears between opening the app and saving an entry
No ad, no interstitial, no upsell, no prompt. Ever. The highest-upvoted negative
review in the entire Spanish corpus is about ads at the moment of entry: "a cada
asiento hay un anuncio... desintalada." This rule outranks any monetization goal.

---

## Features that are banned

These are what killed the competition. Do not add them, do not suggest them, do not
"prepare for them" with extra structure:

- Splitting expenses between multiple people
- Groups, folders, or shared ledgers
- Interest calculation on loans
- Recurring or scheduled entries
- Bank account linking or payment processing
- Anything the other person must install, approve, or dispute
- Anything targeting merchants or business clients
- Onboarding flows, tours, or tooltips
- Subscriptions

---

## Tech

- Expo (React Native) + TypeScript
- Developed on Windows. **There is no Mac.** Never suggest anything requiring Xcode.
- Builds and App Store submission run through EAS cloud builds
- Testing happens via a standalone EAS build on a physical iPhone, with
  over-the-air updates for JavaScript changes
- Local storage on device — no backend of any kind

---

## Feature scope — v1

1. **List of people** with what each one owes, sorted by amount. Grand total at top.
2. **Add a person — typing the name is the primary path.** Importing from Contacts is
   an optional secondary action, never a wall at first run. *(Evidence is thin — two
   reviews — but the permission prompt is a real first-run barrier.)*
3. **Two actions per person:** they borrowed money (balance up), they paid me back
   (balance down). Number pad, big digits, two buttons. This is the core screen.
4. **Optional note per entry** — "cash", "Zelle", etc. *(Directly requested in reviews.)*
5. **Optional due date per entry** with a local notification. Off by default.
   Reminders must actually schedule — currently they only cancel.
6. **Currency picker** per person. Default USD.
7. **History per person** — newest first, date and time, delete any entry. Delete must
   have a visible control, not swipe-only.
8. **Send balance** — one tap on a person's screen produces a short, neutral,
   pre-written summary ("Hola María — resumen al 29/08: prestado $340, pagado $100,
   saldo $240") and drops it into the iOS share sheet. **The user edits and sends it
   themselves.** No notification to the other person, nothing social, nothing automatic.
   *(Export/share is the most-praised capability in the category: 289 mentions, 19% of
   positive reviews. No direct competitor does this well.)*
9. **Share as PDF** — the long-form version of #8: full balance and payment history,
   generated on-device, sent via the share sheet. App name at the bottom.
10. **Backup and restore** — see hard rule 5.
11. **Import** the JSON backup from the old web version.
12. **Find a person** — search or A–Z toggle, with amount-sort as the default.

**Later, not now:** home screen widget, Android, receipt photos, instalment display.

---

## Monetization rules

**Free tier:** everything works, up to **12 people**. No other limits.

**This is a scope limit, not a rate limit, and that distinction is load-bearing.**
Splid caps the free tier at one group and draws almost no complaints (1–2% low-star).
Splitwise caps daily entries and 36% of its low reviews are about it (51% low-star).
Never limit how often someone can log an entry. Only how many people they can track.

**The limit must be visible before the user adds person #1**, and stated in the App
Store description. A cap discovered after work reads as a scam.

**Paid unlock:** one-time **$4.99**. Removes the 12-person limit and all ads,
permanently. No subscription. Ever. *(82 unprompted requests for one-time pricing in
the corpus; every subscription-adopting competitor took reputational damage.)*

**Ads:**
- One banner, bottom of the main list screen only. Never on the detail screen. Never
  on the number pad. Never during a logging session — see hard rule 8.
- **No app-open ad. No interstitials.** Removed deliberately on evidence.
- Ads disappear the moment someone pays.

**Ratings:** Apple's native review prompt only, fired when a person's balance hits
zero. **Never offer any reward, discount, or feature in exchange for a rating** — it
is against Apple's rules and the API gives no confirmation a rating happened.

---

## Design principles

- **Big and obvious over dense and clever.** Large amounts, large tap targets. Older
  users need roughly 64px steering targets; WCAG AAA floor is 44×44.
- **Support light mode and follow the system setting.** Dark-only is wrong for aging
  vision, and our target user is 50s–60s.
- **Green = they owe you more. Red = they paid you back.** Consistent everywhere.
- **Two taps to log a payment**, from opening the app. Never more.
- Zero balance is the app's happy moment — that's where the review prompt fires.
- No modal stacking, no nested menus, no settings screen full of switches.
- Words over icons. Native iOS feel. Use standard components.
- **Every visible control must do something.** No dead buttons.

---

## When you're unsure

Ask before adding. The default answer to "should this app also do X" is no.
The bar for a new feature is: *would a 60-year-old tracking five loans need this?*