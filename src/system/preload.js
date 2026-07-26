let hitKillSound;
let jump_cuteSound;
let jump_longSound;
let plants_impactSound;
let wood_surface;
let failed_Sound;
let music_Sound;
let groundMove_Sound;
let monsterScream_Sound;
let rock_Sound;
let grassPress_Sound;
let grassBreak_Sound;
let coinCollect_Sound;
let buyCard_Sound;
let audioMenu_Sound;
let click_Sound;
let inital_Sound;
let card_Sound;

function playSound(sound, allowOverlap = false) {
  if (!sound || !settings.sound) return;
  if (!allowOverlap && sound.isPlaying()) return;
  sound.play();
}

let playerSprite;
let enemySprite;
let enemySprite2;
let coinSprite;
let blocksSprite;
let hatSprite;
let hatSprite2;
let clothesSprite;


function preload() {
  backgroundQuimpy = loadImage("sprites/backgroundquimpy.png");
  enemySprite2 = loadImage("sprites/enemy/enemy2.png");
  enemySprite = loadImage("sprites/enemy/enemy1.png");
  playerSprite = loadImage("sprites/customization/skin/player.png");
  playerSpriteAlt = loadImage("sprites/customization/skin/player1.png");
  coinSprite = loadImage("sprites/coin.png");
  hatSprite = loadImage("sprites/customization/hat/hatSprite.png");
  hatSprite2 = loadImage("sprites/customization/hat/hatSprite2.png");
  clothesSprite = loadImage("sprites/customization/clothes/clothesSprite.png")

  audioMenu_Sound = loadSound("sounds/audiomenu.mp3");
  card_Sound = loadSound("sounds/cardsound.mp3");
  click_Sound = loadSound("sounds/click.mp3");
  inital_Sound = loadSound("sounds/startaudio.mp3");
  hitKillSound = loadSound("sounds/hit_kill.mp3");
  jump_cuteSound = loadSound("sounds/jump_cute.mp3");
  jump_longSound = loadSound("sounds/jump_high.mp3");
  plants_impactSound = loadSound("sounds/plants_impact.mp3");
  wood_surface = loadSound("sounds/wood_surface.mp3");
  failed_Sound = loadSound("sounds/failed.mp3");
  music_Sound = loadSound("sounds/music.mp3");
  groundMove_Sound = loadSound("sounds/groundMove.mp3");
  monsterScream_Sound = loadSound("sounds/monsterScream.mp3");
  rock_Sound = loadSound("sounds/rock.mp3");

  grassPress_Sound = loadSound("sounds/greass_press.mp3"); 
  grassBreak_Sound = loadSound("sounds/grass_break.mp3");
  coinCollect_Sound = loadSound("sounds/coincollect.mp3");
  buyCard_Sound = loadSound("sounds/buyshopping.mp3");
}
