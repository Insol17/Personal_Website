# v38 patch notes

- HERO and WORKS are visually and behaviorally unchanged.
- BACKGROUND returns to the previous flat editorial layout; the rounded glass container introduced in v37 is removed.
- A fixed, viewport-anchored copy of the Hero liquid motion now lives behind the page. It continues independently while the foreground scrolls, and is only revealed through BACKGROUND's ~92% opaque frosted surface.
- The fixed liquid phase is synchronized to the Hero video when possible, then continues behind opaque WORKS/ABOUT sections so BACKGROUND feels like a window onto the same distant motion rather than a video attached to the section.
- Reduced-motion users see the poster rather than animated liquid.
- Contact headline changed from “LET’S TALK ABOUT SYSTEMS.” to “LET’S TALK ABOUT WORLDS.”
- Runtime migration also converts the old SYSTEMS wording when it exists in preserved user-content, without overwriting that folder.
