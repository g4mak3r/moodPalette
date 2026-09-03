# moodPalette

First public showcase release of **moodPalette**, a framework-free chromatic mood generator.

## Highlights

- 54 curated moodlets across 9 color families
- editable 1–6 color palette with direct add/remove interactions
- compact selected-color spec: mood family, live color chip, color name and HEX
- slow ambient color fields and specular glass reflections driven by the active moodlet
- magnetic morphing desktop cursor inspired by iPadOS pointer behavior
- optical glass-lens cursor treatment over color swatches
- nested magnetic glass for the Shuffle icon inside its parent control
- centered hashtag-copy feedback
- supplied custom Shuffle SVG, locked to white
- soft card-breathe feedback on shuffle, add and remove mutations
- pointer tilt without cursor-following card illumination
- desktop and mobile layouts
- keyboard navigation and reduced-motion support
- clipboard fallback for local-file usage
- profanity-free public copy

## Palette interaction

- Hover a color to preview its moodlet.
- Click a color to remove it from the palette.
- The trailing empty `+` swatch appends one random non-duplicate moodlet.
- The `+` swatch remains present at the six-color limit in a disabled state.
- Palette items reflow smoothly when a color is added or removed.
- `+` and `-` keyboard shortcuts mirror add/remove behavior.

## Lighting and material pass

- Removed the cursor-following scene spotlight.
- Removed cursor-position lighting from the main card.
- Ambient color fields now drift independently across the whole scene.
- The main glass panel carries slow autonomous specular reflections instead of tracking the pointer.
- Shuffle magnetic glass receives a slightly stronger tint from the active moodlet while staying visually bare at rest.
- Color swatches retain the stronger optical glass lens above the color surface.

## Controls

- Removed the standalone moodlet-count capsule entirely.
- Shuffle is now the only external generator control.
- The Shuffle button and its nested icon retain magnetic tilt and press feedback.
- The supplied `assets/shuffle.svg` is used directly as an image and remains white.

## Run

Open `index.html` directly or serve the folder with any static HTTP server.

For the live version, GitHub Pages is the recommended distribution format.

- Restored an explicit glass `×` removal affordance on color hover.
- Kept the trailing `+` swatch free of the overlaid optical cursor lens; its magnetic glass now stays below the plus.
- Fixed ambient background lighting being hidden behind the page background and increased the visibility of the slow blur fields.
- Replaced the shuffle asset with the latest supplied SVG exactly; it is rendered directly as the supplied white image.

### Refinement — color identity & shuffle asset

- Integrated the provided white shuffle SVG directly as an image asset (no CSS mask fallback).
- Added a curated name for every palette color.
- Moved color identity into the original top-left status area: mood family first, then a slightly larger live color chip, color name and `#HEX`.
- Removed the redundant large color-identity block below the palette.
- Color name and HEX remain independently clickable and copy their respective values.
- Ambient background drift is ~7% faster while preserving the same calm motion profile.

### UI polish
- Selected-color passport is larger and fully white for clearer readability.
- Swatches no longer keep a persistent selected ring/scale after pointer exit.
- Header metadata replaced by a glass language selector (`Eng` / `Рус`).
- Intro eyebrow now reads `chromatic mood generator`.
- Footer now reads `made by g4mak3r · 2026`.

## Color Atlas / 576

- Expanded the internal color system from 54 entries to **576 unique colors**
- Added **24 semantic color groups**
- Added **English + Russian localization** for every group and every color name
- Preserved the original moodPalette palette as legacy seed colors
- Added OKLCH metadata for all 576 entries
- Added controlled palette generation around anchor / neighbor / contrast groups
- Connected the `Eng / Рус` switcher to group and color-name localization
- Moved the atlas into a standalone `color-atlas.js` data module

## v1.2.0 — Curated Atlas

- Reduced the atlas from 576 generated shades to **192 curated colors**
- Rebuilt taxonomy as **16 mood/aesthetic groups × 12 colors**
- Replaced hue-like group names with DIGITAL / HEAT / POWER / SOFT / NIGHT / ACID / NORDIC / EARTH / OCEAN / BOTANIC / MINERAL / VELVET / DUST / DREAM / SIGNAL / MONO
- Added Russian group names
- Removed near-duplicate color density
- Changed shuffle/add logic to favor different groups and stronger perceptual distance
- Added an OKLab minimum-distance target of 0.12 for visible palette candidates
- Preserved 46 of the strongest original legacy colors

## v1.3.0 — Unique mood copy

- Added 192 unique color-specific hashtags
- Added 192 unique color-specific statuses
- Added full English/Russian localization for all hashtags and statuses
- Removed recycled group-level quote/tag assignment from runtime
- Language switching now updates color name, group, hashtag, and status together

## v1.4.0 — Zen / Stoic editorial pass

- Rewrote all 192 color-specific statuses in a contemplative zen/stoic voice
- Rewrote all 192 EN + 192 RU hashtags
- Added full EN/RU localization for the hero title, intro copy, mood label, shuffle control and ARIA labels
- Added measured one-line hashtag typography: long tags shrink only as much as required to fit
- Kept short hashtags at the original large display size

## v1.4.1 — moodPalette rebrand

- Project identity standardized as **`moodPalette`**
- Updated the on-site brand, document title, metadata, accessibility labels and no-JavaScript message
- Renamed the global atlas namespace to `MOODPALETTE_ATLAS`
- Updated the internal palette-mutation event namespace
- Updated README, Color Atlas documentation, mood-copy documentation and release notes
- Canonical repository: `https://github.com/g4mak3r/moodPalette`
- Kept `moodlet / мудлет` as the term for an individual generated palette element
