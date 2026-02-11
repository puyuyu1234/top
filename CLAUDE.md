# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website "こふらルーム" built with Vue 3 + TypeScript + Vite. Contains mini-games, tools, and content pages. Games use a custom Canvas-based engine (currently in legacy JS, migration to TypeScript in progress).

## Commands

```bash
pnpm dev          # Start development server (http://localhost:5173/)
pnpm build        # Production build
pnpm preview      # Preview production build

# For GitHub Pages deployment with subdirectory:
VITE_BASE=/top/ pnpm build
```

## Architecture

### Vue Application (`src/`)

- **main.ts** - App entry point
- **App.vue** - Root component with navigation header
- **router/index.ts** - Vue Router configuration
- **views/** - Page components (HomeView, games, tools, etc.)
- **games/** - TypeScript game modules using ptre engine
- **assets/style.css** - Global styles

### ptre Game Engine (`@puyuyu1234/ptre`)

TypeScript game engine built on PixiJS. Core concepts:
- `GameFactory.createGame()` - Initialize Game + AssetLoader together
- `Game` - Main loop, scene management
- `Scene` - Container for actors with lifecycle hooks
- `SpriteActor` / `AnimatedSpriteActor` / `TextActor` - Renderable entities
- `ActorBehavior` - Component system for reusable logic
- `AssetLoader` - Spritesheet and asset management
- `Input` - Keyboard/touch input handling

### Legacy Game Engine (`public/legacy/engine/`)

Custom 2D Canvas game engine (vanilla JS). Core classes:
- `Game` - Main loop (60fps), canvas management, scene switching
- `Scene` / `Container` - Scene graph with parent-child relationships
- `Actor` - Base entity with position, scale, alpha, traits
- `SpriteActor` / `RectActor` / `TextActor` - Renderable types
- `Trait` - Component system (e.g., `SpriteAnimationTrait`)
- `Camera` / `Input` - Viewport and input handling
- `ImageManager` / `SoundManager` - Asset loading (global `images`, `sounds`)

### TypeScript Games (`src/games/`)

Games using ptre engine with full TypeScript support:
- **kudamono/** - Fruit catching game (migrated)

### Legacy Games (`public/legacy/`)

Games loaded dynamically via script injection from Vue components:
- **imomushi/** - Caterpillar platformer with thread mechanics

### Base URL Handling

For GitHub Pages compatibility, legacy JS uses `window.__BASE_URL__`:
```js
const BASE = window.__BASE_URL__ ?? '';
images.add("player", `${BASE}/img/game/sprite.gif`);
```

Vue components set this before loading legacy scripts:
```ts
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
;(window as any).__BASE_URL__ = BASE
```

### Assets (`public/`)

- **fonts/** - PixelMplus (10pt, 12pt), Saitamaar
- **img/** - Game sprites organized by game name
- **legacy/** - Legacy JS files (engine, games)

## Patterns

### Adding a New Vue Page
1. Create component in `src/views/`
2. Add route in `src/router/index.ts`
3. Link from HomeView or navigation

### Creating a ptre Game
```ts
// src/games/mygame/index.ts
import { Game, AssetLoader, GameFactory } from '@puyuyu1234/ptre'
import { TitleScene } from './scenes'

export const WIDTH = 96
export const HEIGHT = 128

let game: Game
let assetLoader: AssetLoader

export function getGame(): Game { return game }
export function getAssetLoader(): AssetLoader { return assetLoader }

export async function startGame(container: HTMLElement): Promise<Game> {
  const canvas = document.createElement('canvas')
  canvas.id = 'mygame-canvas'
  container.appendChild(canvas)

  ;({ game, assetLoader } = await GameFactory.createGame('mygame-canvas', WIDTH, HEIGHT, {
    backgroundColor: 0x999999,
    assetBasePath: '/img/mygame/',
  }))

  await assetLoader.loadSpritesheet('sprites', 'sprites.json')

  game.changeScene(new TitleScene())
  game.start()
  return game
}
```

### Loading Legacy Games in Vue
```vue
<script setup lang="ts">
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
const loadScript = (src: string) => { /* ... */ }

onMounted(async () => {
  ;(window as any).__BASE_URL__ = BASE
  await loadScript('/legacy/engine/engine2.js')
  await loadScript('/legacy/game/main.js')
})
</script>
<template>
  <div id="canvas-container"></div>
</template>
```

## Migration Status

Vue + TS migration in progress:
- [x] Vue project setup with Vite
- [x] Legacy games wrapped in Vue components
- [x] ptre engine (TypeScript) adopted
- [x] kudamono game migrated to ptre
- [ ] imomushi game migration to ptre
