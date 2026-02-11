// @ts-check

const width = 96;
const height = 128;
const BASE = window.__BASE_URL__ ?? '';
images.add("player", `${BASE}/img/kudamono/player.gif`);
images.add("entity", `${BASE}/img/kudamono/entity.gif`);

class HitboxSpriteActor extends SpriteActor {
  constructor(name, rect, hitboxRect) {
    super(name, rect);
    this.hitbox = hitboxRect;
  }

  get hitboxRect() {
    return new Rectangle(this.x + this.hitbox.x, this.y + this.hitbox.y, this.hitbox.width, this.hitbox.height);
  }
}

const imgNosToRect = (imgNos, width, height) => {
  return imgNos.map((imgNo) => {
    const x = (imgNo % 4) * width;
    const y = Math.floor(imgNo / 4) * height;
    return new Rectangle(x, y, width, height);
  });
};
class Player extends HitboxSpriteActor {
  constructor() {
    const rect = new Rectangle(0, 80, 24, 32);
    const hitboxRect = new Rectangle(4, 0, 16, 4);
    super("player", rect, hitboxRect);
    this.animation = /** @type {SpriteAnimationTrait} */ (this.addTrait(SpriteAnimationTrait));
    this.animation.add(new SpriteAnimation("stand", imgNosToRect([0], 24, 32)));
    this.animation.add(new SpriteAnimation("walk", imgNosToRect([0, 1], 24, 32), 12, true));
    this.animation.add(new SpriteAnimation("dying", imgNosToRect([2], 24, 32)));
    this.animation.add(new SpriteAnimation("died", imgNosToRect([3], 24, 32)));
    this.animation.play("stand");
    this.isDying = false;
    this.on("dying", () => {
      if (this.isDying) return;
      this.isDying = true;
      this.time = 0;
      this.animation.play("dying");
    });
  }

  /** @param {Input} input */
  update(input, camera) {
    super.update(input, camera);
    if (this.isDying) {
      if (this.time > 30) {
        this.animation.play("died");
      }
      return;
    }

    const isKeysPressed = (...keys) => {
      return keys.some((key) => input.get(key) > 0);
    };

    if (isKeysPressed("ArrowRight", "d")) {
      if (this.x + this.rect.width >= width) return; // 画面外に出ないようにする
      this.x += 1;
      this.scaleX = 1;
      this.animation.play("walk", false);
    } else if (isKeysPressed("ArrowLeft", "a")) {
      if (this.x <= 0) return; // 画面外に出ないようにする
      this.x -= 1;
      this.scaleX = -1;
      this.animation.play("walk", false);
    } else {
      this.animation.play("stand");
    }
  }
}

const genID = function* () {
  let id = 0;
  while (true) {
    yield id++;
  }
};
const ID = genID();

class FallingEntity extends HitboxSpriteActor {
  constructor(x, level) {
    const rect = new Rectangle(x - 8, 0, 16, 16);
    const hitboxRect = new Rectangle(3, 12, 10, 4);
    super("entity", rect, hitboxRect);
    this.id = ID.next().value;
    this.level = level;
    this.vy = 0;
    this.animation = /** @type {SpriteAnimationTrait} */ (this.addTrait(SpriteAnimationTrait));
    this.animation.add(new SpriteAnimation("apple", imgNosToRect([0], 16, 16)));
    this.animation.add(new SpriteAnimation("bomb", imgNosToRect([1], 16, 16)));
    this.fall = this._fall();

    {
      const randomVX = Math.floor(4 * Math.random() - 2);
      const baseVX =
        this.level < 50 ? 0 : this.level < 100 ? randomVX / 8 : this.level < 150 ? randomVX / 6 : randomVX / 4;
      this.x -= baseVX * 30;
      this.vx = baseVX;
    }
  }

  update(input, camera) {
    super.update(input, camera);
    this.fall.next();
    if (this.rect.top >= height) {
      this.destroy();
    }
    this.x += this.vx;
    this.y += this.vy;
  }

  *_fall() {
    while (true) {
      // 最初ちょっと上に上がってから落下する
      // 速度はlevelに応じる
      const ay = (this.level + 100) / 4096;
      this.vy = ay * -1.5;
      while (true) {
        this.vy += ay;
        yield* this.wait(1);
      }
    }
  }

  *wait(frame) {
    for (let i = 0; i < frame; i++) yield;
  }

  handleCollision(player, scene) {}
}

class Apple extends FallingEntity {
  constructor(x, level) {
    super(x, level);
    this.animation.play("apple");
  }

  handleCollision(player, scene) {
    this.update = () => {
      if (this.time > 2) {
        this.destroy();
      }
      this.time++;
    };
    scene.score += 10;
  }
}

class Bomb extends FallingEntity {
  constructor(x, level) {
    super(x, level);
    this.animation.play("bomb");
  }

  handleCollision(player, scene) {
    player.emit("dying");
    this.update = () => {
      if (this.time == 30) {
        for (let i = 0; i < 100; i++) {
          // 爆発エフェクト
          new Particle(
            this.rect.centerX + ((Math.random() * 2 - 1) * this.width) / 4,
            this.rect.centerY + ((Math.random() * 2 - 1) * this.height) / 4,
            (Math.random() * 2 - 1) * 6,
            (Math.random() * 2 - 1) * 4
          ).addTo(scene);
          new Particle(
            player.rect.centerX + ((Math.random() * 2 - 1) * player.width) / 2,
            player.rect.centerY + ((Math.random() * 2 - 1) * player.height) / 4,
            ((Math.random() * 2 - 1) * 8) / 8,
            ((Math.random() * 2 - 1) * 4) / 8
          ).addTo(scene);
        }
        this.x = -10000;
      } else if (this.time == 60) {
        new RectActor(new Rectangle(8, 24, 80, 16), "#999").addTo(scene);
        const gameOver = new TextActor("Game Over", width / 2, 24, 12, "#000", "p12").addTo(scene);
        new RectActor(new Rectangle(4, 44, 88, 16), "#999").addTo(scene);
        const restartText = new TextActor("Tap to Restart", width / 2, 48, 10, "#000", "p10").addTo(scene);
        gameOver.textAlign = "center";
        restartText.textAlign = "center";
        restartText.update = (input) => {
          if (input.get("pointer0") == 1) {
            scene.changeScene(new MainScene());
          }
        };
      }
      this.time++;
    };
  }
}

