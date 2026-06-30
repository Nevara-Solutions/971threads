# 971 Threads — Project Rules

This is a **Shopify theme** (customized **Dawn**) for **971 Threads**, a UAE streetwear brand selling **t-shirts and hoodies**. Read and follow these rules every session.

## The store / themes
- Brand is **live and public at `971threads.com`** (store `qdczz8-ep.myshopify.com`). The **live theme is "Horizon"**.
- **Our work is in this local Dawn theme**, previewed via `shopify theme dev --store qdczz8-ep.myshopify.com` (a hidden *development* theme — it does NOT touch the live store).
- **NEVER push or publish to the live store** (`shopify theme push` to live / publishing a theme) **without explicit user + boss confirmation.** It's a public, hard-to-undo change. Building in the dev sandbox is always safe.
- Products / collections / Files / orders are **store-level** (shared across themes) — switching themes never deletes them.

## Brand voice — applies to ALL copy you write
Whenever you write headings, descriptions, button labels, alt text, or any user-facing text, it MUST be in the 971 Threads voice:
- **UAE-rooted streetwear.** Lean on "971", "the 971", **"From Sands to Street"** (the tagline).
- **Products are tees & hoodies only.** Don't invent other categories (no "outerwear", "accessories") unless the user says so.
- **Limited-drop energy:** scarcity, "limited runs", "no restocks", "don't sleep on it".
- **Quality cues:** "heavyweight cotton", "relaxed fit", "built to last".
- **Currency = AED**; shipping references = UAE (e.g. "Free shipping across the UAE over AED 200").
- Tone: confident, short, street — not corporate. Avoid generic filler like "Look good and feel great".
- Never leave Dawn's default placeholder copy ("Browse our latest products", "Talk about your brand") in place.

## Design direction
- **Light mode** base (white), matching the black/grey logo. Dark accents (announcement bar, hero scrim) are fine.
- Berlin-inspired editorial layout: centered logo nav (nav-left / logo-center / icons-right), full-bleed hero **slideshow**, generous whitespace.
- **Fonts (self-hosted, defined once as CSS variables in `layout/theme.liquid`):**
  - `--font-display-family: 'Anton'` → hero / big statement titles only
  - `--font-heading-family: 'Inter'` (700) → section titles, nav, labels
  - `--font-body-family: 'Inter'` (400) → body / paragraphs
  - To change a font, edit the variable in `theme.liquid` once — don't hardcode font names in sections (except the `@font-face` declarations).

## Images
- Use **Unsplash** (commercial-licensed, free) or the user's own product shots. Files live in `assets/`.
- **NEVER scrape images from paid themes** (e.g. the Berlin demo) — they're licensed and would be a copyright risk on a live store.
- Custom sections (hero, lookbook) can use `assets/` images as fallback defaults. Dawn's `image_picker` sections (hero banner, etc.) can only use images uploaded to Shopify Files.
- Keep hero/lookbook imagery **lifestyle** (people wearing tees/hoodies), tonally consistent — not studio flat-lays.
- **Images MUST be on-brand: t-shirts and hoodies only.** No leather/denim jackets, dress shirts, suits, or unrelated products — even if a stock photo "looks streetwear." Review every downloaded image (a contact-sheet `montage` is the fast way) and discard anything that isn't a tee/hoodie.
- **Hero images should be dark-toned** so white headline/sub text stays readable; the hero scrim darkens them further. Avoid bright/washed shots for the hero.

## Technical rules & gotchas (learned the hard way)
- **`richtext` settings need block-level HTML.** A `description` of type `richtext` must be wrapped in `<p>…</p>` (or `<ul>/<ol>/<h1>-<h6>`). Plain text → "Setting is invalid" upload error. Plain `text`/`textarea` settings take raw text.
- **`range` setting values must match the schema `step`.** A `range` with `"step": 5` only accepts multiples of 5 (0,5,10…). An off-step value (e.g. 28) → "must be a step in the range" upload error + 500 on the page. When you set a `range` value in a JSON template, check the section's schema `step`/`min`/`max`.
- **Stale error overlay in the preview:** if `theme dev` shows an "Upload Errors" box after you've already fixed the file, it's stale — restart `theme dev` (Ctrl+C, re-run) and hard-refresh (Ctrl/Cmd+Shift+R).
- **Temp-file upload errors** (`*.tmp.*` "must have .liquid extension"): handled by `.shopifyignore`; if they appear, restart `theme dev` so it re-reads the ignore file.
- **Section JS:** put it in an `assets/*.js` file loaded with `<script src=... defer>`, not inline in the section — inline section scripts can silently fail to run on `theme dev` reloads. After adding a NEW asset, restart `theme dev` so it uploads.
- **No horizontal scroll.** Don't use `width: 100vw` for full-bleed — `100vw` includes the scrollbar width and causes a horizontal scrollbar. Dawn sections (`.shopify-section`) are already full-width, so use `width: 100%` instead. (`100vw` is fine inside image `sizes` attributes — that's not layout width.)
- **Always validate before declaring done:**
  - JSON templates: `node -e "JSON.parse(require('fs').readFileSync('<file>','utf8'))"`
  - Theme lint: `shopify theme check` — confirm offense count doesn't rise above the pre-existing baseline.
- **Editing `templates/*.json`:** sections go inside the `sections` object and **every section MUST also be listed in `order`** — orphaned sections (in `sections` but not `order`) cause a "Section id … must exist in order" upload error. To remove a section from a page, delete it from BOTH `sections` and `order` (the section's `.liquid` file stays and can be re-added via the editor). Watch comma/brace placement.
- Commit each working milestone with a clear message (git is local-only; no remote configured).

## Custom sections we've built (don't duplicate)
- `sections/hero.liquid` — full-bleed `<hero-slideshow>` (arrows, dots, autoplay)
- `sections/collection-spotlight.liquid` — left text panel + horizontal product slider (CSS scroll-snap, no JS)
- `sections/marquee.liquid` — scrolling streetwear ticker (not on the homepage; re-add via the Theme Editor or by adding to a template's `sections` + `order`)
- `sections/lookbook.liquid` — editorial image grid
- Header (`sections/header.liquid` + `header-group.json`) — Berlin centered-logo layout, dark rotating announcement bar, blur-on-scroll
