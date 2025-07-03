// @ts-check

const width = 320;
const height = 240;
images.add("player", "../img/imomushi/player.gif");
images.add("block", "../img/imomushi/block.gif");

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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
    const x = (imgNo % 8) * width;
    const y = Math.floor(imgNo / 8) * height;
    return new Rectangle(x, y, width, height);
  });
};
class Player extends ContainerActor {
  constructor(bodyLength, x, y, stage) {
    super();

    /**
     * @type {Array<Body|Head>}
     */
    this.bodies = [
      ...Array(bodyLength)
        .fill()
        .map((_, i) => new Body(x, y, i % 2, stage).addTo(this)),
    ];
    this.head = new Head(x, y, stage).addTo(this);
    this.bodies.push(this.head);
  }

  update(input, camera) {
    super.update(input, camera);
    const k = 3;
    const directionLength = 4;
    const directionX = directionLength * Math.cos((this.head.directionAngle * Math.PI) / 180);
    const directionY = directionLength * Math.sin((this.head.directionAngle * Math.PI) / 180);

    for (let i = this.bodies.length - 1; i > 0; i--) {
      const preBody = this.bodies[i - 1];
      const body = this.bodies[i];
      preBody.vx = (body.rect.centerX - directionX - preBody.rect.centerX) / k;
      preBody.vy = (body.rect.centerY - directionY - preBody.rect.centerY) / k;
    }
  }
}
class PlayerSpriteActor extends SpriteActor {
  constructor(name, rect, stage) {
    super(name, rect);
    this.vx = 0;
    this.vy = 0;
    this.stage = stage;
  }
  update(input, camera) {
    super.update(input, camera);

    this.vy += 1 / 8;
    const isWall = (x, y) => {
      const block = this.stage[Math.floor(y / BLOCK_SIZE)][Math.floor(x / BLOCK_SIZE)];
      const blockData = BLOCK_DATA.get(block);
      return blockData.isWall;
    };
    if (isWall(this.rect.centerX + this.vx, this.rect.centerY)) {
      this.vx = 0;
    }
    if (isWall(this.rect.centerX + this.vx, this.rect.centerY + this.vy)) {
      this.vy = 0;
      this.vx /= 2;
    }

    this.x += this.vx;
    this.y += this.vy;
  }
  get hitboxRect() {
    return new Rectangle(this.x + this.rect.x + 2, this.y + this.rect.y + 2, this.rect.width - 4, this.rect.height - 4);
  }
}
class Head extends PlayerSpriteActor {
  constructor(x, y, stage) {
    const rect = new Rectangle(x, y, 16, 16);
    super("player", rect, stage);
    this.animation = /** @type {SpriteAnimationTrait} */ (this.addTrait(SpriteAnimationTrait));
    this.animation.add(new SpriteAnimation("head", imgNosToRect([0], 16, 16)));
    this.animation.play("head");
    this.thread = null;
    this.directionAngle = 0;
  }

  /**
   * @param {Input} input
   * @param {Camera} camera
   */
  update(input, camera) {
    super.update(input, camera);

    const k = 10;
    if (input.get("pointer0") > 0) {
      const { x, y } = input.getPointer();
      this.updateThread(x + camera.x, y + camera.y);
    } else {
      this.deleteThread();
    }

    if (this.vx > 0) {
      this.scaleX = 1;
      this.directionAngle = 0;
    } else if (this.vx < 0) {
      this.scaleX = -1;
      this.directionAngle = 180;
    }
  }

  updateThread(dx, dy) {
    if (!this.thread) {
      this.thread = new Thread(this, dx, dy, this.stage);
      this.emit("spawn", this.thread);
    } else {
    }
  }

  deleteThread() {
    if (this.thread) {
      this.thread.destroy();
      this.thread = null;
    }
  }

