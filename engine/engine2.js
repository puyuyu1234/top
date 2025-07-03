// @ts-check
"use strict";

class Rectangle {
  /**
   * @param {number} x - 左上x座標
   * @param {number} y - 左上y座標
   * @param {number} width - 幅
   * @param {number} height - 高さ
   */
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * @param {Rectangle} rect - 矩形
   * @returns {boolean} - 矩形が重なっているか
   */
  isIntersect(rect) {
    const horizontal = this.left <= rect.right && this.right >= rect.left;
    const vertical = this.top <= rect.bottom && this.bottom >= rect.top;
    return horizontal && vertical;
  }

  /**
   * @param {number} x - x座標
   * @param {number} y - y座標
   * @returns {boolean} - 座標が矩形内にあるか
   */
  contains(x, y) {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
  }

  /**
   * @returns {Rectangle} - 矩形のコピー
   */
  clone() {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }

  get left() {
    return this.x;
  }
  get right() {
    return this.x + this.width - 1;
  }
  get top() {
    return this.y;
  }
  get bottom() {
    return this.y + this.height - 1;
  }
  get centerX() {
    return this.x + Math.floor(this.width / 2);
  }
  get centerY() {
    return this.y + Math.floor(this.height / 2);
  }
  get center() {
    return [this.centerX, this.centerY];
  }
}

/**
 * @typedef {Function & {originalListener?: Function}} eventFunction
 */
class EventEmitter {
  constructor() {
    /**
     * @type {Map<string, eventFunction[]>}
     */
    this.events = new Map();
  }

  /**
   * @param {string} event
   * @param {Function} listener
   */
  on(event, listener) {
    const listeners = this.events.get(event) ?? [];
    listeners.push(listener);
    this.events.set(event, listeners);
  }

  /**
   * イベントを一度だけ実行するリスナーを追加
   * @param {string} event
   * @param {Function} listener
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    onceWrapper.originalListener = listener;

    this.on(event, onceWrapper);
  }

  /**
   * @param {string} event
   * @param {Function} listener
   */
  off(event, listener) {
    const listeners = this.events.get(event) ?? [];
    const index = listeners.findIndex((l) => l === listener || (l.originalListener && l.originalListener === listener));

    if (index !== -1) {
      listeners.splice(index, 1);
      this.events.set(event, listeners);
    }
  }

  /**
   * @param {string} event
   * @param {any[]} args
   */
  emit(event, ...args) {
    for (const listener of [...(this.events.get(event) ?? [])]) {
      listener(...args);
    }
  }
}

class SpriteAnimation {
  /**
   * @param {string} name
   * @param {Rectangle[]} frames
   */
  constructor(name, frames, frameRate = 0, loop = false) {
    this.name = name;
    this.frames = frames;
    this.frameRate = frameRate;
    this.loop = loop;
  }
}

/**
 * トレイト基底クラス
 * アクターに機能を追加するための拡張可能なクラス
 */
class Trait {
  /**
   * @param {Actor} owner - トレイトを所有するアクター
   */
  constructor(owner, options = {}) {
    this.owner = owner;
    this.options = options;

    // クラス名をキーとして保存
    const traitName = this.constructor.name;
    this.owner.traits.set(traitName, this);

    // 初期化
    this.init();
  }

  /**
   * トレイトの初期化処理
   * サブクラスでオーバーライド
   */
  init() {}

  /**
   * 更新処理 - アクターの更新時に呼ばれる
   * @param {Input} input - 入力
   * @param {Camera} camera - カメラ
   */
  update(input, camera) {}

  /**
   * トレイトを削除
   */
  remove() {
    if (this.owner.traits) {
      this.owner.traits.delete(this.constructor.name);
    }
    this.onRemove();
  }

  /**
   * トレイト削除時の後処理
   * サブクラスでオーバーライド
   */
  onRemove() {}
}

/**
 * アニメーショントレイト
 * SpriteActorにアニメーション機能を追加する
 */
