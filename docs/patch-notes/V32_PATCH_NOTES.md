# V32 Patch Notes

- Entry transition: same image, same luminance at the document boundary; detail overlays fade in after arrival.
- Reduced project-detail vignette strength.
- Custom BACK button now triggers a reverse image transition to the source card.
- Added critical transition-image boot masks to reduce document-swap flashing.
- WORKS drag progress now travels across the full line and reaches the right edge at the end.
- Public pages suppress the native context menu. This is a presentation control, not DRM/security.
- Naver RSS sync now extracts `media:*`, enclosure, description, and `content:encoded` images and best-effort caches them locally during GitHub Actions.
- Journal posts with no image use category fallback artwork; 01/02/03 placeholder numerals were removed.
- Journal dates/categories, background dates/status, contact labels, drag hint, and project detail microcopy were increased slightly for readability.
