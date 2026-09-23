<!-- DO NOT EDIT - Auto-generated from tasks.json -->
<!-- To modify tasks, edit tasks.json and run: complete-task.sh -->

# Tasks: Replace Angular favicon and unify app icons

**Source**: `tasks.json` (source of truth)
**Generated**: 2026-09-23T17:08:16-06:00

---

## Wave 0: Setup: one-off icon generator

**Purpose**: Scratchpad script; no new dependency

- [x] T001 [W0] Write a one-off icon generator in the session scratchpad (never committed): npx sharp crops and resizes src/assets/icons/icon-512x512.png, and a minimal Node ICO writer packs PNG payloads. No package.json change.

**Wave Gate**: passed

---

## Wave 1: US1: Recognizable browser tab

**Purpose**: Real multi-size favicon.ico from the tight crop

- [x] T002 [W1] [US1] Generate src/favicon.ico as a real ICO with 16/32/48px PNG images, tightly cropped so the shell fills the frame and the bottom cut sits on the image edge; `file` must report 3 icons.

**Wave Gate**: passed

---

## Wave 2: US2: Coherent installed icon

**Purpose**: apple-touch-icon + maskable icons, manifest purposes split

- [x] T003 [W2] [US2] Generate src/assets/icons/apple-touch-icon.png (180x180) and icon-maskable-{192x192,512x512}.png (navy background, shell at about 70% of the canvas, cropped so no straight cut edge shows).
- [x] T004 [W2] [US2] Wire the icons: add <link rel="apple-touch-icon"> in src/index.html; in src/manifest.webmanifest set the existing icons to "purpose": "any" and add separate "maskable" entries for the 192/512 maskable icons.

**Wave Gate**: passed

---

## Wave 3: US3: Clean HTML head

**Purpose**: One manifest link and one theme-color meta

- [x] T005 [W3] [US3] Remove the duplicate <link rel="manifest"> and <meta name="theme-color"> from src/index.html (exactly one of each remains; theme_color and names unchanged).

**Wave Gate**: passed

---

## Wave 4: Polish: cleanup and verification

**Purpose**: Root copy deleted, build/test, maskable preview, approval screenshot

- [x] T006 [W4] Delete the untracked root shell_icon512.png; run ng build (check dist/ holds favicon.ico, apple-touch-icon.png, both maskable icons) and ng test; check the DevTools maskable preview; post a fresh-context 16px tab screenshot on #8 for approval.

**Wave Gate**: passed

---

## Summary

- **Total Tasks**: 6
- **Completed**: 6
- **Skipped**: 0
- **Blocked**: 0
- **Progress**: 100%

---

_This file is auto-generated. Edit `tasks.json` to modify tasks._
