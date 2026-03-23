# The Dosa Spot Real Photo Mapping

Canonical source images now live in `business-input/the-dosa-spot/raw/images/`.
The active runtime folder is `public/businesses/the-dosa-spot/images/`.
The repo-root `imagenes/` folder is treated as an incoming drop zone, not the canonical source of truth.

## 2026-03-17 incoming IA remap

### Incoming IA -> canonical raw slot

- `image.png` -> `dish-chole-bhature.png` (`high`)
- `b1ce3473-c127-413a-990b-db7bccc3edfa.png` -> `dish-gulab-jamun.png` (`high`)
- `850928f3-5926-4c94-9953-1afd9925d3d3.png` -> `dish-vegetable-noodles.png` (`high`)
- `16 mar 2026, 23_36_11.png` -> `gallery-spicy-noodles.png` (`high`)
- `f6ea9af1-be6a-4f2a-a7cf-6be308444e43.png` -> `gallery-curry-naan.png` (`high`)
- `d92c8783-50e2-4166-a730-3356f58e91e0.png` -> `gallery-starter-bowl.png` (`high`)
- `fdbeaf23-9903-45c0-8fa0-34b561ff5381.png` -> `fallback-noodle-bowl.png` (`high`)

### Retained canonical originals

- `hero-main.jpg` stays as the hero source (`high`)
- `dish-dosa.jpg` stays as the featured dosa source (`high`)

## Canonical raw -> runtime export convention

- `hero-main.jpg` -> `the-dosa-spot-hero-main-01.jpg`
- `dish-dosa.jpg` -> `the-dosa-spot-featured-dish-dosa-01.jpg`
- `dish-chole-bhature.png` -> `the-dosa-spot-featured-dish-chole-bhature-02.png`
- `dish-gulab-jamun.png` -> `the-dosa-spot-featured-dish-gulab-jamun-03.png`
- `dish-vegetable-noodles.png` -> `the-dosa-spot-featured-dish-vegetable-noodles-04.png`
- `gallery-curry-naan.png` -> `the-dosa-spot-gallery-curry-naan-03.png`
- `gallery-spicy-noodles.png` -> `the-dosa-spot-gallery-spicy-noodles-01.png`
- `gallery-starter-bowl.png` -> `the-dosa-spot-gallery-starter-bowl-02.png`
- `fallback-noodle-bowl.png` -> `the-dosa-spot-fallback-noodle-bowl-01.png`

## Backup

- Pre-remap JPGs are preserved in `business-input/the-dosa-spot/_archive/raw-images-2026-03-17-pre-ia-remap/`.

## Notes

- No reliable exterior / frontage photo is currently available, so the location block remains text-first.
- The current assembly keeps the gallery intentionally compact. `gallery-curry-naan` remains approved in the image map even when the live gallery only surfaces two frames.
