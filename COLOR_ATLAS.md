# moodPalette Curated Color Atlas / 192

The previous 576-color system was intentionally reduced to **192 curated colors**: **16 mood groups × 12 colors**.

The goal is not coverage. The goal is useful visual difference. Near-duplicate shades were removed and the groups were rebuilt as **moods / aesthetic roles**, not hue families.

Every color retains:
- HEX / sRGB
- OKLCH coordinates
- English name
- Russian name
- English + Russian mood group

## Groups

| # | EN | RU | Colors |
|---:|---|---|---:|
| 01 | Digital | Цифра | 12 |
| 02 | Heat | Жар | 12 |
| 03 | Power | Сила | 12 |
| 04 | Soft | Нежность | 12 |
| 05 | Night | Ночь | 12 |
| 06 | Acid | Кислота | 12 |
| 07 | Nordic | Север | 12 |
| 08 | Earth | Земля | 12 |
| 09 | Ocean | Океан | 12 |
| 10 | Botanic | Ботаника | 12 |
| 11 | Mineral | Минералы | 12 |
| 12 | Velvet | Бархат | 12 |
| 13 | Dust | Пыль | 12 |
| 14 | Dream | Сон | 12 |
| 15 | Signal | Сигнал | 12 |
| 16 | Mono | Монохром | 12 |

## Palette generation

The generator no longer prefers several colors from the same group. It now:

- prefers a different group for every visible swatch;
- chooses mostly from curated compatibility relationships;
- occasionally chooses an intentional contrast group;
- evaluates the candidate against **every color already visible** in OKLab;
- targets a minimum perceptual distance of **0.12**;
- selects randomly from the strongest candidate band instead of deterministically returning the single farthest color.

This preserves surprise while avoiding both near-identical palettes and uncontrolled rainbow noise.

## Curation principle

`DIGITAL`, `HEAT`, `POWER`, `SOFT`, `NIGHT`, `ACID`, `NORDIC`, `EARTH`, `OCEAN`, `BOTANIC`, `MINERAL`, `VELVET`, `DUST`, `DREAM`, `SIGNAL`, `MONO` are aesthetic families. A group may deliberately contain multiple hues when they share the same visual character.

The atlas is an original moodPalette screen-color system and does not embed Pantone libraries or Pantone reference data.


## Unique mood copy

Every one of the 192 curated colors now owns its own bilingual micro-copy:

- one unique English hashtag
- one unique Russian hashtag
- one unique English status
- one unique Russian status

The copy belongs to the exact color entry rather than to its group. Switching `Eng / Рус`
therefore changes the color name, group name, hashtag, and status as one localized mood.
