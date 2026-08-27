# v36 Journal Title Hotfix

## Root cause
Naver RSS already returned the correct post titles, including titles such as `<살굿> 중간 회고` and `<BENEDICT of SINS> 개발일지`.
The journal sync parser reused the HTML-body cleaner for titles. Its `<...>` tag-removal regex therefore mistook intentional title brackets for HTML tags and deleted them.

Examples of the old corruption:
- `<살굿> 중간 회고` -> `중간 회고`
- `<BENEDICT of SINS> 개발일지` -> `개발일지`
- `<부고니아> 리뷰 외 6편` -> `리뷰 외 6편`
- `<유레카>` -> empty -> `Untitled`

## Fix
- Added a title-specific cleaner that preserves literal angle brackets.
- HTML tag stripping remains enabled only for excerpts/body fragments.
- RSS titles remain canonical; page metadata is only used as a repair fallback.

## After deployment
Run `Actions -> Update Naver Journal -> Run workflow` once. The current RSS entries will overwrite the previously corrupted titles in `assets/data/journal.json`.
