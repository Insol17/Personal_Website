# v33 Patch Notes

## Transition reliability

The cross-document effect no longer relies on `history.back()` for the site's BACK button. The detail page stores the source URL/scroll/card state, removes its UI treatment back to the raw project image, and then `location.replace()` returns to the source. The source page paints the same fullscreen image before the document is visually exposed, restores the original scroll/rail position, and then shrinks that image into the matching card.

The implementation also includes:

- image/page prefetch on pointer hover/focus;
- exact boot image in the destination `<head>` before CSS/async content;
- `Element.animate()` with explicit completion and timeout fallbacks;
- BFCache cleanup on `pageshow`;
- best-effort reverse transition when the browser's native Back restores the previous portfolio page;
- automatic cleanup after a failed/missing target so no transition surface can remain stuck.

## Project covers

- **Fernand:** supplied `theme-lunar.jpg`, with only a centered thin `FERNAND` wordmark added.
- **Kinosis:** supplied Kinosis app icon placed as the visual focus of a restrained dark application-cover composition. No fake application UI is generated.

## Journal automation

`.github/workflows/update-journal.yml` now runs at minute 17 of every hour. `scripts/sync_naver_journal.py` pulls the Naver RSS feed and caches discoverable RSS/body images. `scripts/refresh_keepalive.py` updates `.github/journal-keepalive` only when 30 days have elapsed, creating occasional repository activity even when the blog has not changed for a long time.

Portfolio home hierarchy:

1. DEVLOG — latest 3, large cards.
2. CRITIQUE — latest 2, smaller secondary cards.
3. LIFE — not surfaced on the portfolio home; still available in the Journal/Naver Blog.
