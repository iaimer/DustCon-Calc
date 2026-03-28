# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

粉尘浓度计算器 - An Electron desktop application for recording and calculating workplace dust concentration measurements. Based on GBZ/T 192 standards.

## Commands

```bash
npm run dev          # Start development server with Electron
npm run test         # Run unit tests once
npm run test:watch   # Run tests in watch mode
npm run build        # Build for production (TypeScript check + Vite build + Electron builder)
```

## Architecture

### Electron IPC Pattern

The app uses Electron's IPC (Inter-Process Communication) for database operations:

```
┌─────────────────┐         ┌─────────────────┐
│  Renderer (Vue) │  IPC    │  Main Process   │
│  src/           │ ◄─────► │  electron/      │
│                 │         │                 │
│  Vue 3 +        │         │  sql.js         │
│  Element Plus   │         │  SQLite DB      │
└─────────────────┘         └─────────────────┘
```

- **Main process** (`electron/main.ts`): Handles all SQLite database operations via IPC handlers
- **Preload script** (`electron/preload.ts`): Exposes `window.electronAPI` to renderer
- **Renderer** (`src/`): Vue 3 application with Element Plus UI

### Database

SQLite via `sql.js` (WebAssembly-based, no native compilation needed). Database stored at `app.getPath('userData')/dust-calculator.db`.

**Tables:**
- `projects`: Test project metadata (employer, date, environment parameters)
- `samples`: Individual sample measurements with calculated values
- `standard_weights`: Standard weight verification records

### Core Calculation Module

`src/utils/calculator.ts` implements all dust concentration calculations per GB/T 8170:

- **Banker's rounding** (`roundBank`): 四舍六入五成双 - required by Chinese national standard
- **V0 conversion**: Standard volume adjustment when temperature < 5°C or > 35°C, or pressure outside 98.8-103.4 kPa
- **Sample type detection**: Samples with "-0-" in the ID are blank samples
- **QC checks**: Weighing QC (diff ≤ 0.2mg), blank delta_m QC (≤ 0.02mg), sample delta_m QC (> 0.1mg)

**Sampling volumes**: 500L, 300L, 420L, 450L, 525L
- 500L: detection value rounded to 1 decimal, min quantitative concentration = 0.2 mg/m³
- Others: detection value rounded to 2 decimals

### Key Files

| File | Purpose |
|------|---------|
| `electron/main.ts` | Electron main process + all IPC handlers + SQLite |
| `electron/preload.ts` | Exposes database API to renderer |
| `src/App.vue` | Main layout with project list sidebar |
| `src/views/ProjectDetail.vue` | Project editor with sample table (supports full view and transcription view) |
| `src/utils/calculator.ts` | All calculation functions - add new formulas here |

## Notes

- sql.js is externalized in Vite config to avoid bundling issues
- WASM file loaded from `node_modules/sql.js/dist/sql-wasm.wasm`
- Tests verify the banker's rounding algorithm matches GB/T 8170 standard exactly