# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

粉尘浓度计算器 - A Tauri desktop application for recording and calculating workplace dust concentration measurements. Based on GBZ/T 192 standards. Apple Silicon only.

## Commands

```bash
npm run dev          # Start frontend dev server
npm run tauri:dev    # Start Tauri development mode
npm run build        # Build frontend only
npm run tauri:build  # Build production DMG (aarch64)
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
```

## Architecture

### Tauri IPC Pattern

The app uses Tauri Commands for database operations:

```
┌─────────────────┐         ┌─────────────────┐
│  Frontend (Vue) │ invoke  │  Rust Backend   │
│  src/           │ ◄─────► │  src-tauri/     │
│                 │         │                 │
│  Vue 3 +        │         │  rusqlite       │
│  Element Plus   │         │  SQLite DB      │
└─────────────────┘         └─────────────────┘
```

- **Rust backend** (`src-tauri/src/`): Handles all SQLite operations via Tauri Commands
- **Frontend** (`src/`): Vue 3 application with Element Plus UI, calls `tauriAPI.*`

### Directory Structure

```
src-tauri/
├── Cargo.toml              # Rust dependencies
├── tauri.conf.json         # Tauri configuration
├── icons/                  # App icons (icns, png)
└── src/
    ├── main.rs             # App entry
    ├── lib.rs              # Tauri setup + handler registration
    ├── db/
    │   └── mod.rs          # SQLite connection + migrations
    └── commands/
        ├── mod.rs
        ├── projects.rs     # Project CRUD commands
        ├── samples.rs      # Sample CRUD commands
        └── standard_weights.rs

src/
├── api/
│   └── tauri.ts            # Tauri invoke wrapper
├── views/
│   └── ProjectDetail.vue   # Main view
├── components/
│   ├── project/
│   └── samples/
├── composables/
│   ├── useProject.ts
│   ├── useSamples.ts
│   └── useStandardWeight.ts
├── types/
│   ├── project.ts
│   ├── sample.ts
│   └── standardWeight.ts
└── utils/
    └── calculator.ts       # Core calculation logic
```

### Database

SQLite via `rusqlite` (native, bundled). Database path: `~/Library/Application Support/dust-calculator/dust-calculator.db`

**Tables:**
- `projects`: Test project metadata (employer, date, environment parameters)
- `samples`: Individual sample measurements with calculated values
- `standard_weights`: Standard weight verification records

### Tauri Commands (14 total)

| Category | Commands |
|----------|----------|
| Projects | `get_projects`, `get_project`, `create_project`, `update_project`, `delete_project`, `copy_project` |
| Samples | `get_samples`, `create_sample`, `update_sample`, `delete_sample`, `batch_create_samples` |
| StandardWeights | `get_standard_weight`, `create_standard_weight`, `update_standard_weight` |

### Core Calculation Module

`src/utils/calculator.ts` implements all dust concentration calculations per GB/T 8170:

- **Banker's rounding** (`roundBank`): 四舍六入五成双 - required by Chinese national standard
- **V0 conversion**: Standard volume adjustment when temperature < 5°C or > 35°C, or pressure outside 98.8-103.4 kPa
- **Sample type detection**: Samples with "-0-" in the ID are blank samples
- **QC checks**: Weighing QC (diff ≤ 0.2mg), blank delta_m QC (≤ 0.02mg), sample delta_m QC (> 0.1mg)

**Sampling volumes**: 500L, 300L, 420L, 450L, 480L, 525L
- 500L: detection value rounded to 1 decimal, min quantitative concentration = 0.2 mg/m³
- Others: detection value rounded to 2 decimals

## Notes

- Build target: `aarch64-apple-darwin` (Apple Silicon only)
- App size: ~4MB DMG (vs ~150MB Electron)
- Database migrations run automatically on startup (ALTER TABLE for legacy data)
- Tests verify the banker's rounding algorithm matches GB/T 8170 standard exactly