class SpriteAnimationTrait extends Trait {
  /**
   * @param {SpriteActor} owner - 所有者
   * @param {Object} options - オプション
   */
  constructor(owner, options = {}) {
    if (!(owner instanceof SpriteActor)) {
      throw new Error("AnimationTrait requires a SpriteActor");
    }
    super(owner, options);

    // アニメーション定義を保持するマップ
    /** @type {Map<string, SpriteAnimation>} */
    this.animations = new Map();

    // 現在のアニメーション状態
    /** @type {SpriteAnimation | null} */
    this.currentAnimation = null;
    this.frameCounter = 0;
    this.frameIndex = 0;
    this.isPlaying = false;
  }

  /**
   * アニメーション定義を追加
   * @param {SpriteAnimation} animation
   */
  add(animation) {
    const name = animation.name;
    this.animations.set(name, animation);
    return this;
  }

  /**
   * アニメーションを再生
   * @param {string} name - アニメーション名
   * @param {boolean} reset - フレームをリセットするかどうか
   */
  play(name, reset = true) {
    const animation = this.animations.get(name);
    if (!animation) return this;

    this.currentAnimation = animation;
    if (reset) {
      this.frameCounter = 0;
      this.frameIndex = 0;
    }

    this.isPlaying = true;
    const owner = /** @type {SpriteActor} */ (this.owner);
    owner.sourceRect = this.currentAnimation.frames[this.frameIndex];
    return this;
  }

  /**
   * アニメーションの停止
   */
  stop() {
    this.isPlaying = false;
    return this;
  }

  /**
   * フレームの更新
   */
  update() {
    if (!this.isPlaying || !this.currentAnimation?.frameRate) return;
    this.frameCounter++;
    if (this.frameCounter >= this.currentAnimation.frameRate) {
      this.frameCounter = 0;
      this.frameIndex++;

      if (this.frameIndex >= this.currentAnimation.frames.length) {
        if (this.currentAnimation.loop) {
          this.frameIndex = 0;
        } else {
          this.frameIndex = this.currentAnimation.frames.length - 1;
          this.isPlaying = false;
        }
      }

      const owner = /** @type {SpriteActor} */ (this.owner);
      owner.sourceRect = this.currentAnimation.frames[this.frameIndex];
    }
  }
}

class ImageManager {
  constructor() {
    /** @type {Map<string, HTMLImageElement>} */
    this.images = new Map();
    this.promises = new Map();
  }

  /**
   * @param {string} name
   * @param {string} src
   */
  add(name, src) {
    if (this.images.has(name)) {
      return this.images.get(name);
    }
    const img = new Image();
    this.images.set(name, img);
    this.promises.set(
      name,
      new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error(`Failed to load image: ${name} (${src})`));
      })
    );
    img.src = src;
    return img;
  }

  async loadAll() {
    await Promise.all(this.promises.values());
    this.promises.clear();
  }

  /**
   * @param {string} name
   */
  get(name) {
    return this.images.get(name) ?? null;
  }
}
const images = new ImageManager();

class Actor extends EventEmitter {
  /**
   * @param {Rectangle} rect
   * @param {string[]} tags
   */
  constructor(rect, tags = []) {
    super();
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
    this.tags = tags;

    this.scaleX = this.scaleY = 1;
    this.alpha = 1;
    this.rotation = 0;
    this.parallaxFactorX = this.parallaxFactorY = 1;
    /** @type {{x:number|null, y:number|null}} */
    this.prevCamera = { x: 0, y: 0 };

    this.traits = new Map();
    /** @type {{(input:Input, camera:Camera)}[]} */
    this.updateEvents = [];
    this.time = -1;
  }

  /**
   * @param {Input} input
   * @param {Camera} camera
   */
  update(input, camera) {
    this.time++;
    if (camera) {
      if (this.prevCamera.x !== null && this.prevCamera.y !== null) {
        this.x += (camera.x - this.prevCamera.x) * (1 - this.parallaxFactorX);
        this.y += (camera.y - this.prevCamera.y) * (1 - this.parallaxFactorY);
      }
      this.prevCamera = { x: camera.x, y: camera.y };
    }
    for (const trait of this.traits.values()) {
      trait.update(input, camera);
    }
    for (const event of this.updateEvents) event(input, camera);
  }

