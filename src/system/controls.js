function getMenuButtons() {
  return [
    {
      text: "JOGAR",
      x: width / 2,
      y: height / 2,
      w: 330, h: 68,
      action: () => {
        gameState = "playing";
        startGame();
      }
    },
    {
      text: "CONFIGURAÇÕES",
      x: width / 2,
      y: height / 2 + 100,
      w: 330, h: 68,
      action: () => {
        gameState = "settings";
      }
    }
  ];
}

function getSettingsButtons() {
  return [
    {
      text: "SOM: " + (settings.sound ? "ON" : "OFF"),
      x: width / 2,
      y: 200,
      w: 330, h: 68,
      action: () => {
        settings.sound = !settings.sound;
        outputVolume(settings.sound ? 0.1 : 0);
      }
    },
    {
      text: "CONTROLE: " + (settings.mobileControl === "swipe" ? "DESLIZAR" : "BOTÕES"),
      x: width / 2,
      y: 300,
      w: 330, h: 68,
      action: () => {
        settings.mobileControl = settings.mobileControl === "swipe" ? "buttons" : "swipe";
      }
    },
    {
      text: "PULO AUTOMÁTICO: " + (settings.autoJump ? "ON" : "OFF"),
      x: width / 2,
      y: 400,
      w: 330, h: 68,
      action: () => {
        settings.autoJump = !settings.autoJump;
      }
    },
    {
      text: "VOLTAR",
      x: width / 2,
      y: 500,
      w: 330, h: 68,
      action: () => {
        gameState = "menu";
      }
    }
  ];
}

function getGameOverButtons() {
  return [
    {
      text: "REINICIAR",
      x: width / 2,
      y: height / 2 + 130,
      w: 330, h: 68,
      action: () => {
        gameState = "playing";
        startGame();
      }
    },
    {
      text: "VOLTAR AO MENU",
      x: width / 2,
      y: height / 2 + 210,
      w: 330, h: 68,
      action: () => {
        gameState = "menu";
      }
    }
  ];
}

function touchStarted() {
  for (let touch of touches) {
    checkInteraction(touch.x, touch.y);
  }

  if (settings.mobileControl === "buttons") {
    for (let touch of touches) {
      if (dist(touch.x, touch.y, 80, height - 100) < 40) {
        actionMobile.left = true;
        playSound(click_Sound);
      }

      if (dist(touch.x, touch.y, 200, height - 100) < 40) {
        actionMobile.right = true;
        playSound(click_Sound);
      }

      if (dist(touch.x, touch.y, 140, height - 180) < 40 && player) {
        player.jump();
        playSound(click_Sound);
      }
    }
  } else {
    let left = false;
    let right = false;

    for (let touch of touches) {
      if (touch.x < width / 2) left = true;
      else right = true;
    }

    actionMobile.left = left;
    actionMobile.right = right;
  }

  if (touches.length > 0) {
    touchStartY = touches[0].y;
  }

  return false;
}

function touchMoved() {
  if (settings.mobileControl !== "swipe") return false;

  if (touches.length > 0) {
    if (touchStartY - touches[0].y > 50) {
      player.jump();
      touchStartY = touches[0].y;
    }

    if (touches[0].x < width / 2) {
      actionMobile.left = true;
      actionMobile.right = false;
    } else {
      actionMobile.left = false;
      actionMobile.right = true;
    }
  }

  return false;
}

function touchEnded() {
  actionMobile.left = false;
  actionMobile.right = false;

  return false;
}

function checkInteraction(tx, ty) {

  const hitBox = (x, y, w, h) => {
    return tx > x - w / 2 && tx < x + w / 2 && ty > y - h / 2 && ty < y + h / 2;
  }

  let activeButtons = [];


  if (gameState === "menu") {
    activeButtons = getMenuButtons();
  } else if (gameState === "settings") {
    activeButtons = getSettingsButtons();
  } else if (player && player.hasGameOver) {
    activeButtons = getGameOverButtons();
  }


  for (let btn of activeButtons) {
    if (hitBox(btn.x, btn.y, btn.w, btn.h)) {
      btn.action();
      playSound(click_Sound);
      return;
    }
  }

  if (cards.length > 0) {
    if (tx > width - 80 && tx < width - 10 && ty > 20 && ty < 90) {
      cards = [];
      return;
    }
  }

  for (let i = cards.length - 1; i >= 0; i--) {
    let c = cards[i];
    if (tx > c.x && tx < c.x + c.sizeX && ty > c.y && ty < c.y + c.sizeY) {
      buyCard(c);
      break;
    }
  }
}

function mouseClicked() {
  checkInteraction(mouseX, mouseY);
}

function windowResized() {
  let sizeScreen = constrain(windowWidth, 200, 615);
  let canvas = createCanvas(sizeScreen, windowHeight);

  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}

function detectMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
    navigator.userAgent,
  );
}
