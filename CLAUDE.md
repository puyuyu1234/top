# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website "こふらルーム" built with Vue 3 + TypeScript + Vite. Contains mini-games, tools, and content pages. Games use ptre engine (TypeScript + PixiJS).

## Commands

```bash
pnpm dev          # Start development server (http://localhost:5173/)
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm lint         # ESLint (auto-fix)
pnpm format       # Prettier format
pnpm typecheck    # TypeScript type check

# Before commit (strict ESLint):
pnpm lint && pnpm format && pnpm typecheck

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

Styling: Tailwind CSS 4

### ptre Game Engine (`@puyuyu1234/ptre`)

TypeScript game engine built on PixiJS. Core concepts:

- `GameFactory.createGame()` - Initialize Game + AssetLoader together
- `Game` - Main loop, scene management
- `Scene` - Container for actors with lifecycle hooks
- `SpriteActor` / `AnimatedSpriteActor` / `TextActor` - Renderable entities
- `ActorBehavior` - Component system for reusable logic
- `AssetLoader` - Spritesheet and asset management
- `Input` - Keyboard/touch input handling

### Games (`src/games/`)

Games using ptre engine with full TypeScript support:

- **kudamono/** - Fruit catching game

### Assets (`public/`)

- **fonts/** - PixelMplus (10pt, 12pt), Saitamaar
- **img/** - Game sprites organized by game name

## Patterns

### Adding a New Vue Page

1. Create component in `src/views/`
2. Add route in `src/router/index.ts`
3. Link from HomeView or navigation

### Creating a ptre Game

```ts
// src/games/mygame/index.ts
import { Game, AssetLoader, GameFactory } from "@puyuyu1234/ptre";
import { TitleScene } from "./scenes";

export const WIDTH = 96;
export const HEIGHT = 128;

let game: Game;
let assetLoader: AssetLoader;

export function getGame(): Game {
  return game;
}
export function getAssetLoader(): AssetLoader {
  return assetLoader;
}

export async function startGame(container: HTMLElement): Promise<Game> {
  const canvas = document.createElement("canvas");
  canvas.id = "mygame-canvas";
  container.appendChild(canvas);
  ({ game, assetLoader } = await GameFactory.createGame("mygame-canvas", WIDTH, HEIGHT, {
    backgroundColor: 0x999999,
    assetBasePath: "/img/mygame/",
  }));

  await assetLoader.loadSpritesheet("sprites", "sprites.json");

  game.changeScene(new TitleScene());
  game.start();
  return game;
}
```
