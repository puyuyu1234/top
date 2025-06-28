// @ts-check
"use strict";

const BLOCK_SIZE = 16;
const BLOCK_SEGMENT = 8;
const PLAYER_SIZE = 8;
const STRING_TABLE = {
  title: {
    title: "アクションゲーム3",
    start: "GAME START",
    select: (stageNumber) => `STAGE SELECT ${stageNumber}`,
    option: "OPTION",
    howTo: "矢印/WASD：移動    スペース：決定",
  },
};

class BlockSprite {
  /**
   * @param {string} key
   * @param {number[]} imgNos
   */
  constructor(key, imgNos, isWall = false) {
    this.key = key;
    this.imgNos = imgNos;
    this.isWall = isWall;
  }
}
class EntitySprite extends BlockSprite {
  /**
   * @param {string} key
   * @param {number[]} imgNos
   * @param {boolean} isWall
   * @param {(...any)=>GameObject} creator
   */
  constructor(key, imgNos, isWall, creator) {
    super(key, imgNos, isWall);
    this.creator = creator;
  }
}

const BLOCK_DATA = new Map(
  [
    new BlockSprite(" ", [0]),
    new BlockSprite("@", [0]),
    new BlockSprite("0", [1], true),
    new BlockSprite("1", [2]),
    new BlockSprite("2", [3], true),
    new BlockSprite("3", [4], true),
    new BlockSprite("4", [5]),
    new BlockSprite("5", [6]),
    new BlockSprite("6", [7]),
    new BlockSprite("7", [8], true),
    new BlockSprite("8", [9], true),
    new BlockSprite("9", [10], true),
    new BlockSprite("A", [11], true),
    new BlockSprite("B", [12], true),
    new BlockSprite("C", [13]),
    new BlockSprite("D", [14]),
    new BlockSprite("E", [15]),
    new BlockSprite("F", [16], true),
    new BlockSprite("G", [17], true),
    new BlockSprite("H", [18], true),
    new BlockSprite("I", [19]),
    new BlockSprite("J", [20]),
    new BlockSprite("K", [21]),
    new BlockSprite("L", [22]),
    new BlockSprite("M", [23]),
    new BlockSprite("N", [24], true),
    new BlockSprite("O", [25], true),
    new BlockSprite("P", [26], true),
    new BlockSprite("Q", [27]),
    new BlockSprite("R", [28]),
    new BlockSprite("S", [29]),
    new BlockSprite("T", [30]),
    new BlockSprite("U", [31]),
    new BlockSprite("V", [32]),
    new BlockSprite("W", [33]),
    new BlockSprite("X", [34]),
    new BlockSprite("Y", [35]),
    new BlockSprite("Z", [36]),
    new BlockSprite("a", [37]),
    new BlockSprite("b", [38]),
    new BlockSprite("c", [39]),
    new BlockSprite("d", [40]),
    new BlockSprite("e", [41]),
    new BlockSprite("f", [42]),
    new BlockSprite("g", [43]),
    new BlockSprite("h", [44]),
    new BlockSprite("i", [45]),
    new BlockSprite("j", [46]),
    new BlockSprite("k", [47]),
    new BlockSprite("l", [48]),
    new BlockSprite("m", [49]),
    new BlockSprite("n", [50]),
    new BlockSprite("o", [51]),
    new BlockSprite("p", [52]),
    new BlockSprite("q", [53]),
    new BlockSprite("r", [54]),
    new BlockSprite("s", [55]),
    new BlockSprite("t", [56]),
    new BlockSprite("u", [57]),
    new BlockSprite("v", [58]),
    new BlockSprite("w", [59]),
    new BlockSprite("x", [60]),
    new BlockSprite("y", [61]),
    new BlockSprite("z", [62]),
    new BlockSprite("!", [63]),
  ].map((v) => [v.key, v])
);

/** @type {string[][]} */
const STAGE_DATA = [
  [
    "                 GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "                 GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
    "                 GGGGGGGGG2OOOOOO32OOOOOOOOOOOOOOOOOOOOOOOOOOOOO3GGGGGG",
    "         GGGGGGGGGGGGGGGGGH  11  FH   111   111                 FGGGGGG",
    "         GGGGGGGGGGGGGGGGGH  11  FH   111   111                 FGGGGGG",
    "         GGGGGGG2OOOOOOOOOP  79  NP   111   111 00              FGGGGGG",
    "         GGGGGGGHGGG2P   11  FH  11 II789   788889  46  46  46  FGGGGGG",
    "    GGGGGGGGGGGGHGG2P    11  FH  11 QQFGH   FGGGGH  CE  CE  CE  FGGGGGG",
    "    GGGGGGGGGGGGHG2P    78888BA8888888FGH   FGGGGH  CE  CE  CE 0FGGGGGG",
    "    GGGGGGGGGGGGH2P    7GGGGGGGGGGGGGGFGH   FGGGGH0 KM  KM  KM00FGGGGGG",
    "    GGGGGGGGGGGGHP    7FGG0000000000GGFGH   FGGGGH0           00FGGGGGG",
    "    GGGGG2OOOO3GH    7BFGG0000000000GGFGH   FGGGGH00  00  0  000FGGGGGG",
    "    GGGGGH    NOP   7BGFGG0000000000GGFGH   FGGGGA88888888888888BGGGGGG",
    "    GGGGGH    111  7GGGFGGGGGGGGGGGGGGFGH   FGGGGGGGGGGGGGGGGGGGGGG    ",
    "    GGGGGHIIII111  N3GGFG2OOOOOOOOOOOOFGH   FGGGGGGGGGGGGGGGGGGGGGG    ",
    "    GGGGGHQQQQ789   N3GFGH            FGH   FGGGGGGGGGGGGGGGGGGGGGG    ",
    "    GGGGGA8888BGH    N3FGH            FGH   FGGGGGGGGGGGG              ",
    "    GGGGGGGGGGGGH9    NNOP   456  456 NOP   FGGG                       ",
    "    GGGGGGGGGGGGHA9    111   KLM  KLM 111   FGGG                       ",
    "    GGGGGGGGGGGGHGA9   111II @        111   FGGG                       ",
    "    GGGGGGGGGGGGHGGA9  111QQ          111   FGGG                       ",
    "    GGGGGGGGGGGGHGGGH  7888888888888888888888888                       ",
    "         GGGGGGGHGGGH  FGGGGGGGGGGGGGGGGGGGGGGGG                       ",
    "         GGGGGGGHGGGH79F000000000000000000000000                       ",
    "         GGGGGGGHGGGHNPF000000000000000000000000                       ",
  ],
];