class Particle extends RectActor {
  constructor(x, y, vx, vy) {
    super(new Rectangle(x, y, 1, 1), "#000");
    this.vx = vx;
    this.vy = vy;
  }

  update() {
    if (this.time > 10) {
      this.vx *= 0.6;
      this.vy *= 0.6;
    } else {
      this.vy += 0.1;
    }
    this.time++;

    this.x += this.vx;
    this.y += this.vy;
  }
}

class TreePart extends SpriteActor {
  constructor(rect) {
    super("entity", rect);
    this.animation = /** @type {SpriteAnimationTrait} */ (this.addTrait(SpriteAnimationTrait));
    this.animation.add(new SpriteAnimation("tree", imgNosToRect([2], 16, 16)));
    this.animation.play("tree");
  }
}

class Tree extends ContainerActor {
  constructor() {
    super();
    new TreePart(new Rectangle(0, 32, 16, 16)).addTo(this);
    new TreePart(new Rectangle(16, 32, 16, 16)).addTo(this).scaleX = -1;
    new TreePart(new Rectangle(32, 16, 16, 16)).addTo(this).scaleX = -1;
    new TreePart(new Rectangle(48, 16, 16, 16)).addTo(this);
    new TreePart(new Rectangle(64, 32, 16, 16)).addTo(this);
    new TreePart(new Rectangle(80, 32, 16, 16)).addTo(this).scaleX = -1;
  }
}

class MainScene extends Scene {
  constructor() {
    super();
    new RectActor(new Rectangle(0, 0, width, height), "#999").addTo(this);
    new Tree().addTo(this);
    this.player = new Player().addTo(this);
    this.score = 0;
    this.scoreText = new TextActor("", 2, 2, 12, "#000", "p12").addTo(this);
    this.scoreText.update = () => {
      this.scoreText.text = `Score: ${this.score}`;
    };
    this.level = 0;
    /** @type {Map<number, FallingEntity>} */
    this.fallingEntities = new Map();
  }

  update(input, camera) {
    super.update(input, camera);

    if (this.player.isDying) {
      return;
    }

    if (Math.random() < 0.03 + this.level * 0.0001) {
      this.level++;
      const x = Math.floor(Math.random() * width);
      const entity = Math.random() < 0.8 ? new Apple(x, this.level).addTo(this) : new Bomb(x, this.level).addTo(this);
      this.fallingEntities.set(entity.id, entity);
      entity.on("destroy", () => {
        this.fallingEntities.delete(entity.id);
      });
    }

    this.fallingEntities.forEach((entity) => {
      if (this.player.hitboxRect.isIntersect(entity.hitboxRect)) {
        entity.time = 0;
        entity.y = this.player.hitboxRect.bottom - entity.rect.height;
        this.fallingEntities.delete(entity.id);
        entity.handleCollision(this.player, this);
      }
    });
  }
}

class TitleScene extends Scene {
  constructor() {
    super();
    new RectActor(new Rectangle(0, 0, width, height), "#999").addTo(this);
    const titleText = new TextActor("くだもの\nキャッチ", width / 2, 32, 12, "#000", "p12").addTo(this);
    titleText.textAlign = "center";
    titleText.update = (input) => {
      if (input.get("pointer0") == 1) {
        this.changeScene(new MainScene());
      }
    };
    const startText = new TextActor("Tap to Start", width / 2, 64, 10, "#000", "p10").addTo(this);
    startText.textAlign = "center";

    const playerImage = new SpriteActor("player", new Rectangle(width / 2 - 12, 80, 24, 32)).addTo(this);
    const animation = /** @type {SpriteAnimationTrait} */ (playerImage.addTrait(SpriteAnimationTrait));
    animation.add(new SpriteAnimation("stand", imgNosToRect([0], 24, 32)));
    animation.play("stand");
  }
}

const fonts = {
  p10: new FontFace("p10", `url(${BASE}/fonts/PixelMplus10-Regular.ttf)`),
  p12: new FontFace("p12", `url(${BASE}/fonts/PixelMplus12-Regular.ttf)`),
};

// 複数フォントを並列読み込み
const loadFonts = async () => {
  const promises = Object.values(fonts).map((font) => font.load());
  const loadedFonts = await Promise.all(promises);
  loadedFonts.forEach((font) => document.fonts.add(font));
  return loadedFonts;
};

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([images.loadAll(), loadFonts()]);
  images.loadAll().then(() => {
    const game = new Game(width, height);

    document.getElementById("left-button")?.addEventListener("pointerdown", () => {
      game.canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    });
    document.getElementById("left-button")?.addEventListener("pointerup", () => {
      game.canvas.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowLeft" }));
    });
    document.getElementById("right-button")?.addEventListener("pointerdown", () => {
      game.canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    });
    document.getElementById("right-button")?.addEventListener("pointerup", () => {
      game.canvas.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowRight" }));
    });
    game.changeScene(new TitleScene());
    game.start();
  });
});
