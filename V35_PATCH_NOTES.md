# Personal Website v35

## WORKS / transition
- Removed hidden snap-on-release from the WORKS drag rail. The rail now stays at the exact pixel position where it is released.
- Return state stores and restores both `scrollY` and the exact rail `translateX` value.
- Reverse transition waits until the destination card rectangle is stable across multiple frames before shrinking the fullscreen image.
- The rail is temporarily locked during reverse animation, preventing ResizeObserver/layout changes from moving the target underneath the animation.
- `scrollbar-gutter: stable` prevents viewport-width changes during transition states.
- Added longer HERO → WORKS tonal bridge.
- Arrival boot mask now fades only after the project hero image is decoded and painted.

## Kinosis
- Replaced the low-resolution favicon enlargement with a 1400×2100 high-resolution cover derived from the supplied Kinosis icon design.

## Journal / Naver
- Fixed the GitHub Actions bug where a brand-new `assets/data/journal.json` was not committed because `git diff` does not include untracked files.
- Workflow now stages journal data/media first and tests the staged diff.
- RSS failures and empty feeds now fail the Action instead of returning a false green success.
- RSS fetch retries up to three times.
- Canonical RSS title is preferred; page metadata is used only as a repair fallback when it is more informative.
- Admin `Journal > Blog URL` now doubles as the RSS source. Changing the Naver blog URL and publishing updates the next sync source automatically.
- Main page keeps only `ALL JOURNALS`; `ALL DEVLOG` and `MORE` links were removed.
- DEVLOG and CRITIQUE remain visually separated, each rendering up to three latest items.

## Deployment
- Keep `user-content/` when merging updates.
- After deploying v35, manually run `Actions > Update Naver Journal > Run workflow` once. With the commit detection fix, the first generated `journal.json` will now be committed.