  get mouth() {
    return { x: Math.floor(this.x + 7.5), y: Math.floor(this.y + 13) };
  }
}
class Body extends PlayerSpriteActor {
  constructor(x, y, i, stage) {
    const rect = new Rectangle(x, y, 16, 16);
    super("player", rect, stage);
    this.animation = /** @type {SpriteAnimationTrait} */ (this.addTrait(SpriteAnimationTrait));
    this.animation.add(new SpriteAnimation("body", imgNosToRect([i + 1], 16, 16)));
    this.animation.play("body");
  }
}
class Thread extends StrokePathActor {
  constructor(head, destinationX, destinationY, stage) {
    super("#fff");
    this.head = head;
    this.destinationX = destinationX;
    this.destinationY = destinationY;
    this.stage = stage;
    this.state = "stretch";
    this.length = 0;
    this.shrinkPoint = null;
  }

  update(input, camera) {
    super.update(input, camera);

    this.beginPath();
    this.moveTo(this.head.mouth.x, this.head.mouth.y);
    if (this.state == "stretch") {
      const speed = 16;
      const angle = Math.atan2(this.destinationY - this.head.mouth.y, this.destinationX - this.head.mouth.x);
      this.length += speed;
      const x = this.head.mouth.x + Math.cos(angle) * this.length;
      const y = this.head.mouth.y + Math.sin(angle) * this.length;
      this.lineTo(x, y);

      const isWall = (x, y) => {
        const block = this.stage[Math.floor(y / BLOCK_SIZE)][Math.floor(x / BLOCK_SIZE)];
        const blockData = BLOCK_DATA.get(block);
        return blockData.isWall;
      };
      if (isWall(x, y)) {
        this.state = "shrink";
        this.shrinkPoint = { x, y };
      }
    } else if (this.state == "shrink") {
      const speed = 1 / 3;
      const angle = Math.atan2(this.shrinkPoint.y - this.head.mouth.y, this.shrinkPoint.x - this.head.mouth.x);
      this.head.vx += Math.cos(angle) * speed;
      this.head.vy += Math.sin(angle) * speed;
      this.head.directionAngle = (angle * 180) / Math.PI;

      this.lineTo(this.shrinkPoint.x, this.shrinkPoint.y);
    }
  }
}

class Block extends SpriteActor {
  constructor(type, x, y) {
    super("block", new Rectangle(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE));
    this.animation = /** @type {SpriteAnimationTrait} */ (this.addTrait(SpriteAnimationTrait));
    this.animation.add(new SpriteAnimation("#", imgNosToRect(BLOCK_DATA.get(type).imgNos, BLOCK_SIZE, BLOCK_SIZE)));
    this.animation.play("#");
  }
}

class Spider extends HitboxSpriteActor {
  constructor(x, y, stage, imgNos) {
    super("block", new Rectangle(x * BLOCK_SIZE, y * BLOCK_SIZE, 16, 16), new Rectangle(2, 2, 12, 12));
    this.stage = stage;
    this.animation = /** @type {SpriteAnimationTrait} */ (this.addTrait(SpriteAnimationTrait));
    this.animation.add(new SpriteAnimation("spider", imgNosToRect(imgNos, 16, 16)));
    this.animation.play("spider");
    this.state = "changeDirection";
    this.vx = 0;
    this.vy = 0;
    this.gravityDirection = { dx: 0, dy: 1 };
    this.direction = { dx: 0, dy: 0 };
    this.stateTime = 0;
  }