  /**
   * @param {CanvasRenderingContext2D} target
   */
  render(target) {}

  /**
   * @param {Actor} actor
   */
  spawn(actor) {
    this.emit("spawn", actor);
  }

  destroy() {
    this.emit("destroy", this);
  }

  /**
   * @param {string} tag
   */
  hasTag(tag) {
    return this.tags.includes(tag);
  }

  /**
   * @param {Container|ContainerActor|StaticContainerActor} container
   */
  addTo(container) {
    container.add(this);
    return this;
  }

  /**
   * トレイトを追加
   * @param {typeof Trait} TraitClass - 追加するトレイトのクラス
   * @param {any} options - トレイト初期化オプション
   */
  addTrait(TraitClass, options = {}) {
    const trait = new TraitClass(this, options);
    return trait;
  }
  /**
   * 特定のトレイトを取得
   * @param {string|typeof Trait} traitClassOrName - トレイトのクラスまたは名前
   * @returns {Trait|null} - トレイトインスタンス（存在しなければnull）
   */
  getTrait(traitClassOrName) {
    if (!this.traits) return null;

    const traitName = typeof traitClassOrName === "string" ? traitClassOrName : traitClassOrName.name;

    return this.traits.get(traitName) || null;
  }

  /**
   * トレイトを持っているか判定
   * @param {string|typeof Trait} traitClassOrName - トレイトのクラスまたは名前
   * @returns {boolean} - トレイトを持っているか
   */
  hasTrait(traitClassOrName) {
    return this.getTrait(traitClassOrName) !== null;
  }

  /**
   * トレイトを削除
   * @param {string|typeof Trait} traitClassOrName - トレイトのクラスまたは名前
   * @returns {boolean} - 削除に成功したか
   */
  removeTrait(traitClassOrName) {
    const trait = this.getTrait(traitClassOrName);
    if (trait) {
      trait.remove();
      return true;
    }
    return false;
  }

  get rect() {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }
}

class NullActor extends Actor {
  constructor() {
    super(new Rectangle(0, 0, 0, 0), []);
  }
}

class RectActor extends Actor {
  /**
   * @param {Rectangle} rect
   * @param {string} color
   */
  constructor(rect, color, tags = []) {
    super(rect, tags);
    this.color = color;
  }

  /**
   * @param {CanvasRenderingContext2D} target
   */
  render(target) {
    target.fillStyle = this.color;
    target.globalAlpha = this.alpha;
    target.fillRect(this.x, this.y, this.width, this.height);
  }
}

/**
 * 16進数カラーコードをRGBA配列に変換します。
 * 例: "#000" -> [0, 0, 0, 255]
 * 例: "#FF0000" -> [255, 0, 0, 255]
 *
 * @param {string} hex - 16進数カラーコード (例: "#RRGGBB" または "#RGB")
 * @returns {number[]} RGBA配列 [R, G, B, A]
 */
function hexToRgba(hex) {
  let r = 0,
    g = 0,
    b = 0,
    a = 255; // デフォルトは不透明

  // '#' を取り除く
  const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;

  // 3桁の短縮形を6桁に展開
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  }
  // 6桁の形式
  else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  // その他の形式（無効な入力）の場合は、デフォルト値（黒）を返すかエラーを投げるなど
  // ここでは単純にデフォルト値を返します
  else {
    console.warn(`Invalid hex color format: ${hex}. Returning black.`);
    return [0, 0, 0, 255]; // 無効な場合は黒を返す
  }

  return [r, g, b, a];
}
class StrokePathActor extends Actor {
  /**
   * @param {(string|CanvasGradient|CanvasPattern)} color
   * @param {string[]} [tags=[]]
   */
  constructor(color, tags = []) {
    super(new Rectangle(0, 0, 0, 0), tags);
    this.color = color;
    this.paths = [];
    this.lineWidth = 1;
    /** @type {CanvasLineJoin} */
    this.lineJoin = "round";
  }

