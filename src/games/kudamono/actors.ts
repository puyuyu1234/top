import { TextStyle, Sprite } from "pixi.js";
import {
  AnimatedSpriteActor,
  TextActor,
  ContainerActor,
  AssetLoader,
  ActorBehavior,
  GraphicsActor,
} from "@puyuyu1234/ptre";
import { WIDTH, HEIGHT, getGame } from "./index";
import type { BaseScene } from "./scenes";

// ヒットボックス付きアクター
export class HitboxActor extends AnimatedSpriteActor {
  hitbox: { x: number; y: number; width: number; height: number };
  vx = 0;
  vy = 0;
  time = 0;

  constructor(
    imageKey: string,
    x: number,
    y: number,
    width: number,
    height: number,
    hitbox: { x: number; y: number; width: number; height: number },
    tags: string[] = [],
    anchorX = 0.5,
    anchorY = 0.5,
  ) {
    super(imageKey, x, y, width, height, tags, anchorX, anchorY);
    this.hitbox = hitbox;
  }

  get hitboxRect(): { x: number; y: number; width: number; height: number; bottom: number } {
    const spriteLeft = this.x - this.width * this.anchor.x;
    return {
      x: spriteLeft + this.hitbox.x,
      y: this.y - this.height * this.anchor.y + this.hitbox.y,
      width: this.hitbox.width,
      height: this.hitbox.height,
      bottom: this.y - this.height * this.anchor.y + this.hitbox.y + this.hitbox.height,
    };
  }

  public override tick(): void {
    super.tick();
    this.time++;
  }

  public intersects(other: HitboxActor): boolean {
    const a = this.hitboxRect;
    const b = other.hitboxRect;
    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }
}

// プレイヤー
export class Player extends HitboxActor {
  isDying = false;

  constructor() {
    super(
      "player",
      12,
      80,
      24,
      32,
      { x: 4, y: 0, width: 16, height: 4 },
      ["player"],
      0.5,
      0, // anchor
    );
    this.playAnimation("stand");
  }

  public override tick(): void {
    super.tick();
    if (this.isDying && this.time > 30) {
      this.playAnimation("died");
    }
  }

  public handleInput(): void {
    if (this.isDying) return;

    const input = getGame().getInput();
    const isDown = (...keys: string[]): boolean => keys.some((k) => input.isKeyDown(k));

    if (isDown("ArrowRight", "KeyD")) {
      if (this.x + this.width / 2 < WIDTH) {
        this.x += 1;
        this.scale.x = 1; // 通常向き
        this.playAnimation("walk");
      }
    } else if (isDown("ArrowLeft", "KeyA")) {
      if (this.x - this.width / 2 > 0) {
        this.x -= 1;
        this.scale.x = -1; // 水平反転
        this.playAnimation("walk");
      }
    } else {
      this.playAnimation("stand");
    }
  }

  public die(): void {
    if (this.isDying) return;
    this.isDying = true;
    this.time = 0;
    this.playAnimation("dying");
  }
}

// 落下エンティティ基底クラス
let entityId = 0;

export class FallingEntity extends HitboxActor {
  id: number;
  level: number;
  private fallGen: Generator;

  constructor(x: number, level: number) {
    super("entity", x - 8, 0, 16, 16, { x: 3, y: 12, width: 10, height: 4 }, ["entity"], 0, 0);
    this.id = entityId++;
    this.level = level;
    this.vy = 0;

    // 横移動
    const randomVX = Math.floor(4 * Math.random() - 2);
    const baseVX =
      level < 50 ? 0 : level < 100 ? randomVX / 8 : level < 150 ? randomVX / 6 : randomVX / 4;
    this.x -= baseVX * 30;
    this.vx = baseVX;

    this.fallGen = this.fall();
  }

  *fall(): Generator {
    const ay = (this.level + 100) / 4096;
    this.vy = ay * -1.5;
    while (true) {
      this.vy += ay;
      yield;
    }
  }

  public override tick(): void {
    super.tick();
    this.fallGen.next();
    this.x += this.vx;
    this.y += this.vy;
  }

  isOutOfBounds(): boolean {
    return this.y >= HEIGHT;
  }

  handleCollision(_player: Player, _scene: BaseScene): void {}
}

// りんご
export class Apple extends FallingEntity {
  private caught = false;

  constructor(x: number, level: number) {
    super(x, level);
    this.playAnimation("apple");
  }

