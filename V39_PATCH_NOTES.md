# v39

- Added a three-item FEATURED PROJECTS evidence layer before the existing WORKS archive.
- WORKS remains the same interaction/layout, but now represents the complete visible archive rather than claiming every item is selected.
- Simplified main ABOUT to WHO / WHAT / HOW and added a dedicated `about.html` full profile page.
- BACKGROUND surface opacity reduced by ~5 percentage points (0.915 → 0.865) while retaining the fixed Hero liquid depth layer.
- Added chain-aware project transition state: De.Co → Kinosis → Main preserves the original main viewport/rail origin and returns the current detail image to the correct current project card.
- Added minimal horizontal reveal only when a chained target is outside the restored WORKS viewport. Vertical return position remains the original main position.
- Admin PROJECTS now supports Featured on/off, order, role, and one-line contribution. New projects default to non-featured.
- New project detail shells are migrated/generated against v39 assets.
