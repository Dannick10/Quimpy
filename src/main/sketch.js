function playBackgroundMusic(sound) {
  if (!sound) return;

  if (!settings.sound) {
    if (currentBGM && currentBGM.isPlaying()) {
      currentBGM.stop();
    }
    currentBGM = null;
    return;
  }

  if (currentBGM === sound && sound.isPlaying()) return;

  if (currentBGM && currentBGM.isPlaying()) {
    currentBGM.stop();
  }

  currentBGM = sound;

  if (!sound.isPlaying()) {
    sound.loop();
  }
}

function updateBackgroundMusic() {
  if (gameState === "playing") {
    playBackgroundMusic(music_Sound);
  } else {
    playBackgroundMusic(audioMenu_Sound);
  }
}

function setup() {
  let sizeScreen = constrain(windowWidth, 200, 615);
  let canvas = createCanvas(sizeScreen, windowHeight);

  pixelDensity(1);
  noSmooth();

  audioMenu_Sound.setLoop(true);
  music_Sound.setLoop(true);

  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);

  biomes = [
    {
      name: "Terra",
      start: 0,
      end: 2000,
      top: color(135, 206, 235),
      bottom: color(220, 245, 255),
    },
    {
      name: "Nuvens",
      start: 2000,
      end: 5000,
      top: color(90, 180, 255),
      bottom: color(180, 220, 255),
    },
    {
      name: "Pôr do Sol",
      start: 5000,
      end: 9000,
      top: color(255, 120, 70),
      bottom: color(255, 200, 120),
    },
    {
      name: "Atmosfera",
      start: 9000,
      end: 14000,
      top: color(30, 45, 120),
      bottom: color(120, 80, 170),
    },
    {
      name: "Espaço",
      start: 14000,
      end: 20000,
      top: color(8, 10, 35),
      bottom: color(30, 10, 60),
    },
    {
      name: "Órbita",
      start: 20000,
      end: 28000,
      top: color(5, 5, 20),
      bottom: color(15, 15, 50),
    },
    {
      name: "Lua",
      start: 28000,
      end: 38000,
      top: color(10, 10, 25),
      bottom: color(35, 35, 60),
    },
    {
      name: "Asteroides",
      start: 38000,
      end: 50000,
      top: color(15, 10, 30),
      bottom: color(45, 20, 50),
    },
    {
      name: "Nebulosa",
      start: 50000,
      end: 70000,
      top: color(45, 10, 90),
      bottom: color(90, 20, 150),
    },
    {
      name: "Galáxia",
      start: 70000,
      end: 999999,
      top: color(5, 0, 20),
      bottom: color(40, 0, 80),
    },
  ];
  outputVolume(0.1);
  startGame();
}

function draw() {
  updateBackgroundMusic();

  if (gameState === "menu") {
    drawMenu();
    return;
  }

  
  if (gameState === "inventory") {
    drawInventary();
    return;
  }
  
  if (gameState === "settings") {
    drawSettings();
    return;
  }
  
  if (gameState === "mode") {
    drawGameMode();
    return;
  }

  if (gameState === "playing") {
    background(220, 250, 250);
    drawBackground();

    if (player.hasGameOver) {
      gameState = "gameover";
      return;
    }

    if (cards.length > 0) {
      isPaused = true;
    } else {
      isPaused = false;
    }

    if (!isPaused) {
      updateGame();
      drawMobileButtons();
    } else if (player.isDead) {
      player.show();
      player.update();

      scoreUpdate();
      drawCoinHud();
    } else {
      fill(0, 0, 0, 150);
      rect(0, 0, width, height);

      updateCards();

      scoreUpdate();
      drawCoinHud();
    }
  }

  if (gameState === "gameover") {
    background(220, 250, 250);
    drawBackground();
    gameOver();
  }
}