  beginPath() {
    this.paths = [];
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  moveTo(x, y) {
    this.paths.push(["moveTo", x, y]);
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  lineTo(x, y) {
    this.paths.push(["lineTo", x, y]);
  }

  update(input, camera) {
    super.update(input, camera);
    this.camera = camera;
  }

  /**
   * ピクセルを設定するヘルパー関数
   * @param {ImageData} imageData
   * @param {number} x
   * @param {number} y
   * @param {number[]} rgba - [R, G, B, A] の配列
   */
  _setPixel(imageData, x, y, rgba) {
    const width = imageData.width;
    const height = imageData.height;

    // 座標がCanvasの範囲内かチェック
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const index = (Math.round(y) * width + Math.round(x)) * 4;
      imageData.data[index] = rgba[0]; // R
      imageData.data[index + 1] = rgba[1]; // G
      imageData.data[index + 2] = rgba[2]; // B
      imageData.data[index + 3] = rgba[3]; // A
    }
  }

  /**
   * Bresenham's Line Algorithm を使って線上のピクセルを決定し、ImageDataに書き込む
   * @param {ImageData} imageData
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number[]} rgba - [R, G, B, A] の配列
   */
  _drawLineBresenham(imageData, x1, y1, x2, y2, rgba) {
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    x2 = Math.round(x2);
    y2 = Math.round(y2);

    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = x1 < x2 ? 1 : -1;
    let sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
      this._setPixel(imageData, x, y, rgba);

      if (x === x2 && y === y2) break;
      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} target
   */
  render(target) {
    super.render(target);

    // Canvasの現在のピクセルデータを取得
    // 注意: getImageDataはCanvas全体のサイズが必要です。
    // target.canvas は HTMLCanvasElement を参照します。
    const canvasWidth = target.canvas.width;
    const canvasHeight = target.canvas.height;
    const imageData = target.getImageData(0, 0, canvasWidth, canvasHeight);

    let rgbaColor;

    // this.color が文字列の場合のみ変換を試みる
    if (typeof this.color === "string") {
      // "#000" や "#FF0000" などの16進数カラーコードを想定
      if (this.color.startsWith("#")) {
        rgbaColor = hexToRgba(this.color);
      }
      // 他の文字列形式 (例: "red", "blue") は現在の関数では変換できないため、
      // 必要であればここに別の変換ロジックを追加するか、
      // 別の関数 (例: CSSカラーネームからRGBAへの変換) を呼び出す
      else {
        console.warn(`Unsupported color string format: ${this.color}. Defaulting to black.`);
        rgbaColor = [0, 0, 0, 255]; // サポート外の場合は黒
      }
    }
    // CanvasGradient や CanvasPattern は ImageData では直接使えないので、
    // ここでは考慮しません。必要であれば、事前に特定の単色にフォールバックさせるなどの
    // ロジックを追加してください。
    else {
      console.warn(`Unsupported color type: ${typeof this.color}. Defaulting to black.`);
      rgbaColor = [0, 0, 0, 255]; // 未対応の型は黒
    }

    let currentX = 0;
    let currentY = 0;

    for (const [op, ...args] of this.paths) {
      const dx = this.camera.x;
      const dy = this.camera.y;
      if (op === "moveTo") {
        currentX = Math.round(args[0] - dx);
        currentY = Math.round(args[1] - dy);
      } else if (op === "lineTo") {
        const x2 = Math.round(args[0] - dx);
        const y2 = Math.round(args[1] - dy);
        this._drawLineBresenham(imageData, currentX, currentY, x2, y2, rgbaColor);
        currentX = x2;
        currentY = y2;
      }
    }

    target.putImageData(imageData, 0, 0);
  }
}

class TextActor extends Actor {
  /**
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {number} size
   * @param {string} color
   */
  constructor(text, x, y, size, color, family = "'MS Gothic', 'ＭＳ ゴシック', 'MS ゴシック', monospace", tags = []) {
    super(new Rectangle(x, y, 0, 0), tags);
    this.text = text;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.size = size;
    this.font = `${size}px ${family}`;

    /** @type {CanvasTextAlign} */ this.textAlign = "left";
    /** @type {CanvasTextBaseline} */ this.textBaseline = "top";
  }

