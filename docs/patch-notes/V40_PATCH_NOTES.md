# V40 Patch Notes

- Intro boot is shown once per browser tab/session. Reloading the same tab does not replay it.
- Ordinary cross-document navigation uses a ~100 ms Liquid seam; project card/detail transitions keep their image-continuity system.
- HERO → FEATURED seam retuned; the old top radial blob was removed.
- FEATURED intro copy shortened and balanced to avoid awkward Korean line breaks.
- ALL PROJECTS / MORE ABOUT ME / ALL JOURNALS now share a larger, clearer CTA affordance. MORE ABOUT ME moved to the top-right toolbar of ABOUT.
- Project detail external shortcut icons added: Kinosis (service), Salgut/Benedict (download), De.Co/Fernand (GitHub).
- Hourly Naver Journal sync no longer rewrites journal.json when posts are unchanged, preventing hourly sync commits.

- Initial branded boot now appears once per browser tab/session only; reloads and internal navigation do not replay it.
- Ordinary cross-document navigation uses a ~100 ms Liquid visual seam; project card/detail transitions keep their image-continuity transition instead.
- FEATURED top seam was softened/extended and the desktop intro sentence is kept on one line where space allows.
- `ALL PROJECTS`, `MORE ABOUT ME`, and `ALL JOURNALS` share a larger, consistent CTA affordance.
- Project detail Hero shortcuts now support multiple icon actions: Benedict and Salgut expose Download + GitHub; Kinosis exposes Website + GitHub; Fernand and De.Co expose GitHub.
