# CLAUDE.md

## What this is

A payment tracker for one person. It tracks who owes money, what they've
borrowed, and what they've paid back. The interface is in Spanish. It runs on an
iPhone via "Add to Home Screen" and works fully offline.

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
