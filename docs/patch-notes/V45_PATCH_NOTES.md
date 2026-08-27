# v45 patch notes

## HERO / WORLDS
- Replaced the previous block/gradient wordmark with the requested Yellowtail calligraphic `WORLDS`.
- `WORLDS` is white only: no purple/pink/teal body gradient and no geometric overlays.
- Kept the directional liquid displacement and white droplet/splash interaction from the supplied calligraphy demo.
- Forced the v45 wordmark to initialize after all legacy v42-v44 HERO engines so an older cached engine cannot remain as the final visual.
- Hid legacy WORLDS engines until v45 takes ownership to prevent a one-frame block-font flash.
- Kept `I DESIGN` centered and reduced its weight.

## Project transition v45
- Replaced sessionStorage-dependent source/return state with URL-carried transition state.
- This is specifically intended to keep the transition working when previewing by opening `index.html` directly with `file://`, where storage/origin behavior is unreliable.
- Forward: source card image -> fullscreen (390 ms) -> destination starts with the same fullscreen image surface -> real detail hero releases quickly.
- Reverse: detail scroll position -> smooth return to detail hero -> detail UI fades -> destination opens with fullscreen image already present -> image shrinks to the exact source surface (430 ms).
- Source surface is preserved: FEATURED returns to FEATURED, WORKS to WORKS, archive to archive.
- Detail-to-detail navigation preserves the original source surface.
- If a FEATURED-origin chain lands on a project that is not featured, return stays in FEATURED without faking a morph into a different cover.
- Directly opened detail pages fall back to the current project's WORKS card instead of HERO.
- Legacy transition storage is cleared before old v41-v44 transition boot code can activate.
- V45 replaces the project transition binder before project cards render, while preserving WORKS drag click-suppression.

## Admin / templates
- Existing six project detail pages load `project-detail-v45.css/js`.
- New Admin-created project pages are migrated to v45 detail assets.
- Default content version bumped to 45.
- `user-content/` is not included in the patch package.
