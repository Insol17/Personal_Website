# V49 PATCH NOTES

## Project detail → source return hotfix

- Fixed a regression where returning from a project detail page could leave the portfolio covered by a full-screen project image with no usable UI.
- Added a dedicated reverse-transition owner: `scripts/project-return-v49.js`.
- Disabled the older V45 reverse restore when V49 is present to prevent two return systems from competing.
- The return cover now hands off immediately to a real `<img>` transition clone before the pseudo-element overlay is removed.
- Added a 3-second hard fail-safe so a runtime error can never leave the page trapped behind the transition image.
- Preserves the source surface:
  - FEATURED → detail → FEATURED
  - WORKS → detail → WORKS
  - ALL PROJECTS → detail → ALL PROJECTS
- Keeps the existing forward project transition and V48 staged detail-page entrance unchanged.
