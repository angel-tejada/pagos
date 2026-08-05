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
