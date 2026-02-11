import { Graphics, TextStyle, Sprite } from 'pixi.js'
import {
  AnimatedSpriteActor,
  TextActor,
  ContainerActor,
  AssetLoader,
  ActorBehavior,
} from '@puyuyu1234/ptre'
import { WIDTH, HEIGHT, getGame } from './index'
import type { BaseScene } from './scenes'

// デバッグ用ヒットボックス表示フラグ
export const DEBUG_HITBOX = false

// ヒットボックス付きアクター
export class HitboxActor extends AnimatedSpriteActor {
  hitbox: { x: number; y: number; width: number; height: number }
  debugGraphics: Graphics | null = null
  vx = 0
  vy = 0
  time = 0

  constructor(
    imageKey: string,
    x: number, y: number,
    width: number, height: number,
    hitbox: { x: number; y: number; width: number; height: number },
    tags: string[] = [],
    anchorX = 0.5,
    anchorY = 0.5,
    debugColor: number = 0xff0000
  ) {
    super(imageKey, x, y, width, height, tags, anchorX, anchorY)
    this.hitbox = hitbox

    // デバッグ用ヒットボックス表示
    if (DEBUG_HITBOX) {
      this.debugGraphics = new Graphics()
      this.debugGraphics.rect(0, 0, hitbox.width, hitbox.height)
      this.debugGraphics.stroke({ width: 1, color: debugColor, alpha: 0.8 })
      this.addChild(this.debugGraphics)
    }
  }

  get hitboxRect() {
    // ヒットボックスの位置を計算
    const spriteLeft = this.x - this.width * this.anchor.x
    return {
      x: spriteLeft + this.hitbox.x,
      y: this.y - this.height * this.anchor.y + this.hitbox.y,
      width: this.hitbox.width,
      height: this.hitbox.height,
      bottom: this.y - this.height * this.anchor.y + this.hitbox.y + this.hitbox.height,
    }
  }

  tick() {
    super.tick()
    this.time++
    // デバッグ用ヒットボックス
    if (this.debugGraphics) {
      const rect = this.hitboxRect
      this.debugGraphics.x = (rect.x - this.x) / this.scale.x
      this.debugGraphics.y = rect.y - this.y
      this.debugGraphics.scale.x = 1 / this.scale.x
    }
  }

  intersects(other: HitboxActor): boolean {
    const a = this.hitboxRect
    const b = other.hitboxRect
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y
  }
}

// プレイヤー
export class Player extends HitboxActor {
  isDying = false

  constructor() {
    super(
      'player',
      12, 80, 24, 32,
      { x: 4, y: 0, width: 16, height: 4 },
      ['player'],
      0.5, 0, // anchor
      0x00ff00
    )
    this.playAnimation('stand')
  }

  tick() {
    super.tick()
    if (this.isDying && this.time > 30) {
      this.playAnimation('died')
    }
  }

  handleInput() {
    if (this.isDying) return

    const input = getGame().getInput()
    const isDown = (...keys: string[]) => keys.some(k => input.isKeyDown(k))

    if (isDown('ArrowRight', 'KeyD')) {
      if (this.x + this.width / 2 < WIDTH) {
        this.x += 1
        this.scale.x = 1 // 通常向き
        this.playAnimation('walk')
      }
    } else if (isDown('ArrowLeft', 'KeyA')) {
      if (this.x - this.width / 2 > 0) {
        this.x -= 1
        this.scale.x = -1 // 水平反転
        this.playAnimation('walk')
      }
    } else {
      this.playAnimation('stand')
    }
  }

  die() {
    if (this.isDying) return
    this.isDying = true
    this.time = 0
    this.playAnimation('dying')
  }
}

// 落下エンティティ基底クラス
let entityId = 0

export class FallingEntity extends HitboxActor {
  id: number
  level: number
  private fallGen: Generator

  constructor(x: number, level: number, debugColor: number = 0xff0000) {
    super(
      'entity',
      x - 8, 0, 16, 16,
      { x: 3, y: 12, width: 10, height: 4 },
      ['entity'],
      0, 0,
      debugColor
    )
    this.id = entityId++
    this.level = level
    this.vy = 0

    // 横移動
    const randomVX = Math.floor(4 * Math.random() - 2)
    const baseVX = level < 50 ? 0 : level < 100 ? randomVX / 8 : level < 150 ? randomVX / 6 : randomVX / 4
    this.x -= baseVX * 30
    this.vx = baseVX

    this.fallGen = this.fall()
  }

  *fall(): Generator {
    const ay = (this.level + 100) / 4096
    this.vy = ay * -1.5
    while (true) {
      this.vy += ay
      yield
    }
  }

