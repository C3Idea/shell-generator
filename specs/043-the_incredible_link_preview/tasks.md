<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Open Graph link preview for shared links

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-10-07T10:39:27-06:00

---

## Wave 0: US1: preview image

**Purpose**: Optimized JPEG from the owner's PNG

- [x] T001 [W0] [US1] In a scratchpad folder outside the repo, install sharp and convert /home/chemair/00_C3_code/shell-generator/link_preview.png to src/assets/link_preview.jpg: flatten (no alpha), JPEG via mozjpeg at quality ~85, metadata stripped. Verify JPEG, 3 channels, 1200x630, <300 KB; if over, lower quality in steps of 5 (not below 75). Inspect visually. Do not commit the PNG or the scratchpad.

**Wave Gate**: passed

---

## Wave 1: US1/US2: page head

**Purpose**: lang, title, description, OG and Twitter tags

- [x] T002 [W1] [US2] In src/index.html set <html lang="es"> and <title>Caracoles: diseña conchas con matemáticas</title>; add <meta name="description">, og:type, og:site_name, og:locale, og:title, og:description, og:url, og:image, og:image:type, og:image:width, og:image:height, og:image:alt and twitter:card with the FR-001..FR-005 values, plus a one-line comment that the absolute URLs follow /biomat/caracoles/. Keep <base href>, favicon, apple-touch-icon, manifest and theme-color unchanged.

**Wave Gate**: passed

---

## Wave 2: Polish: verification

**Purpose**: Lint, unit suite, production build, dist checks

- [x] T003 [W2] Pinned to 2 cores: lint, unit suite, production build. Parse dist/shell-generator/index.html and assert every FR-001..FR-005 value; map og:image to dist/shell-generator/assets/link_preview.jpg and re-check JPEG/RGB/1200x630/<300 KB. Confirm package.json and package-lock.json unchanged and link_preview.png not staged. Post-deploy live check (VM-003) excluded (Decision 10).

**Wave Gate**: passed

---

## Summary

- **Total Tasks**: 3
- **Completed**: 3
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 100%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._
