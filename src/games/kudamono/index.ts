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
  // canvasを作成
  const canvas = document.createElement("canvas");
  canvas.id = "kudamono-canvas";
  container.appendChild(canvas);

  // Game と AssetLoader を初期化
  ({ game, assetLoader } = await GameFactory.createGame("kudamono-canvas", WIDTH, HEIGHT, {
    backgroundColor: 0x999999,
    assetBasePath: "/img/kudamono/",
  }));

  // スプライトシート読み込み
  await Promise.all([
    assetLoader.loadSpritesheet("player", "player.json"),
    assetLoader.loadSpritesheet("entity", "entity.json"),
  ]);

  // フォント読み込み
  const p10 = new FontFace("p10", "url(/font/PixelMplus10-Regular.ttf)");
  const p12 = new FontFace("p12", "url(/font/PixelMplus12-Regular.ttf)");
  await Promise.all([p10.load(), p12.load()]);
  document.fonts.add(p10);
  document.fonts.add(p12);

  // シーン開始
  const scene = new TitleScene();
  game.changeScene(scene);
  game.start();

  return game;
}