  tick() {
    super.tick()
    this.fallGen.next()
    this.x += this.vx
    this.y += this.vy
  }

  isOutOfBounds(): boolean {
    return this.y >= HEIGHT
  }

  handleCollision(_player: Player, _scene: BaseScene): void {}
}

// りんご
export class Apple extends FallingEntity {
  constructor(x: number, level: number) {
    super(x, level, 0x0000ff)
    this.playAnimation('apple')
  }

  handleCollision(_player: Player, scene: BaseScene) {
    scene.addScore(10)
    this.destroy()
  }
}

// 爆弾
export class Bomb extends FallingEntity {
  private exploded = false

  constructor(x: number, level: number) {
    super(x, level, 0xff0000)
    this.playAnimation('bomb')
  }

  handleCollision(player: Player, scene: BaseScene) {
    if (this.exploded) return
    this.exploded = true
    player.die()
    this.visible = false

    // 爆発エフェクト予約
    setTimeout(() => {
      for (let i = 0; i < 100; i++) {
        scene.addParticle(
          this.x + this.width / 2 + (Math.random() * 2 - 1) * 4,
          this.y + this.height / 2 + (Math.random() * 2 - 1) * 4,
          (Math.random() * 2 - 1) * 6,
          (Math.random() * 2 - 1) * 4
        )
        scene.addParticle(
          player.x + player.width / 2 + (Math.random() * 2 - 1) * 12,
          player.y + player.height / 2 + (Math.random() * 2 - 1) * 8,
          (Math.random() * 2 - 1),
          (Math.random() * 2 - 1) * 0.5
        )
      }
      scene.showGameOver()
      this.destroy()
    }, 500)
  }
}

// パーティクル（Graphicsベース - ptreにGraphicsActorがないため）
export class Particle extends Graphics {
  readonly behavior = new ActorBehavior(['particle'])
  vx: number
  vy: number
  time = 0

  constructor(x: number, y: number, vx: number, vy: number) {
    super()
    this.rect(0, 0, 1, 1).fill(0x000000)
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
  }

  hasTag(tag: string): boolean {
    return this.behavior.hasTag(tag)
  }

  get isDestroyed(): boolean {
    return this.behavior.isDestroyed
  }

  tick() {
    this.time++
    if (this.time > 10) {
      this.vx *= 0.6
      this.vy *= 0.6
    } else {
      this.vy += 0.1
    }
    this.x += this.vx
    this.y += this.vy
  }

  destroy() {
    this.behavior.destroy()
    super.destroy()
  }
}

// 木パーツ（Spriteベース - スプライトシートから取得するため）
export class TreePart extends Sprite {
  readonly behavior = new ActorBehavior(['tree-part'])

  constructor(x: number, y: number, flipX = false) {
    const assetLoader = AssetLoader.getInstance()
    const textures = assetLoader.getAnimationTextures('entity', 'tree')
    super(textures?.[0])
    this.x = x
    this.y = y
    this.width = 16
    this.height = 16
    this.anchor.set(0, 0)
    if (flipX) {
      this.scale.x = -1
      this.anchor.x = 1
    }
  }

  hasTag(tag: string): boolean {
    return this.behavior.hasTag(tag)
  }

  get isDestroyed(): boolean {
    return this.behavior.isDestroyed
  }

  tick() {}

  destroy() {
    this.behavior.destroy()
    super.destroy()
  }
}

// 木（コンテナ）
export class Tree extends ContainerActor {
  constructor() {
    super(0, 0, ['tree'])
    this.addActor(new TreePart(0, 32))
    this.addActor(new TreePart(16, 32, true))
    this.addActor(new TreePart(32, 16, true))
    this.addActor(new TreePart(48, 16))
    this.addActor(new TreePart(64, 32))
    this.addActor(new TreePart(80, 32, true))
  }
}

// テキスト
export class GameText extends TextActor {
  constructor(text: string, x: number, y: number, fontSize: number, fontFamily = 'p12') {
    const style: Partial<TextStyle> = {
      fontFamily,
      fontSize,
      fill: 0x000000,
    }
    super(text, x, y, ['text'], 0, 0, style)
  }
}

// 矩形（Graphicsベース - ptreにGraphicsActorがないため）
export class RectActor extends Graphics {
  readonly behavior = new ActorBehavior(['rect'])

  constructor(x: number, y: number, width: number, height: number, color: number) {
    super()
    this.rect(0, 0, width, height).fill(color)
    this.x = x
    this.y = y
  }

  hasTag(tag: string): boolean {
    return this.behavior.hasTag(tag)
  }

  get isDestroyed(): boolean {
    return this.behavior.isDestroyed
  }

  tick() {}

  destroy() {
    this.behavior.destroy()
    super.destroy()
  }
}
