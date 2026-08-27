# Personal Website v42

## Design grammar
v42 uses three recurring ideas instead of generic portfolio-card decoration:

- **LIQUID** — the `WORLDS` word is an interactive water-like material. Pointer/touch motion locally separates the letter surface, then spring relaxation rejoins it. Small droplets provide splash feedback.
- **FIELD** — the Hero remains a spatial field rather than a card UI. Contact shortcuts are surfaced as early actions instead of being hidden at the bottom of the closing section.
- **TRAJECTORY** — BACKGROUND is rebuilt as a chronological track with a scroll-progress line, a stable education anchor, and project experience entries.

The WORLDS interaction is adapted only from the font/material/displacement/droplet concepts in the supplied `liquid-worlds-demo.html`; its glass card and blob-field layout are not used.

## Hero
- `I DESIGN` stays in the established site type system.
- `WORLDS` uses Outfit 900 with a translucent white/blue/violet/pink material treatment.
- Pointer/touch motion distorts only the word surface and springs back into place.
- A subtle `MOVE THROUGH WORLDS` / `DRAG THROUGH WORLDS` affordance disappears after first interaction.
- A small automatic ripple on first view signals that the word is interactive without blocking scrolling or adding forced dwell time.
- The animation loop runs only while deformation is active, rather than performing permanent full-canvas work.

## WORKS
The card drag gesture is preserved, but it is no longer the only navigation method.

- Previous / next buttons move approximately one card at a time.
- The previous button disappears at the first position.
- The next button disappears at the final position.
- The progress indicator is now a real draggable thumb.
- Clicking the track moves directly to that position.
- Mobile continues to use native horizontal scrolling while the buttons and range remain available.

## BACKGROUND
The previous generic rows are replaced with a proof-oriented chronology.

- Large editorial BACKGROUND header.
- Sticky EDUCATION / index column on desktop.
- Chronological project experience track on the right.
- A vertical line fills as the user scrolls through the section.
- Status remains visible but subordinate to project title and responsibility.
- The fixed Hero liquid remains behind the translucent surface.
- Mobile disables sticky behavior and becomes one readable vertical trajectory.

## Project detail transitions
- Forward project expansion: ~420ms.
- Hero copy becomes visible as soon as the destination cover has painted; the former ceremonial delay is removed.
- A localized dark radial field sits behind project title/subtitle to improve readability on bright covers such as De.Co without globally crushing the image.
- If BACK is pressed after scrolling down, the page first flows back to the Hero, then Hero copy/vignette disappear, then the existing reverse image transition runs.
- This avoids the previous "fullscreen image suddenly pops over the scrolled content" behavior.
- Reverse contraction duration is reduced to ~420ms.

## CONTACT
MAIL / GITHUB / LINKEDIN / BLOG actions now appear at the top of the closing section, before the large `LET’S TALK ABOUT WORLDS.` statement.

## Admin compatibility
New project pages created/published through Admin continue to use the v41 base detail shell and automatically include the v42 detail CSS/JS bridge.

## Data preservation
`user-content/` is not included in this patch package. Merge v42 over the existing repository instead of deleting the repository contents first.
