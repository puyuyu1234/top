// @ts-check

const width = 96;
const height = 128;
images.add("player", "../img/imomushi/player.gif");
images.add("block", "../img/imomushi/block.gif");

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
    const directionLength = 4 * this.head.direction;

    for (let i = this.bodies.length - 1; i > 0; i--) {
      const preBody = this.bodies[i - 1];
      const body = this.bodies[i];
      preBody.vx = (body.rect.centerX - directionLength - preBody.rect.centerX) / k;
      preBody.vy = (body.rect.centerY - preBody.rect.centerY) / k;
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
}
class Head extends PlayerSpriteActor {
  constructor(x, y, stage) {
    const rect = new Rectangle(x, y, 16, 16);
    super("player", rect, stage);
    this.animation = /** @type {SpriteAnimationTrait} */ (this.addTrait(SpriteAnimationTrait));
    this.animation.add(new SpriteAnimation("head", imgNosToRect([0], 16, 16)));
    this.animation.play("head");
    this.direction = 1;
  }

  /**
   * @param {Input} input
   * @param {Camera} camera
   */
  update(input, camera) {
    super.update(input, camera);

    const k = 10;
    if (input.get("pointer0") > 0) {
      const pointer = input.getPointer();
      this.vx = (pointer.x + camera.x - this.rect.centerX) / k;
      this.vy = (pointer.y + camera.y - this.rect.centerY) / k;
    }

    if (this.vx > 0) {
      this.direction = this.scaleX = 1;
    } else if (this.vx < 0) {
      this.direction = this.scaleX = -1;
    }
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

class Block extends SpriteActor {
  constructor(type, x, y) {
    super("block", new Rectangle(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE));
    this.animation = /** @type {SpriteAnimationTrait} */ (this.addTrait(SpriteAnimationTrait));
    this.animation.add(new SpriteAnimation("#", imgNosToRect(BLOCK_DATA.get(type).imgNos, BLOCK_SIZE, BLOCK_SIZE)));
    this.animation.play("#");
  }
}

class MainScene extends Scene {
  constructor(stageNum = 0) {
    super();
    const stage = STAGE_DATA[stageNum];
    const bg = new RectActor(new Rectangle(-16, -16, width + 32, height + 32), "#999").addTo(this);
    bg.parallaxFactorX = bg.parallaxFactorY = 0;
    const { px, py } = this.renderStage(stage);
    this.player = new Player(bodyLength, px, py, stage).addTo(this);
    this.text = new TextActor("", 0, 0, 10, "#000", "p10").addTo(this);
  }

  /**
   * @param {Input} input
   * @param {Camera} camera
   */
  update(input, camera) {
    super.update(input, camera);

    camera.x = this.player.head.rect.centerX - width / 2;
    camera.y = this.player.head.rect.centerY - height / 2;

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
        if (line[w] == "@") {
          px = w * BLOCK_SIZE + BLOCK_SIZE / 2;
          py = h * BLOCK_SIZE;
          continue;
        }
        new Block(line[w], w, h).addTo(this);
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
