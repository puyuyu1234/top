// @ts-check

const width = 96;
const height = 128;
images.add("player", "../img/kudamono/player.gif");
images.add("entity", "../img/kudamono/entity.gif");

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
    if (input.get("pointer0") > 0) {
      const pointer = input.getPointer();
      const tolerance = 5;
      if (this.rect.centerX < pointer.x - tolerance) {
        this.x += 1;
        this.scaleX = 1;
        this.animation.play("walk", false);
      } else if (this.rect.centerX > pointer.x + tolerance) {
        this.x -= 1;
        this.scaleX = -1;
        this.animation.play("walk", false);
      } else {
        this.animation.play("stand");
      }
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
    this.vx = 0;
    this.vy = 0;
    this.animation = /** @type {SpriteAnimationTrait} */ (this.addTrait(SpriteAnimationTrait));
    this.animation.add(new SpriteAnimation("apple", imgNosToRect([0], 16, 16)));
    this.animation.add(new SpriteAnimation("bomb", imgNosToRect([1], 16, 16)));
    this.fall = this._fall();
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
      const baseVx = this.level < 100 ? 0 : Math.floor(4 * Math.random() - 2) / 4;
      const ay = (this.level + 100) / 1024 / 4;
      this.vy = ay * -1.5;
      while (true) {
        this.vx = baseVx;
        this.vy += ay;
        yield* this.wait(1);
      }
    }
  }

  *wait(frame) {
    for (let i = 0; i < frame; i++) yield;
  }
}

class Apple extends FallingEntity {
  constructor(x, level) {
    super(x, level);
    this.animation.play("apple");
  }
}

class Bomb extends FallingEntity {
  constructor(x, level) {
    super(x, level);
    this.animation.play("bomb");
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

class MainScene extends Scene {
  constructor() {
    super();
    new RectActor(new Rectangle(0, 0, width, height), "#999").addTo(this);
    this.player = new Player().addTo(this);
    this.score = 0;
    this.scoreText = new TextActor("", 2, 2, 12, "#000").addTo(this);
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
        if (entity instanceof Apple) {
          entity.update = () => {
            if (entity.time > 2) {
              entity.destroy();
            }
            entity.time++;
          };
          this.score += 10;
        } else if (entity instanceof Bomb) {
          this.player.emit("dying");
          entity.update = () => {
            if (entity.time == 30) {
              for (let i = 0; i < 100; i++) {
                // 爆発エフェクト
                new Particle(
                  entity.rect.centerX + ((Math.random() * 2 - 1) * entity.width) / 4,
                  entity.rect.centerY + ((Math.random() * 2 - 1) * entity.height) / 4,
                  (Math.random() * 2 - 1) * 6,
                  (Math.random() * 2 - 1) * 4
                ).addTo(this);
                new Particle(
                  this.player.rect.centerX + ((Math.random() * 2 - 1) * this.player.width) / 2,
                  this.player.rect.centerY + ((Math.random() * 2 - 1) * this.player.height) / 4,
                  ((Math.random() * 2 - 1) * 8) / 8,
                  ((Math.random() * 2 - 1) * 4) / 8
                ).addTo(this);
              }
              entity.x = -10000;
            } else if (entity.time > 60) {
              const gameOver = new TextActor("Game Over", width / 2, 24, 16, "#000").addTo(this);
              const restartText = new TextActor("Tap to Restart", width / 2, 48, 12, "#000").addTo(this);
              gameOver.textAlign = "center";
              restartText.textAlign = "center";
              restartText.update = () => {
                if (input.get("pointer0") == 1) {
                  this.changeScene(new MainScene());
                }
              };
            }
            entity.time++;
          };
        }
      }
    });
  }
}

class TitleScene extends Scene {
  constructor() {
    super();
    new RectActor(new Rectangle(0, 0, width, height), "#999").addTo(this);
    const titleText = new TextActor("くだもの\nキャッチゲーム", width / 2, 32, 12, "#000").addTo(this);
    titleText.textAlign = "center";
    titleText.update = (input) => {
      if (input.get("pointer0") == 1) {
        this.changeScene(new MainScene());
      }
    };
    const startText = new TextActor("Tap to Start", width / 2, 64, 10, "#000").addTo(this);
    startText.textAlign = "center";

    const playerImage = new SpriteActor("player", new Rectangle(width / 2 - 12, 80, 24, 32)).addTo(this);
    const animation = /** @type {SpriteAnimationTrait} */ (playerImage.addTrait(SpriteAnimationTrait));
    animation.add(new SpriteAnimation("stand", imgNosToRect([0], 24, 32)));
    animation.play("stand");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  images.loadAll().then(() => {
    const game = new Game(width, height);
    game.changeScene(new TitleScene());
    game.start();
  });
});