  /**
   * @param {CanvasRenderingContext2D} target
   */
  render(target) {
    target.fillStyle = this.color;
    target.font = this.font;
    target.textAlign = this.textAlign;
    target.textBaseline = this.textBaseline;
    target.globalAlpha = this.alpha;
    this.text.split("\n").forEach((line, i) => {
      target.fillText(line, this.x, this.y + this.size * i);
    });
  }
}

class SpriteActor extends Actor {
  /**
   * @param {string} name
   * @param {Rectangle} rect
   */
  constructor(name, rect, tags = []) {
    super(rect, tags);
    this.image = images.get(name);
    if (!this.image) {
      throw new Error(`Image not found: ${name}`);
    }
    this.sourceRect = new Rectangle(0, 0, this.image.width, this.image.height);
  }

  /**
   * @param {CanvasRenderingContext2D} target
   */
  render(target) {
    target.globalAlpha = this.alpha;
    target.save();
    const centerX = this.rect.centerX;
    const centerY = this.rect.centerY;
    const x = (this.x | 0) - centerX;
    const y = (this.y | 0) - centerY;
    target.translate(centerX | 0, centerY | 0);
    target.scale(this.scaleX, this.scaleY);
    target.rotate((this.rotation * Math.PI) / 180);
    target.drawImage(
      this.image,
      this.sourceRect.x,
      this.sourceRect.y,
      this.sourceRect.width,
      this.sourceRect.height,
      x | 0,
      y | 0,
      this.width,
      this.height
    );
    target.restore();
  }
}

class Container extends EventEmitter {
  constructor() {
    super();
    this.children = new Set();
  }

  /**
   * @param {Actor} actor
   */
  add(actor) {
    this.children.add(actor);
    actor.on("spawn", (ac) => {
      this.add(ac);
    });
    actor.on("destroy", () => {
      this.remove(actor);
    });
  }

  /**
   * @param {Actor} actor
   */
  remove(actor) {
    this.children.delete(actor);
  }

  /**
   * @param {Input} input
   * @param {Camera} camera
   */
  update(input, camera) {
    for (const child of this.children) {
      child.update(input, camera);
    }
  }

  /**
   * @param {CanvasRenderingContext2D} target
   */
  render(target) {
    for (const child of this.children) {
      child.render(target);
    }
  }
}

class ContainerActor extends Actor {
  constructor(tags = []) {
    super(new Rectangle(0, 0, 0, 0), tags);
    this.container = new Container();
  }

  /**
   * @param {Actor} actor
   */
  add(actor) {
    this.container.add(actor);
  }
  /**
   * @param {Actor} actor
   */
  remove(actor) {
    this.container.remove(actor);
  }
  /**
   * @param {Input} input
   * @param {Camera} camera
   */
  update(input, camera) {
    this.container.update(input, camera);
  }
  /**
   * @param {CanvasRenderingContext2D} target
   */
  render(target) {
    this.container.render(target);
  }
}

class StaticContainerActor extends Actor {
  /**
   * @param {Rectangle} rect
   */
  constructor(rect, tags = []) {
    super(rect, tags);
    this.canvas = document.createElement("canvas");
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * @param {Actor} actor
   */
  add(actor) {
    if (this.ctx) {
      this.ctx.translate(-this.x, -this.y);
      actor.render(this.ctx);
      this.ctx.translate(this.x, this.y);
    }
  }

  /**
   * @param {CanvasRenderingContext2D} target
   */
  render(target) {
    target.drawImage(this.canvas, this.x, this.y, this.width, this.height);
  }
}

class Scene extends Container {
  constructor() {
    super();
    /**
     * @type {Camera | null}
     */
    this.camera = null;
    this.cameraController = new NullActor().addTo(this);
  }