  update(input, camera) {
    super.update(input, camera);

    const isWall = (x, y) => {
      const block = this.stage[Math.floor(y / BLOCK_SIZE)][Math.floor(x / BLOCK_SIZE)];
      const blockData = BLOCK_DATA.get(block);
      return blockData.isWall;
    };
    switch (this.state) {
      case "changeDirection":
        this.gravityDirection = [
          //{ dx: 1, dy: 0 }, // right
          { dx: 0, dy: -1 }, // up
          // { dx: -1, dy: 0 }, // left
          { dx: 0, dy: 1 }, // down
        ][Math.floor(Math.random() * 2)];

        this.rotation = Math.atan2(this.gravityDirection.dy, this.gravityDirection.dx) * (180 / Math.PI) - 90;

        this.state = "move";
        break;
      case "directionToDown":
        // 下方向に向ける
        this.gravityDirection = { dx: 0, dy: 1 };
        this.rotation = 0;
        this.state = "move";
        break;
      case "move":
        // 移動
        const walkSpeed = 1;
        if (this.gravityDirection.dx == 0) {
          // 横方向に移動
          const dx = Math.random() < 0.5 ? -walkSpeed : walkSpeed;
          this.direction = { dx, dy: 0 };
        } else if (this.gravityDirection.dy == 0) {
          // 縦方向に移動
          this.vy = walkSpeed;
          const dy = Math.random() < 0.5 ? -walkSpeed : walkSpeed;
          this.direction = { dx: 0, dy };
        }

        this.state = "moving";
        this.stateTime = 0;
        break;
      case "moving":
        // 移動中
        if (Math.abs(this.vx) < Math.abs(this.direction.dx)) {
          this.vx += this.direction.dx;
        }
        if (Math.abs(this.vy) < Math.abs(this.direction.dy)) {
          this.vy += this.direction.dy;
        }

        if (Math.abs(this.vx) > 1) {
          this.state = "directionToDown";
          this.vx = 0;
        }

        if (this.stateTime++ > 20) {
          const random = Math.random();
          if (random < 0.1) {
            this.state = "changeDirection";
          } else if (random < 0.3) {
            this.state = "move";
          } else if (random < 0.7) {
            this.state = "stop";
          } else {
            this.state = "moving";
            this.stateTime = 0;
          }
        }

        break;
      case "stop":
        if (this.gravityDirection.dx != 0) {
          this.vy = 0;
        }
        if (this.gravityDirection.dy != 0) {
          this.vx = 0;
        }
        if (this.stateTime++ > 60) {
          const random = Math.random();
          if (random < 0.1) {
            this.state = "changeDirection";
          } else if (random < 0.3) {
            this.state = "move";
          } else if (random < 0.7) {
            this.state = "stop";
          } else {
            this.state = "moving";
            this.stateTime = 0;
          }
        }

        break;
    }

    this.vx += this.gravityDirection.dx / 16;
    this.vy += this.gravityDirection.dy / 16;

    if (isWall(this.rect.centerX + this.vx, this.rect.centerY)) {
      this.vx = 0;
    }
    if (isWall(this.rect.centerX, this.rect.centerY + this.vy)) {
      this.vy = 0;
    }

    this.x += this.vx;
    this.y += this.vy;
  }
}
class SpiderLeg extends StrokePathActor {
  constructor(spider) {
    super("#000");
    this.spider = spider;

    this.angles = [
      [0, 0],
      [0, 0],
    ];
    this.makeLegs();
    this.lineWidth = 0.8;
  }

  update(input, camera) {
    super.update(input, camera);

    if (this.spider.state == "moving" && this.time % 3 == 0) {
      this.makeLegs();
    }

    const legLength = 24;
    this.beginPath();
    for (let angle of this.angles) {
      const dx = this.spider.gravityDirection.dx * 5;
      const dy = this.spider.gravityDirection.dy * 5;
      this.moveTo(this.spider.rect.centerX - dx, this.spider.rect.centerY - dy);
      const x = this.spider.rect.centerX + Math.cos(angle[0]) * legLength;
      const y = this.spider.rect.centerY + Math.sin(angle[0]) * legLength;
      this.lineTo(x, y);
      const x2 = x + Math.cos(angle[1]) * legLength;
      const y2 = y + Math.sin(angle[1]) * legLength;
      this.lineTo(x2, y2);
    }
  }

  makeLegs() {
    for (let i = 0; i < this.angles.length; i++) {
      // 現在のgravitiyDirection
      const angelGD = Math.atan2(this.spider.gravityDirection.dy, this.spider.gravityDirection.dx);
      // ランダムな角度を加える
      const randomAngle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
      this.angles[i][0] = angelGD + Math.PI + randomAngle;
      this.angles[i][1] = angelGD - randomAngle;
    }
  }
}

