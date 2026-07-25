let blocks = [];
let enemies = [];
let pieces = [];
let particles = [];
let biomes;

let numBlocks;
let speed = 5;
let player;
let score = 0;
let colorParticleBlock;
let respawnEnemiesRate = 20;
let maxPlataformRate = 18;
let respawnBlockRate = 20;
let lastBlockX;

let coins = [];
let money = 0;
let powerSystem;
let cards = [];

let nextCardScore = 1000;

let numTotalPlataform = 0;
let numTotalEnemyDie = 0;
let numTotalCardsCollect = 0;
let numTotalCoinCollect = 0;

let PLAYER_JUMP = 20;
let JUMP_PLATFORM_BOOST = 33;
let ENEMY_BOUNCE = 27;
let lastBlockType = "normal";
let enemyCounter = 0;

let cameraSpeed = 0;
let pause = false;

let buttons;
const buttonSize = 60;
const padding = 30;
let spacing = 0.8;

let multiplier = 1;

let actionMobile = {
  left: false,
  right: false,
};

let touchStartY = 0;

const FRAME_W = 64;
const FRAME_H = 64;

let gameState = "menu";

let currentBGM = null;

let settings = {
  sound: true,
  control: "keyboard",
  mobileControl: "swipe",
  autoJump: false,
};

