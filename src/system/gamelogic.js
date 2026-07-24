function startGame() {
  gameOverUI.active = false;
  gameOverUI.frame = 0;
  gameOverUI.x = 0;
  numBlocks = (windowWidth / windowHeight) * respawnBlockRate;
  colorParticleBlock = color(50, 20, 20);

  blocks = [];
  enemies = [];
  pieces = [];
  particles = [];
  cards = [];
  score = 0;
  money = 0;
  lastBlockX = width / 2;
  nextCardScore = 1000;
  multiplier = 1;
  respawnEnemiesRate = 40

  powerSystem = new PowerSystem();

  lastScoreThreshold = 0;
  numTotalPlataform = 0;
  numTotalEnemyDie = 0;
  numTotalCardsCollect = 0;
  numTotalCoinCollect = 0;

  player = new Player(20, 80);

  createInitialBlock();
  initialPlayerPosition();

  buttons = {
    left: {
      x: padding,
      y: height - buttonSize - padding,
      label: "Left",
      icon: "←",
    },
    right: {
      x: padding + buttonSize * 2 * spacing,
      y: height - buttonSize - padding,
      label: "Right",
      icon: "→",
    },
    up: {
      x: padding + buttonSize * spacing,
      y: height - buttonSize * 2 - padding,
      label: "Up",
      icon: "↑",
    },
  };

  loop();
}

function updateGame() {
  updatePlayer();
  updateBlock();
  updateParticle();
  updatePieces();
  updateEnemies();
  updateCards();
  powerSystem.update();
  updateCoins();
  scoreUpdate();
  drawCoinHud();
  drawHudPower();
  checkForNewCards();
}

function drawBackground() {
  let current = biomes[0];
  let next = biomes[0];

  for (let i = 0; i < biomes.length; i++) {
    if (score >= biomes[i].start) {
      current = biomes[i];
      next = biomes[min(i + 1, biomes.length - 1)];
    }
  }

  let t = map(score, current.start, current.end, 0, 1, true);

  let top = lerpColor(current.top, next.top, t);
  let bottom = lerpColor(current.bottom, next.bottom, t);

  for (let y = 0; y < height; y++) {
    stroke(lerpColor(top, bottom, y / height));
    line(0, y, width, y);
  }

  noStroke();

  if (score > 12000) {
    fill(255);

    for (let i = 0; i < 120; i++) {
      let x = noise(i * 100) * width;
      let y = noise(i * 50) * height;

      circle(x, y, map(sin(frameCount * 0.04 + i), -1, 1, 1, 3));
    }
  }

  if (score > 18000) {
    fill(80, 120);

    circle(width - 100, 120, 170);

    fill(120, 180);

    circle(width - 130, 90, 40);
  }

  if (score > 28000) {
    fill(240);

    circle(120, 120, 120);
  }

  if (score > 50000) {
    noStroke();

    fill(180, 0, 255, 20);
    ellipse(width * 0.3, height * 0.4, 350, 220);

    fill(0, 180, 255, 15);
    ellipse(width * 0.7, height * 0.6, 300, 200);
  }
}

function addScore(obj) {
  let type = obj.type;

  if (score > 10000) multiplier = 1.2;
  if (score > 30000) multiplier = 1.5;
  if (score > 60000) multiplier = 2;

  let points = 0;

  switch (type) {
    case "normal":
      points = 10;
      break;

    case "jump":
      points = 15;
      break;

    case "moving":
      points = 25;
      break;

    case "freeze":
      points = 35;
      break;

    case "brittle":
      points = 45;
      break;

    case "bigBall":
      points = 60;
      break;

    case "flying":
      points = 120;
      break;
  }

  score += points * multiplier;
}

function changeAnimation(entity, animation) {
  if (entity.animation !== animation) {
    entity.animation = animation;
    entity.frame = 0;
    entity.frameTimer = 0;
  }
}

function updateSpriteAnimation(entity) {
  entity.frameTimer++;

  if (entity.frameTimer >= entity.frameSpeed) {
    entity.frameTimer = 0;
    entity.frame = (entity.frame + 1) % entity.maxFrames;
  }
}