class MainScene extends Scene {
  constructor(stageNum = 0) {
    super();
    const stage = STAGE_DATA[stageNum];
    const stageWidth = stage[0].length * BLOCK_SIZE;
    const stageHeight = stage.length * BLOCK_SIZE;
    new NullActor().addTo(this).update = () => {
      this.camera.x = clamp(Math.floor(this.player.head.rect.centerX - width / 2), 0, stageWidth - width);
      this.camera.y = clamp(Math.floor(this.player.head.rect.centerY - height / 2), 0, stageHeight - height);
    };
    const bg = new RectActor(new Rectangle(-16, -16, width + 32, height + 32), "#999").addTo(this);
    bg.parallaxFactorX = bg.parallaxFactorY = 0;
    this.stageLayer = new ContainerActor().addTo(this);
    this.enemyLayer = new ContainerActor().addTo(this);
    const { px, py } = this.renderStage(stage);
    this.player = new Player(bodyLength, px, py, stage).addTo(this);
    this.text = new TextActor("", 0, 0, 10, "#000", "p10").addTo(this);
    this.text.parallaxFactorX = this.text.parallaxFactorY = 0;

    {
      const bg = new RectActor(new Rectangle(0, height / 8, width, height / 4), "#000").addTo(this);
      bg.parallaxFactorX = bg.parallaxFactorY = 0;
      bg.alpha = 0.5;
      const stageTitle = new TextActor(
        `Stage ${stageNum + 1}\n\n異種生物遺伝資源応用センター`,
        width / 2,
        height / 4 - 18,
        12,
        "#fff",
        "p12"
      ).addTo(this);
      stageTitle.textAlign = "center";
      stageTitle.parallaxFactorX = stageTitle.parallaxFactorY = 0;

      stageTitle.updateEvents.push(() => {
        if (stageTitle.time > 60 * 2) {
          bg.alpha -= 0.01;
          if (bg.alpha <= 0) {
            bg.destroy();
          }
          stageTitle.alpha -= 0.01;
          if (stageTitle.alpha <= 0) {
            stageTitle.destroy();
          }
        }
      });
    }
  }

  /**
   * @param {Input} input
   * @param {Camera} camera
   */
  update(input, camera) {
    super.update(input, camera);

    if (input.get("pointer0") == 1) {
      this.text.text = `x: ${input.getPointer().x.toFixed(2)}, y: ${input.getPointer().y.toFixed(2)}`;
    }

    if (input.get("w") >= 1) {
      this.camera.y -= 2;
    }
    if (input.get("s") >= 1) {
      this.camera.y += 2;
    }
    if (input.get("a") >= 1) {
      this.camera.x -= 2;
    }
    if (input.get("d") >= 1) {
      this.camera.x += 2;
    }
  }

  /**
   * @param {string[]} stage
   */
  renderStage(stage) {
    let px, py;
    for (let h = 0; h < stage.length; h++) {
      const line = stage[h];
      for (let w = 0; w < line.length; w++) {
        const type = line[w];
        const sprite = BLOCK_DATA.get(type);
        if (sprite instanceof EntitySprite) {
          sprite.creator(w, h, stage, sprite.imgNos, this.enemyLayer);
          continue;
        }
        if (type == "@") {
          px = w * BLOCK_SIZE + BLOCK_SIZE / 2;
          py = h * BLOCK_SIZE;
          continue;
        }
        new Block(type, w, h).addTo(this.stageLayer);
      }
    }
    return { px, py };
  }
}

class TitleScene extends Scene {
  constructor() {
    super();
    new RectActor(new Rectangle(0, 0, width, height), "#999").addTo(this);
    const titleText = new TextActor("芋虫", width / 2, 24, 12, "#000", "p12").addTo(this);
    titleText.textAlign = "center";
    titleText.update = (input) => {
      if (input.get("pointer0") == 1) {
        this.changeScene(new MainScene());
      }
    };
    const startText = new TextActor("Tap to Start", width / 2, 48, 10, "#000", "p10").addTo(this);
    startText.textAlign = "center";

    const playerImage = new SpriteActor("player", new Rectangle(width / 2 - 18, 80, 48, 32)).addTo(this);
    const animation = /** @type {SpriteAnimationTrait} */ (playerImage.addTrait(SpriteAnimationTrait));
    animation.add(new SpriteAnimation("fly", imgNosToRect([0, 1, 2], 48, 32), 12, true));
    animation.play("fly");
  }
}

const fonts = {
  p10: new FontFace("p10", "url(../font/PixelMplus10-Regular.ttf)"),
  p12: new FontFace("p12", "url(../font/PixelMplus12-Regular.ttf)"),
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
    game.changeScene(new MainScene());
    game.start();
  });
});

let bodyLength = 5;
