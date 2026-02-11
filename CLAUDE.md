# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website ("こふらルーム") containing static HTML pages, mini-games, and web tools. The site is purely static with no build system or package manager.

## Architecture

### Game Engine (`engine/`)

A custom 2D game engine written in vanilla JavaScript with Canvas API:

- **engine.js / engine2.js** - Two versions of the engine with the following core classes:
  - `Game` - Main game loop with fixed timestep (60fps default), handles canvas creation and scene management
  - `Scene` / `Container` - Scene graph system with parent-child relationships
  - `Actor` - Base entity class with position, scale, alpha, tags, and trait system
  - `SpriteActor` / `RectActor` / `TextActor` - Renderable actor types
  - `Trait` - Component system for adding behaviors to actors (e.g., `SpriteAnimationTrait`)
  - `Camera` - Viewport with scroll and rotation support
  - `Input` - Keyboard and pointer input handling with press duration tracking
  - `ImageManager` / `SoundManager` - Asset loading and management (global `images` and `sounds` instances)

### Games

Each game lives in its own directory with `index.html`, `main.js`, and `style.css`:

- **imomushi/** - Caterpillar platformer using the engine. Uses `param.js` for stage data and block definitions
- **kudamono/** - Fruit catching game with falling entities and collision detection
- **tulipTrade/** - Tulip trading simulation (uses Chart.js)
- **homo/** - Simple diagnostic quiz

### Tools

- **aa2picture/** - ASCII art to image converter using Canvas API and custom fonts

### Fonts (`font/`)

Pixel Mplus fonts (10pt and 12pt) used across games for retro text rendering.

## Development

No build step required. Open HTML files directly in a browser or serve with any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

## Game Engine Patterns

When creating new games using the engine:

1. **Image Loading**: Register images with `images.add("name", "path")`, then call `await images.loadAll()` before game start
2. **Scene Creation**: Extend `Scene` class, add actors with `actor.addTo(this)`
3. **Game Loop**: Create `Game(width, height)`, call `game.changeScene(scene)`, then `game.start()`
4. **Input Handling**: Use `input.get("key")` which returns duration (positive = pressed, negative = released)
5. **Sprite Animation**: Add `SpriteAnimationTrait` to `SpriteActor`, define frames with `SpriteAnimation`
6. **Collision**: Use `Rectangle.isIntersect()` for AABB collision detection

## File Structure Notes

- Games reference engine with relative paths like `../engine/engine2.js`
- Images stored in `img/[game-name]/`
- External projects (tulipclicker, soukoban, etc.) are in sibling directories outside this repo
