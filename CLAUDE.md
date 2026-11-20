# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Jacob Nicholson's design portfolio: a static site of hand-written HTML, one stylesheet ([css/style.css](css/style.css)) and a few vanilla JS files. There is no build step, package manager, linter or test suite. It is hosted on Firebase Hosting (project `portfolio-bacdf`).

## Commands

```sh
firebase emulators:start --only hosting   # serve locally with the production config (cleanUrls etc.)
python3 -m http.server                    # quick alternative; no cleanUrls
firebase deploy --only hosting            # publish (runs the link check first)
npx --yes linkinator@8.1.0 .             # link check on its own
```

The link check is a `predeploy` step in `firebase.json`; its options live in `linkinator.config.json` (Firebase strips quotes from predeploy commands, so keep the command itself free of shell special characters). It crawls the site from `index.html` and blocks the deploy if any internal page, image, video, audio file or `#section` anchor (including dock links) is missing. External sites aren't checked, so a slow or bot-blocking site (LinkedIn always returns 999) can't stop a deploy. To check them by hand: `npx --yes linkinator@8.1.0 . --skip linkedin.com` (a CLI `--skip` replaces the config's).

`firebase.json` sets `"public": "."`, so **every file in the repo root is deployed publicly** unless it is listed in `hosting.ignore`. Add any new non-site file (notes, configs, docs) to that list.

Linting is done in the editor by SonarQube for IDE (rules like `css:S9440`, `Web:S6851`); read its findings through VS Code diagnostics.

## Architecture

**Pages.** `index.html` (home), `case-study-one`…`four.html`, `about.html`. All share `css/style.css`. Case-study pages use the same markup skeleton: `.case-intro` then a series of `.case-row` sections (image/video card + text), each with an `id`.

**Per-project colour.** Each case-study page sets `--case-accent` and `--case-tint` inline on `<body>`. The same accent colours are repeated for the home-page cards in `#case-study-one`…`#case-study-four` in `style.css`, together with `--card-rgb` (used by the hover gradient). Keep these in sync when a colour changes.

**Page dock** (the dot navigation). Markup is duplicated in every page's `<nav class="page-dock">`:
- On the home page each dot links to a home card (`#case-study-…`), and the inline script in `index.html` shows the dock and marks the active dot as cards scroll into view.
- On a case-study page (`.page-dock.on-case`) the current project's `.dock-group.is-open` holds one `.dock-kid` per section `id`. [js/dock.js](js/dock.js) highlights the kid for the section nearest the centre of the screen.
- Dock sizes are all derived from `--dock-dot` in `:root` (see the PAGE DOCK section of the CSS).

So **adding, removing or reordering a project** touches: every page's dock, the home card in `index.html`, the `sentences` and `caseData` objects in the `index.html` inline script (keyed by card index), the `#case-study-N` colour rule in CSS, and the `speculationrules` prefetch selectors. **Adding or renaming a section** on a case-study page means updating its `.dock-kid` link too.

**Home page behaviour** lives in the large inline `<script>` in `index.html`: intro fade, the bouncing "How Might We" dots, and an `IntersectionObserver` that writes each card's "How Might We …?" sentence, year and description into the left column. [js/home-mobile.js](js/home-mobile.js) repositions that text block on phones (≤768px).

**Scroll snapping.** `html` uses `scroll-snap-type: y mandatory` (except `about.html`, which has `class="no-snap"`). Home cards and case-study sections are snap targets; JS that measures "the section in view" assumes centre snapping on desktop and top snapping (offset 56px) on phones.

**Password gate.** [js/gate.js](js/gate.js) is loaded in the `<head>` of case studies one and two only. It is a client-side courtesy lock, not security: page content is still in the HTML. The password is stored as a 32-bit FNV-1a hash of the trimmed, lowercased input; to change it, put the new hash in `HASH`:

```sh
node -e "let h=0x811c9dc5;for(const b of Buffer.from(process.argv[1].trim().toLowerCase()))h=Math.imul(h^b,0x01000193)>>>0;console.log(h.toString(16).padStart(8,'0'))" 'newpassword'
```

**Soundscape.** [js/soundscape.js](js/soundscape.js) runs only on case study three: buttons play `audio/soundscape-*.mp3` and draw a canvas animation, scaled from a 1440px-wide reference.

## Conventions

- Breakpoint is `max-width: 768px` / `min-width: 769px` throughout CSS and JS.
- Motion: every transition or animation gets a matching `@media (prefers-reduced-motion: reduce)` override placed right after the rule; JS smooth scrolling checks the same media query. (The soundscape animation is deliberately exempt, since it only starts when the visitor presses a button.)
- Images live in `images/<page>/`; home cards are in `images/home/`. Content images get descriptive `alt` text, and videos are muted autoplay loops described by `aria-label`.
- JS files are ES5-style IIFEs that exit early when their elements are missing, so they are safe to include on any page.
