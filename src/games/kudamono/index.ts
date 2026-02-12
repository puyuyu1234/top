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

  const base = import.meta.env.BASE_URL;

  // Game と AssetLoader を初期化
  ({ game, assetLoader } = await GameFactory.createGame("kudamono-canvas", WIDTH, HEIGHT, {
    backgroundColor: 0x999999,
    assetBasePath: `${base}img/kudamono/`,
  }));

  // スプライトシート読み込み
  await Promise.all([
    assetLoader.loadSpritesheet("player", "player.json"),
    assetLoader.loadSpritesheet("entity", "entity.json"),
  ]);

  // ビットマップフォント読み込み
  await Promise.all([
    assetLoader.loadBitmapFont("p10", `${base}fonts/PixelMplus10.fnt`),
    assetLoader.loadBitmapFont("p12", `${base}fonts/PixelMplus12.fnt`),
  ]);

  // シーン開始
  const scene = new TitleScene();
  game.changeScene(scene);
  game.start();

  return game;
}
