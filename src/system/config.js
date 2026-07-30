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
  dificulty: "NORMAL",
  mode: "RUN",
};

let customizationAssets = {};

let inventoryState = {
  categories: ["Skin"],
  categoryIndex: 0,
  page: 0,
  perPage: 4,
  columns: 1,
  selected: {
    skin: "default",
  },
  items: {
    Skin: [
      {
        id: "default",
        label: "Quimpy Clássico",
        spriteKey: "playerSprite1",
        assetKey: "playerSprite1",
        assetPath: "sprites/customization/skin/player.png",
      },
      {
        id: "pl2",
        label: "Capitão Marujo",
        spriteKey: "playerSprite2",
        assetKey: "playerSprite2",
        assetPath: "sprites/customization/skin/playerSprite2.png",
      },
      {
        id: "pl3",
        label: "Bruxo Arcano",
        spriteKey: "player3Sprite",
        assetKey: "player3Sprite",
        assetPath: "sprites/customization/skin/playerSprite3.png",
      },
      {
        id: "pl4",
        label: "Princesa Encantada",
        spriteKey: "player4Sprite",
        assetKey: "player4Sprite",
        assetPath: "sprites/customization/skin/playerSprite4.png",
      },
      {
        id: "pl5",
        label: "Cavaleiro Real",
        spriteKey: "player5Sprite",
        assetKey: "player5Sprite",
        assetPath: "sprites/customization/skin/playerSprite5.png",
      },
      {
        id: "pl6",
        label: "Guerreiro Nórdico",
        spriteKey: "player6Sprite",
        assetKey: "player6Sprite",
        assetPath: "sprites/customization/skin/playerSprite6.png",
      },
      {
        id: "pl7",
        label: "Capitão Pirata",
        spriteKey: "player7Sprite",
        assetKey: "player7Sprite",
        assetPath: "sprites/customization/skin/playerSprite7.png",
      },
      {
        id: "pl8",
        label: "Cientista Maluco",
        spriteKey: "player8Sprite",
        assetKey: "player8Sprite",
        assetPath: "sprites/customization/skin/playerSprite8.png",
      },
      {
        id: "pl9",
        label: "Explorador Espacial",
        spriteKey: "player9Sprite",
        assetKey: "player9Sprite",
        assetPath: "sprites/customization/skin/playerSprite9.png",
      },
      {
        id: "pl10",
        label: "Pato Aventureiro",
        spriteKey: "player10Sprite",
        assetKey: "player10Sprite",
        assetPath: "sprites/customization/skin/playerSprite10.png",
      },
      {
        id: "pl11",
        label: "Gato do Campo",
        spriteKey: "player11Sprite",
        assetKey: "player11Sprite",
        assetPath: "sprites/customization/skin/playerSprite11.png",
      },
    ],
  },
};

let buttonsTemplate = {
  primary: {
    shadow: [45, 25, 10, 180],
    border: [70, 40, 15],
    background: [110, 65, 20],
    button: [255, 190, 55],
    hover: [255, 215, 80],
    highlight: [255, 245, 180, 90],
    text: [70, 35, 5],
  },
  secondary: {
    shadow: [20, 25, 30, 180],
    border: [45, 55, 65],
    background: [65, 75, 85],
    button: [120, 135, 150],
    hover: [145, 160, 175],
    highlight: [225, 235, 245, 80],
    text: [30, 40, 50],
  },
  tertiary: {
    shadow: [10, 25, 35, 200],
    border: [20, 55, 70],
    background: [30, 85, 105],
    button: [45, 155, 180],
    hover: [65, 185, 210],
    highlight: [210, 245, 255, 90],
    text: [10, 40, 50],
  },
  back: {
    shadow: [40, 15, 15, 180],
    border: [70, 25, 28],
    background: [95, 35, 38],
    button: [175, 65, 70],
    hover: [205, 85, 90],
    highlight: [255, 220, 220, 80],
    text: [60, 20, 22],
  },
};

function getInventoryCategoryKey(category) {
  const normalizedCategory = (category || "").toLowerCase();
  return (
    normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)
  );
}

function getInventoryItem(category, itemId) {
  const categoryKey = getInventoryCategoryKey(category);
  const items = inventoryState?.items?.[categoryKey] || [];
  const normalizedItemId = itemId ?? "default";

  return items.find((item) => item.id === normalizedItemId) || items[0] || null;
}

function getCustomizationAsset(category, itemId) {
  const item = getInventoryItem(category, itemId);
  if (!item?.assetKey) return null;
  return customizationAssets[item.assetKey] || null;
}

function createButtonLayout(buttons, options = {}) {
  const {
    centerX = width / 2,
    centerY = height / 2,
    gap = 100,
    buttonW = 330,
    buttonH = 68,
  } = options;

  const totalHeight = (buttons.length - 1) * gap;
  const startY = centerY - totalHeight / 2;

  return buttons.map((button, index) => ({
    ...button,
    x: centerX,
    y: startY + index * gap,
    w: buttonW,
    h: buttonH,
  }));
}
