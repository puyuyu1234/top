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
   * @param {"no"|"needle"|"water"|"conR"|"conL"|"save"|"goal"|"entity"|"under"} type
   */
  constructor(key, imgNos, type = "no", wall = { top: false, bottom: false, left: false, right: false }) {
    this.key = key;
    this.imgNos = imgNos;
    this.type = type;
    this.wall = wall;
  }
}
class EntitySprite extends BlockSprite {
  /**
   * @param {string} key
   * @param {number[]} imgNos
   * @param {"entity"} type
   * @param {(...any)=>GameObject} creator
   */
  constructor(key, imgNos, type, creator) {
    super(key, imgNos, type);
    this.creator = creator;
  }
}

const BLOCK_DATA = new Map(
  [
    new BlockSprite(" ", [0]),
    new BlockSprite("0", [0]),
    new BlockSprite("1", [1], "no", { top: true, bottom: true, left: true, right: true }),
    new BlockSprite("2", [2], "no", { top: true, bottom: true, left: true, right: true }),
    new BlockSprite("3", [3], "no", { top: true, bottom: true, left: true, right: true }),
    new BlockSprite("4", [4], "no", { top: true, bottom: false, left: false, right: false }),
    new BlockSprite("5", [5, 6, 8], "water"),
    new BlockSprite("6", [7], "water"),

    new BlockSprite("7", [8], "needle", { top: false, bottom: true, left: true, right: true }),
    new BlockSprite("8", [9], "needle", { top: true, bottom: false, left: true, right: true }),
    new BlockSprite("9", [10], "needle", { top: true, bottom: true, left: false, right: true }),
    new BlockSprite("a", [11], "needle", { top: true, bottom: true, left: true, right: false }),
    new BlockSprite("b", [12]),
    new BlockSprite("c", [13]),
    new BlockSprite("d", [14, 15, 8], "water"),

    new BlockSprite("e", [16, 17, 18, 19, 2], "conR", { top: true, bottom: true, left: true, right: true }),
    new BlockSprite("f", [20, 21, 22, 23, 2], "conR", { top: true, bottom: true, left: true, right: true }),
    new BlockSprite("g", [24, 25, 26, 27, 2], "conR", { top: true, bottom: true, left: true, right: true }),
    new BlockSprite("h", [28], "needle", { top: false, bottom: true, left: false, right: true }),
    new BlockSprite("i", [29], "needle", { top: false, bottom: true, left: true, right: false }),
    new BlockSprite("j", [30], "needle", { top: true, bottom: false, left: false, right: true }),
    new BlockSprite("k", [31], "needle", { top: true, bottom: false, left: true, right: false }),

    new BlockSprite("l", [32], "needle", { top: false, bottom: false, left: true, right: true }),
    new BlockSprite("m", [33], "needle", { top: true, bottom: true, left: false, right: false }),
    new BlockSprite("n", [34], "needle", { top: false, bottom: false, left: false, right: true }),
    new BlockSprite("o", [35], "needle", { top: false, bottom: false, left: true, right: false }),
    new BlockSprite("p", [36], "needle", { top: false, bottom: true, left: false, right: false }),
    new BlockSprite("q", [37], "needle", { top: true, bottom: false, left: false, right: false }),
    new BlockSprite("r", [38], "needle", { top: false, bottom: false, left: false, right: false }),

    new BlockSprite("s", [42]),
    new BlockSprite("t", [43]),
    new BlockSprite("u", [47], "save"),
    new BlockSprite("v", [50]),
    new BlockSprite("w", [51]),
    new BlockSprite("x", [55], "goal"),
    new BlockSprite("y", [62]),

    new BlockSprite("z", [64], "no", { top: false, bottom: true, left: false, right: false }),
    new BlockSprite("A", [65], "no", { top: false, bottom: false, left: true, right: false }),
    new BlockSprite("B", [-65], "no", { top: false, bottom: false, left: false, right: true }),
    new BlockSprite("C", [68, 69, 70, 71, 2], "conL", { top: true, bottom: true, left: true, right: true }),
    new BlockSprite("D", [72, 73, 74, 75, 2], "conL", { top: true, bottom: true, left: true, right: true }),
    new BlockSprite("E", [76, 77, 78, 79, 2], "conL", { top: true, bottom: true, left: true, right: true }),

    new BlockSprite("F", [80], "needle", { top: false, bottom: true, left: true, right: true }),
    new BlockSprite("G", [81], "needle", { top: false, bottom: true, left: true, right: true }),
    new BlockSprite("H", [82], "needle", { top: true, bottom: false, left: true, right: true }),
    new BlockSprite("I", [83], "needle", { top: true, bottom: false, left: true, right: true }),
    new BlockSprite("J", [84], "needle", { top: true, bottom: true, left: false, right: true }),
    new BlockSprite("K", [85], "needle", { top: true, bottom: true, left: false, right: true }),
    new BlockSprite("L", [86], "needle", { top: true, bottom: true, left: true, right: false }),
    new BlockSprite("M", [87], "needle", { top: true, bottom: true, left: true, right: false }),

    new BlockSprite("N", [88], "needle", { top: false, bottom: true, left: true, right: true }),
    new BlockSprite("O", [89], "needle", { top: true, bottom: false, left: true, right: true }),
    new BlockSprite("P", [90], "needle", { top: true, bottom: true, left: false, right: true }),
    new BlockSprite("Q", [91], "needle", { top: true, bottom: true, left: true, right: false }),

    new EntitySprite("R", [58], "entity", createMandra),
    new EntitySprite("S", [59], "entity", createFallLift),
    new EntitySprite("T", [92], "entity", createFallLift),
    new EntitySprite("U", [96], "entity", createFallLift),
  ].map((v) => [v.key, v])
);

/** @type {string[][][]} */
const STAGE_DATA = [
  [
    ["st", "vw"],
    [
      "1RRRRRRRRR2222222221",
      "3RRRRRRRRR        R3",
      "3RRRRRRRRR        R3",
      "3RRRRRRRRR        R3",
      "3RRRRRRRRR        R3",
      "3RRRRRRRRR        R3",
      "3RRRRRRRRR   R R  R3",
      "3RRRRRRRRR        R3",
      "3         U U T T R3",
      "3                 R3",
      "3T T T T T   S S  R3",
      "3                 R3",
      "3            R R  R3",
      "3 0               R3",
      "12222222222222222221",
    ],
  ],
];
