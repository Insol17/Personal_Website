# v46 hotfix

- Fixed HERO wordmark race condition. v42/v43/v44/v45 HERO initializers were all present; v42 could re-run after font loading and overwrite the final wordmark.
- V46 explicitly disables all legacy HERO initializers while preserving those files' non-HERO features.
- Exactly one WORLDS engine now owns the second HERO line.
- WORLDS: Yellowtail calligraphy, white-only rendering, subtle white glow/stroke, directional liquid displacement, white droplets.
- I DESIGN remains centered and uses a lighter weight.
