# V20 — WORLD INDEX redesign

## Direction

- Existing text, section order, links, and asset paths are preserved.
- The main page now uses a single `redesign.css` file; project detail pages keep their current styles.
- Design concept: **World Index / Editorial Noir**.
- Visual hierarchy: identity → selected work → profile → capabilities → timeline → portfolio → contact.
- One signal color (`#D8FF57`) is used only for actions, progress, and active states.

## GitHub Pages boot safety

- The boot overlay is hidden by default.
- An inline script enables it only on the first visit in the browser tab.
- The overlay dismisses through inline critical CSS after about 1.7 seconds total.
- It does not depend on `script.js`, so a stale or failed external script cannot trap the page.
- Test with `?boot=1`.

## Files to overwrite/add

- `index.html`
- `script.js`
- `redesign.css` (new)
- `assets/brand/*` if the logo files are not already present

The older `style.css`, `experience.css`, and `design-system.css` may remain in the repository, but the new main page no longer loads them.
