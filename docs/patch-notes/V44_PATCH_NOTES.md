# v44 patch notes

## Hero
- Re-centered the complete `I DESIGN / WORLDS` lockup.
- `I DESIGN` is now white and lighter-weight.
- Rebuilt the Yellowtail `WORLDS` canvas in neutral white glass tones while preserving the directional liquid displacement and splash/droplet interaction.
- Moved MAIL / GITHUB / LINKEDIN / BLOG actions from the closing Contact block into the Hero flow.

## About
- Replaced the long main statement with: `규칙을 설계하고, 플레이어의 선택으로 검증합니다.`
- Reduced the main ABOUT body to one evidence-oriented paragraph.
- Removed the duplicated `HOW I WORK` strip from the homepage.
- Reworked CURRENT PRACTICE into a clearer `WHAT I DO` block with larger, shorter copy.
- Added runtime migration for older saved ABOUT default copy without overwriting `user-content/`.
- Shortened the separate About-page intro/notes as well.

## Project transitions
- Return destination now preserves the source surface: FEATURED → FEATURED, WORKS → WORKS, ALL PROJECTS → ALL PROJECTS.
- Deep-scroll BACK first flows to the detail Hero, fades interface text, then performs the cross-document image return.
- Removed the recent-detail fallback that could incorrectly arm a reverse overlay on unrelated main-page loads.
- Global liquid page transition is explicitly suppressed during project return to prevent the 0.1s blink/flash conflict.
- If a detail chain leaves a Featured project for a non-Featured project, BACK still returns to Featured; when no exact current card exists it uses a surface fade instead of morphing to the wrong card.

## Works rail
- Reimplemented the scrollbar thumb so the exact grabbed point remains directly under the mouse pointer.
- Thumb position and rail translation update synchronously with no left-position interpolation.
- Card drag, arrow buttons, click-on-track, keyboard arrows and mobile native swipe remain available.

## Background
- Keeps the v43 evidence-only structure and separated Education / Project Experience columns.
- Slightly increases timeline detail readability; no explanatory index/commentary blocks were restored.

## Compatibility
- Project shell/template/Admin migration now includes `project-detail-v44.css/js`.
- `defaults/site.json` schema version is 44.
- Patch does not include `user-content/`.