  public override handleCollision(_player: Player, scene: BaseScene): void {
    if (this.caught) return;
    this.caught = true;
    this.time = 0;
    scene.addScore(10);
  }

  public override tick(): void {
    if (this.caught) {
      // 3フレーム待ってからdestroy（元のコードと同じ）
      if (this.time > 2) {
        this.destroy();
      }
      this.time++;
      return;
    }
    super.tick();
  }
}

// 爆弾
export class Bomb extends FallingEntity {
  private isHit = false;
  private playerRef: Player | null = null;
  private sceneRef: BaseScene | null = null;

  constructor(x: number, level: number) {
    super(x, level);
    this.playAnimation("bomb");
  }

  public override handleCollision(player: Player, scene: BaseScene): void {
    if (this.isHit) return;
    this.isHit = true;
    this.time = 0;
    this.playerRef = player;
    this.sceneRef = scene;
    player.die();
  }

  public override tick(): void {
    if (this.isHit) {
      if (this.time === 30) {
        // 30フレームで爆発エフェクト
        const player = this.playerRef!;
        const scene = this.sceneRef!;
        for (let i = 0; i < 100; i++) {
          scene.addParticle(
            this.x + this.width / 2 + (Math.random() * 2 - 1) * 4,
            this.y + this.height / 2 + (Math.random() * 2 - 1) * 4,
            (Math.random() * 2 - 1) * 6,
            (Math.random() * 2 - 1) * 4,
          );
          scene.addParticle(
            player.x + (Math.random() * 2 - 1) * 12,
            player.y + player.height / 2 + (Math.random() * 2 - 1) * 8,
            Math.random() * 2 - 1,
            (Math.random() * 2 - 1) * 0.5,
          );
        }
        this.x = -10000; // 画面外に移動
      } else if (this.time === 60) {
        // 60フレームでゲームオーバー
        this.sceneRef!.showGameOver();
      }
      this.time++;
      return;
    }
    super.tick();
  }
}

// パーティクル
export class Particle extends GraphicsActor {
  vx: number;
  vy: number;
  time = 0;

  constructor(x: number, y: number, vx: number, vy: number) {
    super(x, y, ["particle"]);
    this.rect(0, 0, 1, 1).fill(0x000000);
    this.vx = vx;
    this.vy = vy;
  }

  public override tick(): void {
    this.time++;
    if (this.time > 10) {
      this.vx *= 0.6;
      this.vy *= 0.6;
    } else {
      this.vy += 0.1;
    }
    this.x += this.vx;
    this.y += this.vy;
  }
}

// 木パーツ（Spriteベース - スプライトシートから取得するため）
export class TreePart extends Sprite {
  readonly behavior = new ActorBehavior(["tree-part"]);

  constructor(x: number, y: number, flipX = false) {
    const assetLoader = AssetLoader.getInstance();
    const textures = assetLoader.getAnimationTextures("entity", "tree");
    super(textures?.[0]);
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.anchor.set(0, 0);
    if (flipX) {
      this.scale.x = -1;
      this.anchor.x = 1;
    }
  }

  hasTag(tag: string): boolean {
    return this.behavior.hasTag(tag);
  }

  get isDestroyed(): boolean {
    return this.behavior.isDestroyed;
  }

  public tick(): void {}

  public override destroy(): void {
    this.behavior.destroy();
    super.destroy();
  }
}

// 木（コンテナ）
export class Tree extends ContainerActor {
  constructor() {
    super(0, 0, ["tree"]);
    this.addActor(new TreePart(0, 32));
    this.addActor(new TreePart(16, 32, true));
    this.addActor(new TreePart(32, 16, true));
    this.addActor(new TreePart(48, 16));
    this.addActor(new TreePart(64, 32));
    this.addActor(new TreePart(80, 32, true));
  }
}

// テキスト
export class GameText extends TextActor {
  constructor(text: string, x: number, y: number, fontSize: number, fontFamily = "p12") {
    const style: Partial<TextStyle> = {
      fontFamily,
      fontSize,
      fill: 0x000000,
    };
    super(text, x, y, ["text"], 0, 0, style);
  }
}

// 矩形
export class RectActor extends GraphicsActor {
  constructor(x: number, y: number, width: number, height: number, color: number) {
    super(x, y, ["rect"]);
    this.rect(0, 0, width, height).fill(color);
  }
}
