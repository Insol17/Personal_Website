# v37 — Boot / Mobile / About / Liquid Glass Background

## Boot
- Main entry always renders a Hero-matched boot surface for at least ~0.58 s.
- Uses the same liquid poster so it dissolves into the Hero instead of flashing to a different screen.
- Internal project return transitions bypass the boot surface so reverse continuity is not interrupted.
- 2.5 s CSS fail-safe prevents a stranded boot layer if runtime initialization fails.

## Mobile UX
- Rebuilt navigation as a compact brand + menu button with a large touch menu sheet.
- WORKS switches from pointer-captured desktop dragging to native horizontal touch scrolling + scroll snap on coarse/small screens.
- Rail progress follows native scrollLeft and project clicks remain native touch targets.
- Hero typography, About, Background, Journal, Contact, archive, Journal index, and project case-study layouts received dedicated mobile rules rather than scaled desktop rules.
- Project detail typography and media stacks are optimized for 390–760 px widths and 44 px-class touch targets.

## About
- Added CURRENT PRACTICE with Systems / Combat / UX / Direction to increase information density without duplicating credentials.
- Mobile hierarchy collapses this content to two columns, then one column on very narrow phones.

## Background
- BACKGROUND now sits on a translucent ~90% paper-glass surface above a second instance of the Hero liquid video.
- The video is paused by default and only plays near the section via IntersectionObserver.
- Blur, highlight, border and shadow are tuned to read as an actual opaque glass sheet with motion visibly behind it.
- Reduced-motion users receive the poster instead of a playing background video.

## Compatibility
- Admin-generated project pages migrate to v37.css / v37.js / project-detail-v37.*.
- Existing user-content remains external to patch ZIPs and is not overwritten.
