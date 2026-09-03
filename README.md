# moodPalette

A tiny interactive **chromatic mood generator** built with plain HTML, CSS and JavaScript.

Repository: [github.com/g4mak3r/moodPalette](https://github.com/g4mak3r/moodPalette)

moodPalette started as a small personal browser experiment and was later refactored into a standalone showcase project: no framework, no build step, no runtime dependencies.

## What it does

- generates **1–6 color moodlets** from curated palettes;
- edits the palette directly: click a color to remove it, or use the trailing `+` swatch to append a new random moodlet;
- occasionally produces a fully coherent palette from one mood family;
- lets you preview each moodlet on hover, with keyboard navigation as a fallback;
- changes the ambient lighting and glass controls to match the selected color;
- shows the selected mood family, color chip, color name and HEX in one compact top-line spec;
- copies the color name or HEX independently from that spec;
- copies the current hashtag on click with centered glass feedback;
- keeps the active palette fluid with animated add/remove reflow;
- uses a magnetic morphing cursor on fine-pointer devices, including nested glass layers for compound controls;
- supports keyboard controls and reduced-motion preferences;
- adapts to desktop, tablet and mobile layouts.

## Interaction

| Action | Control |
| --- | --- |
| Shuffle moodlets | `R` or **Shuffle** button |
| Add moodlet | Click the trailing `+` swatch or press `+` |
| Remove moodlet | Click a color swatch or press `-` for the selected moodlet |
| Move through moodlets | `←` / `→` |
| Copy color name / HEX | Click / tap either value in the top-left color spec |
| Copy tag | Click / tap the current tag |

## Stack

- Semantic HTML5
- Modern CSS: custom properties, backdrop filters, responsive layout, motion preferences
- Vanilla JavaScript
- Google Fonts: Space Grotesk

## Run locally

The simplest option is to open `index.html` directly in a browser.

For the same origin behavior as a deployed website, start a tiny local server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy with GitHub Pages

This project is fully static, so GitHub Pages is the natural deployment target.

1. Push the project to a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder.
5. Save.

The included `.nojekyll` file makes the intent explicit: serve these files as-is.

## Suggested release workflow

For a small browser project, use both:

- **GitHub Pages** as the live demo;
- a normal tagged **GitHub Release** for version history.

A public version can be tagged normally with release title **moodPalette**. GitHub automatically provides source `.zip` and `.tar.gz` archives for the release tag, so a separate hand-made archive is optional.

## Project structure

```text
moodPalette/
├─ assets/
│  ├─ favicon.svg
│  └─ shuffle.svg
├─ .nojekyll
├─ app.js
├─ index.html
├─ README.md
└─ styles.css
```

## Notes

The project intentionally stays framework-free. The point is the interaction design, color system and motion — not infrastructure.

### Palette editing

- Hover a color to preview its moodlet; the cursor lens exposes a small glass `×` delete affordance before removal.
- Click a color to remove it; the remaining swatches reflow with a soft transition.
- The trailing `+` swatch adds a random unique color and deliberately keeps its glass *under* the plus instead of covering it.
- Ambient color fields drift across the full-page background independently of pointer position and are visible through the glass card.

## moodPalette Curated Color Atlas / 192

moodPalette uses a deliberately compact **192-color curated atlas**: 16 aesthetic groups × 12 colors. Groups describe a mood (`DIGITAL`, `SOFT`, `NIGHT`, `VELVET`, …), not a narrow hue family. Every color includes English/Russian naming and OKLCH metadata.

Palette generation actively maximizes perceptual difference between visible swatches while staying inside a curated compatibility graph.

See [`COLOR_ATLAS.md`](COLOR_ATLAS.md).

## Unique mood copy

Every curated color owns a unique bilingual hashtag and status. See [`MOOD_COPY.md`](MOOD_COPY.md) for the complete editorial map.
