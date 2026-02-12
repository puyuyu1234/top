import { AnimatedSprite } from "pixi.js";
import { Scene, AssetLoader } from "@puyuyu1234/ptre";
import { Player, Apple, Bomb, Particle, Tree, GameText, RectActor, FallingEntity } from "./actors";
import { WIDTH, HEIGHT, getGame } from "./index";

export abstract class BaseScene extends Scene {
  public addScore(_score: number): void {}
  public addParticle(_x: number, _y: number, _vx: number, _vy: number): void {}
  public showGameOver(): void {}
}

// タイトルシーン
export class TitleScene extends BaseScene {
  private clicked = false;

  constructor() {
    super();

    // 背景
    this.container.addChild(new RectActor(0, 0, WIDTH, HEIGHT, 0x999999));

    // タイトル
    const title = new GameText("くだもの\nキャッチ", WIDTH / 2, 32, 12, "p12");
    title.anchor.set(0.5, 0);
    this.container.addChild(title);

    // 開始テキスト
    const startText = new GameText("Tap to Start", WIDTH / 2, 64, 10, "p10");
    startText.anchor.set(0.5, 0);
    this.container.addChild(startText);

    // プレイヤー画像
    const assetLoader = AssetLoader.getInstance();
    const textures = assetLoader.getAnimationTextures("player", "stand");
    if (textures && textures.length > 0) {
      const playerSprite = new AnimatedSprite(textures);
      playerSprite.x = WIDTH / 2 - 12;
      playerSprite.y = 80;
      playerSprite.width = 24;
      playerSprite.height = 32;
      this.container.addChild(playerSprite);
    }

    // クリックイベント
    this.container.eventMode = "static";
    (this.container as any).on("pointerdown", () => {
      this.clicked = true;
    });
  }

  public override tick(): void {
    super.tick();
    const input = getGame().getInput();
    if (this.clicked || input.isKeyPressed("Space")) {
      this.changeScene(new MainScene());
    }
  }
}

// メインシーン
export class MainScene extends BaseScene {
  private player: Player;
  private entities = new Map<number, FallingEntity>();
  private particles: Particle[] = [];
  private scoreText: GameText;
  private score = 0;
  private level = 0;
  private isGameOver = false;

  constructor() {
    super();

    // 背景
    this.container.addChild(new RectActor(0, 0, WIDTH, HEIGHT, 0x999999));

    // 木
    const tree = new Tree();
    this.add(tree);

    // プレイヤー
    this.player = new Player();
    this.add(this.player);

    // スコア
    this.scoreText = new GameText("Score: 0", 2, 2, 12, "p12");
    this.container.addChild(this.scoreText);

    // クリックイベント（モバイル用）
    this.container.eventMode = "static";
  }

  public override tick(): void {
    super.tick();

    // プレイヤー更新
    this.player.handleInput();

    if (this.isGameOver) {
      // パーティクル更新
      this.particles.forEach((p) => p.tick());
      return;
    }

    // エンティティ生成
    if (Math.random() < 0.03 + this.level * 0.0001) {
      this.level++;
      const x = Math.floor(Math.random() * WIDTH);
      const entity = Math.random() < 0.8 ? new Apple(x, this.level) : new Bomb(x, this.level);
      this.entities.set(entity.id, entity);
      this.add(entity);
    }

    // エンティティ更新（tick()はSceneが自動で呼ぶ）
    this.entities.forEach((entity, id) => {
      // 画面外
      if (entity.isOutOfBounds()) {
        entity.destroy();
        this.entities.delete(id);
        return;
      }

      // 衝突判定
      if (!this.player.isDying && this.player.intersects(entity)) {
        entity.y = this.player.hitboxRect.bottom - entity.height;
        entity.handleCollision(this.player, this);
        this.entities.delete(id);
      }
    });

    // パーティクル更新
    this.particles.forEach((p) => p.tick());

    // スコア表示更新
    this.scoreText.text = `Score: ${this.score}`;
  }

  public override addScore(score: number): void {
    this.score += score;
  }

  public override addParticle(x: number, y: number, vx: number, vy: number): void {
    const p = new Particle(x, y, vx, vy);
    this.particles.push(p);
    this.container.addChild(p);
  }

  public override showGameOver(): void {
    this.isGameOver = true;

    // Game Over表示
    const bgRect = new RectActor(8, 24, 80, 16, 0x999999);
    this.container.addChild(bgRect);

    const gameOverText = new GameText("Game Over", WIDTH / 2, 24, 12, "p12");
    gameOverText.anchor.set(0.5, 0);
    this.container.addChild(gameOverText);

    const restartBg = new RectActor(4, 44, 88, 16, 0x999999);
    this.container.addChild(restartBg);

    const restartText = new GameText("Tap to Restart", WIDTH / 2, 48, 10, "p10");
    restartText.anchor.set(0.5, 0);
    this.container.addChild(restartText);

    // リスタート用クリックイベント
    (this.container as any).on("pointerdown", () => {
      this.changeScene(new MainScene());
    });
  }
}