  /**
   * @param {Scene[]} newScenes
   */
  changeScene(...newScenes) {
    this.emit("changeScene", ...newScenes);
  }
}

class Game {
  /**
   * @param {number} width
   * @param {number} height
   */
  constructor(width, height, fps = 60) {
    const canvasContainer = document.getElementById("canvas-container");
    if (!canvasContainer) {
      throw new Error("Canvas container not found");
    }
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.tabIndex = 0;
    this.canvas.addEventListener("focus", sounds.init.bind(sounds), { once: true });
    canvasContainer.appendChild(this.canvas);
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get 2D context");
    }
    this.ctx = context;
    this.ctx.imageSmoothingEnabled = false;
    this.camera = new Camera(this.ctx, new Rectangle(0, 0, width, height));
    this.input = new Input(this.canvas);
    this.currentScenes = [];
    this.fps = fps;

    this.prevTime = 0;
    this.lag = 0;
  }

  sceneChangeListener = (...newScenes) => {
    this.changeScene(...newScenes);
  };

  /**
   * @param {Scene[]} newScenes
   */
  changeScene(...newScenes) {
    this.currentScenes.forEach((scene) => {
      scene.off("changeScene", this.sceneChangeListener);
    });
    this.currentScenes = newScenes;
    this.currentScenes.forEach((scene) => {
      scene.on("changeScene", this.sceneChangeListener);
      scene.camera = this.camera;
    });
  }

  /**
   * @param {number} timeStamp
   */
  loop(timeStamp) {
    const deltaTime = timeStamp - this.prevTime;
    this.prevTime = timeStamp;
    this.lag += deltaTime;
    const fpsInterval = 1000 / this.fps;

    // ブラウザが非アクティブなどで大幅に時間が経過した場合、lagをリセットする
    if (this.lag >= fpsInterval * 3) {
      this.lag = fpsInterval;
    }

    while (this.lag >= fpsInterval * 0.9) {
      this.input.update();
      for (const scene of this.currentScenes) {
        scene.update(this.input, this.camera);
      }
      this.lag -= fpsInterval;
    }

    this.camera.applyTransform();
    for (const scene of this.currentScenes) {
      scene.render(this.ctx);
    }
    this.camera.resetTransform();

    requestAnimationFrame(this.loop.bind(this));
  }

  start() {
    requestAnimationFrame(this.loop.bind(this));
  }
}

class Camera {
  /**
   * @param {CanvasRenderingContext2D} target
   * @param {Rectangle} rect
   */
  constructor(target, rect) {
    this.target = target;
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
    this.rotation = 0;
  }

  applyTransform() {
    this.target.save();
    const scaleX = this.target.canvas.width / this.width;
    const scaleY = this.target.canvas.height / this.height;
    this.target.scale(scaleX, scaleY);
    this.target.translate(-this.x | 0, -this.y | 0);

    const radians = (this.rotation * Math.PI) / 180;
    const center = this.rectangle.center;
    this.target.translate(center[0], center[1]);
    this.target.rotate(radians);
    this.target.translate(-center[0], -center[1]);
  }

  resetTransform() {
    this.target.restore();
  }

  get rectangle() {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }
}

class Input {
  constructor(target) {
    /** @private */
    this.pressedKeys = new Map();
    /** @private */
    this.keyPressDuration = new Map();
    /** @private */
    this.pointerPosition = { x: 0, y: 0 };
    /** @private */
    this.prevPointerPosition = { x: 0, y: 0 };
    /** @private */
    this.pointerDelta = { x: 0, y: 0 };
    /** @private */
    this.currentPointerPosition = { x: 0, y: 0 };
    target.addEventListener("keydown", (e) => {
      e.preventDefault();
      this.pressedKeys.set(e.key, true);
    });
    target.addEventListener("keyup", (e) => {
      this.pressedKeys.set(e.key, false);
    });
    target.addEventListener("pointerdown", (e) => {
      this.pressedKeys.set("pointer" + 0, true);
    });
    target.addEventListener("pointerup", (e) => {
      this.pressedKeys.set("pointer" + 0, false);
    });
    target.addEventListener("pointermove", (e) => {
      const rect = target.getBoundingClientRect();
      this.currentPointerPosition = {
        x: Math.floor((e.clientX - rect.left) * (target.width / rect.width)),
        y: Math.floor((e.clientY - rect.top) * (target.height / rect.height)),
      };
    });
  }

