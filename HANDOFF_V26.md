# KWAK TAEWOONG PORTFOLIO — HANDOFF V26

## Current design direction
V26 treats the V25 home page as the canonical design language: monochrome / metallic editorial, rectangular artwork, strong display typography, fine-line grids, restrained orbital graphics. Do not reintroduce per-project neon themes or generic Steam-like card UI.

## Narrative rule
Projects are intentionally ordered 01 → 05. The order is not a ranking. It is a chronological design-development narrative: the portfolio should make improvement visible rather than hide weaker early work.

01 Benedict of Sins → 02 Salgut → 03 Fernand → 04 De.Co → 05 Machinator

## Home
- Hero is considered stable. Prefer refinement over adding more decoration.
- About copy is a provisional V26 draft and can be replaced once final biography/content is ready.
- Resume is intentionally presented as COMING SOON until `assets/resume.pdf` exists.
- Project timeline rows link directly to details.
- Portfolio slider is chronological 01 → 05.
- Small metadata typography has been increased.
- Accessibility: skip link, focus-visible, keyboard timeline navigation.

## Work Index
`projects/index.html` is now a comparative chronological index, not a duplicate image-card grid. It should remain useful even when the home page already exposes all five projects.

## Project detail template
All five project pages share one visual system and one `project-detail.css`.
Intended reading order:
1. Case Study Hero
2. Overview + Facts
3. Design / System chapters
4. Media
5. Role / Responsibility
6. Reflection
7. Previous / Next project

Project images are intentionally untouched. Missing or placeholder media is content work, not a V26 design defect.

## Files that matter
- `index.html` — home content / structure
- `redesign.css` — home presentation
- `script.js` — home interactions
- `site-core.css` — shared global/header/accessibility layer for project pages
- `projects/index.html` — Work Index
- `projects/project-detail.css` — unified project + archive presentation
- `projects/project-detail.js` — media fallbacks, YouTube, back fallback, image lightbox
- `V26_CHANGELOG.md` — exact V26 changes

## Next recommended work
1. Replace provisional About copy with final personal biography only after the visual system is approved.
2. Populate unique overview/screenshots and resume when assets are ready.
3. Rewrite each detail page toward stronger decision evidence: problem → constraint → decision → rule/numbers → iteration → result.
4. Add real result/validation evidence where available (playtest findings, changed values, before/after diagrams).
5. Perform dedicated mobile pass after desktop content/design lock, as intentionally deferred in V26.
6. Consider consolidating `redesign.css` further only if home markup changes substantially; project detail legacy cascade has already been removed.
