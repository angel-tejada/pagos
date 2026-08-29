# CLAUDE.md

## What this is

A payment tracker for one person. It tracks who owes money, what they've
borrowed, and what they've paid back. The interface is in Spanish. It runs on an
iPhone via "Add to Home Screen" and works fully offline.

## Scope rule — the most important one

Do exactly what is asked. Nothing more. Do not add features, rename things,
restructure layouts, or "improve" anything that was not explicitly requested.
If something else seems like it should change, say so in one sentence and wait
for the user to decide. Changing things they did not ask for wastes their time
and breaks things that were working.

## Hard rules

- Everything stays in one file: `pagos.html`. HTML, CSS, and JavaScript all inline.
- No frameworks, no npm, no build step, no external files, no CDN links.
- Data saves to `localStorage`. Nothing leaves the phone.
- Interface text is Spanish only.

## About the user

- Not a coder. Explain changes in plain English — no jargon.
- Say what you're about to do before doing it.
- Keep responses short.

## Workflow

- After the user approves a change, commit and push to GitHub automatically.
- The site is live at https://angel-tejada.github.io/pagos/pagos.html via GitHub Pages.



# Pagos — Project Rules

Read this before every task. These rules override any instinct to "improve" things.

---

## What this app is

Pagos tracks money other people owe you. One list of people, one balance each, a
history of what they borrowed and what they paid back. That is the entire product.

It exists because the simple debt trackers on the App Store all disappeared or turned
into $10/month subscriptions stuffed with features nobody asked for. Simplicity is the
product, not a limitation of it.

**Target user:** someone in their 50s or 60s who wants a notepad with math. Not a
finance nerd. Big text, obvious buttons, no jargon, no onboarding, no tutorial.

---

## Hard rules — never break these

### 1. Every string exists in Spanish AND English
The app ships bilingual. There is one strings file with `es` and `en` objects.
If you add a string to one, you add it to the other in the same edit. Never leave an
English string hardcoded in a component. Spanish is the default language.

### 2. Money is stored as integer cents — never floats
`4.99` is stored as `499`. All math is integer math. Format to dollars only at the
moment of display. Floating point money bugs are silent and unforgivable in this app.

### 3. Never change the saved data shape without a migration
Real people have real balances saved on their phones. If a field name or structure
changes, write a migration that upgrades old data first. Never ship a change that makes
existing data unreadable. When in doubt, add a field instead of renaming one.

### 4. No accounts, no login, no server, no cloud
Data lives on the device. Nothing is uploaded anywhere. No sign-in screen, ever.
If a feature needs a backend, it does not go in this app.

### 5. No Face ID / passcode lock
Deliberate decision. Do not add it, do not suggest it.

---

## Features that are banned

These are what killed the competition. Do not add them, do not suggest them, do not
"prepare for them" with extra structure:

- Splitting expenses between multiple people
- Groups, folders, or shared ledgers
- Interest calculation on loans
- Recurring or scheduled entries
- Bank account linking or payment processing
- Anything social, or anything the other person has to approve
- Onboarding flows, tours, or tooltips
- Subscriptions

---

## Tech

- Expo (React Native) + TypeScript
- Developed on Windows. **There is no Mac.** Never suggest anything requiring Xcode.
- Builds and App Store submission run through EAS cloud builds
- Testing happens on a physical iPhone via Expo Go / dev build
- Local storage on device — no backend of any kind

---

## Feature scope — v1

The app must do these and nothing more:

1. **List of people** with what each one owes, sorted by amount. Grand total at top.
2. **Add a person** — either pick from phone Contacts or type a name manually.
   Contacts is the primary path; typing is the fallback.
3. **Two actions per person:** they borrowed money (balance up), they paid me back
   (balance down). Number pad, big digits, two buttons. This is the core screen.
4. **Optional note per entry** — "cash", "Zelle", etc. One short line, optional.
5. **Optional due date per entry** — off by default, toggle on, pick a date, get a
   local notification. Never on unless the user turns it on.
6. **Currency picker** — per person. Default USD. Amounts format to the chosen currency.
7. **History per person** — newest first, date and time, delete any entry.
8. **Share as PDF** — generates a clean summary of one person's balance and full
   payment history, sent through the iOS share sheet. Generated on-device. No server.
   App name appears at the bottom of the PDF.
9. **Import** — can read the JSON backup file from the old web version.

**v1.1 and later, not now:** home screen widget, Android.

---

## Monetization rules

**Free tier:** everything works, up to **12 people**. All features, no limits other
than the person count.

**Paid unlock:** one-time **$4.99** in-app purchase. Removes the 12-person limit and
removes all ads, permanently. No subscription. Ever.

**Ads:**
- One banner, bottom of the main list screen only. Never on the detail screen. Never
  on the number pad.
- One app-open ad on launch, with a **4-hour cooldown**, and **never on the very first
  launch after install**. Static/image creatives only — no video.
- Both disappear the moment someone pays.

**Ratings:** use Apple's native review prompt only. Fire it when a person's balance
hits zero — the moment they got paid back. Never more than Apple's limit allows.
**Never offer any reward, discount, or feature in exchange for a rating.** It is against
Apple's rules and the API gives no confirmation that a rating happened anyway.

---

## Design principles

- **Big and obvious over dense and clever.** Large amounts, large tap targets.
- **Green = they owe you more. Red = they paid you back.** Consistent everywhere.
- **Two taps to log a payment**, from opening the app. Never more.
- Zero balance should feel good — that's the app's happy moment.
- No modal stacking, no nested menus, no settings screen full of switches.
- Native iOS feel. Use standard components. It should not look like a website.

---

## When you're unsure

Ask before adding. The default answer to "should this app also do X" is no.
The bar for a new feature is: *would a 60-year-old tracking five loans need this?*