  update() {
    for (const [key, pressed] of this.pressedKeys) {
      const duration = this.keyPressDuration.get(key) ?? 0;
      this.keyPressDuration.set(key, pressed ? Math.max(1, duration + 1) : Math.min(-1, duration - 1));
    }

    this.prevPointerPosition = { ...this.pointerPosition };
    this.pointerPosition = { ...this.currentPointerPosition };
    this.pointerDelta = {
      x: this.pointerPosition.x - this.prevPointerPosition.x,
      y: this.pointerPosition.y - this.prevPointerPosition.y,
    };
  }

  get(key) {
    return this.keyPressDuration.get(key) ?? 0;
  }

  getPointer() {
    return { ...this.pointerPosition };
  }

  getPointerDelta() {
    return { ...this.pointerDelta };
  }
}

class SoundSource {
  /**
   * @param {AudioBuffer} audioBuffer
   * @param {AudioContext} context
   * @param {GainNode} gainNode
   */
  constructor(context, audioBuffer, gainNode, options = {}) {
    this.context = context;
    this.audioBuffer = audioBuffer;
    this.gainNode = gainNode;
    this.options = options;
    this.isPlaying = false;
  }

  play() {
    if (this.isPlaying) {
      this.stop();
    }
    this.isPlaying = true;
    this.bufferSource = this.context.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;
    if (this.options.loopStart) {
      this.bufferSource.loop = true;
      this.bufferSource.loopStart = this.options.loopStart;
      this.bufferSource.loopEnd = this.options.loopEnd;
    }
    this.bufferSource.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
    this.bufferSource.start(0);
  }

  stop() {
    this.isPlaying = false;
    this.gainNode.disconnect();
    if (this.bufferSource) {
      this.bufferSource.disconnect();
    }
  }
}

class SoundManager extends EventEmitter {
  constructor() {
    super();
    /** @type {Map<string, SoundSource>} */
    this.sounds = new Map();
    this.promises = new Map();
  }

  init() {
    this.context = new AudioContext();
    this.emit("init", this.context);
  }

  /**
   * @param {string} name
   * @param {RequestInfo | URL} src
   */
  add(name, src, options = {}) {
    const promise = fetch(src)
      .then((file) => file.arrayBuffer())
      .then((arrayBuffer) => {
        if (this.context) {
          this.setSound(arrayBuffer, this.context, name, options);
        } else {
          this.once("init", (/** @type {AudioContext} */ context) => {
            this.setSound(arrayBuffer, context, name, options);
          });
        }
      })
      .catch((error) => {
        console.error(`Error loading sound ${name}:`, error);
        // エラー時にはPromiseを解決してロード処理が継続できるようにする
      });
    this.promises.set(name, promise);
  }

  /**
   * @param {ArrayBuffer} arrayBuffer
   * @param {AudioContext} context
   * @param {string} name
   */
  setSound(arrayBuffer, context, name, options) {
    context.decodeAudioData(arrayBuffer).then((buffer) => {
      const gainNode = context.createGain();
      gainNode.gain.value = options.volume ?? 1;
      this.sounds.set(name, new SoundSource(context, buffer, gainNode, options));
    });
  }

  /**
   * @param {string} name
   */
  play(name) {
    const sound = this.sounds.get(name);
    if (!sound) {
      console.error(`Sound not found: ${name}`);
      return;
    }
    if (!this.context) {
      console.error("AudioContext not initialized");
      return;
    }
    sound.play();
  }

  /**
   * @param {string} name
   */
  stop(name) {
    const sound = this.sounds.get(name);
    if (!sound) {
      console.error(`Sound not found: ${name}`);
      return;
    }
    sound.stop();
  }

  async loadAll() {
    await Promise.all(this.promises.values());
    this.promises.clear();
  }
}
const sounds = new SoundManager();
