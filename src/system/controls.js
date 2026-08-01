function getMenuButtons() {
  return createButtonLayout(
    [
      {
        text: "JOGAR",
        action: () => {
          gameState = "mode";
          startGame();
        },
        template: buttonsTemplate.primary,
      },
      {
        text: "INVENTÁRIO",
        action: () => {
          gameState = "inventory";
        },
        template: buttonsTemplate.primary,
      },
      {
        text: "CONFIGURAÇÕES",
        action: () => {
          gameState = "settings";
        },
        template: buttonsTemplate.primary,
      },
    ],
    {
      gap: 100,
    },
  );
}

function getSettingsButtons() {
  return createButtonLayout(
    [
      {
        text: "SOM: " + (settings.sound ? "ON" : "OFF"),
        action: () => {
          settings.sound = !settings.sound;
          outputVolume(settings.sound ? 0.1 : 0);
        },
        template: settings.sound
          ? buttonsTemplate.primary
          : buttonsTemplate.secondary,
      },
      {
        text:
          "CONTROLE: " +
          (settings.mobileControl === "swipe" ? "DESLIZAR" : "BOTÕES"),
        action: () => {
          settings.mobileControl =
            settings.mobileControl === "swipe" ? "buttons" : "swipe";
        },
        template:
          settings.mobileControl === "swipe"
            ? buttonsTemplate.primary
            : buttonsTemplate.secondary,
      },
      {
        text: "PULO AUTOMÁTICO: " + (settings.autoJump ? "ON" : "OFF"),
        action: () => {
          settings.autoJump = !settings.autoJump;
        },
        template: settings.autoJump
          ? buttonsTemplate.primary
          : buttonsTemplate.secondary,
      },
      {
        text: "VOLTAR",
        action: () => {
          gameState = "menu";
        },
        template: buttonsTemplate.back,
      },
    ],
    {
      gap: 100,
    },
  );
}

function getInventoryButtons() {
  return createButtonLayout(
    [
      {
        text: "VOLTAR",
        action: () => {
          gameState = "menu";
          inventoryState.categoryIndex = 0;
          inventoryState.page = 0;
        },
        template: buttonsTemplate.back,
      },
    ],
    {
      centerY: 550,
    },
  );
}

function getGameOverButtons() {
  return createButtonLayout(
    [
      {
        text: "REINICIAR",
        action: () => {
          gameState = "playing";
          startGame();
        },
        template: buttonsTemplate.primary,
      },
      {
        text: "VOLTAR AO MENU",
        action: () => {
          gameState = "menu";
        },
        template: buttonsTemplate.back,
      },
    ],
    {
      centerY: height / 2 + 180,
      gap: 80,
    },
  );
}

function getOptionGameMode() {
  return createButtonLayout(
    [
      {
        text: "NORMAL",
        action: () => {
          gameState = "playing";
          settings.mode = "NORMAL";
          startGame();
        },
        template: buttonsTemplate.primary,
      },
      {
        text: "CASUAL",
        action: () => {
          gameState = "playing";
          settings.mode = "CASUAL";
          startGame();
        },
        template: buttonsTemplate.tertiary,
      },
      {
        text: "VOLTAR",
        action: () => {
          gameState = "menu";
        },
        template: buttonsTemplate.back,
      },
    ],
    {
      gap: 100,
    },
  );
}

function getInventoryScale() {
  return constrain(min(width / 615, height / 700), 0.65, 1);
}

function getInventoryCategory() {
  return inventoryState.categories[inventoryState.categoryIndex];
}

function getInventoryPageItems() {
  const category = getInventoryCategory();
  const items = inventoryState.items[category] || [];
  const start = inventoryState.page * inventoryState.perPage;
  return items.slice(start, start + inventoryState.perPage);
}

function getInventoryItemById(category, itemId) {
  return (inventoryState.items[category] || []).find(
    (item) => item.id === itemId,
  );
}

function getInventoryGridLayout() {
  const columns = inventoryState.columns;

  const rows = ceil(inventoryState.perPage / columns);

  const areaX = -235;
  const areaY = -170;

  const areaW = 460;
  const areaH = 260;

  const gapX = 15;
  const gapY = 12;

  const cardW = (areaW - gapX * (columns - 1)) / columns;

  const cardH = (areaH - gapY * (rows - 1)) / rows;

  return {
    columns,
    rows,
    areaX,
    areaY,
    areaW,
    areaH,
    gapX,
    gapY,
    cardW,
    cardH,
  };
}

function getInventoryItemPosition(index) {
  const layout = getInventoryGridLayout();
  const col = index % layout.columns;
  const row = floor(index / layout.columns);
  return {
    x: layout.areaX + col * (layout.cardW + layout.gapX),
    y: layout.areaY + row * (layout.cardH + layout.gapY),
    row,
    col,
  };
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
  };

  let activeButtons = [];

  if (gameState === "menu") {
    activeButtons = getMenuButtons();
  } else if (gameState === "settings") {
    activeButtons = getSettingsButtons();
  } else if (gameState === "inventory") {
    activeButtons = getInventoryButtons();
  } else if (gameState === "mode") {
    activeButtons = getOptionGameMode();
  } else if (player && player.hasGameOver) {
    activeButtons = getGameOverButtons();
  }

  if (gameState === "inventory" && checkInventoryInteraction(tx, ty)) {
    return;
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

function checkInventoryInteraction(tx, ty) {
  const scaleI = getInventoryScale();

  const localX = (tx - width / 2) / scaleI;
  const localY = (ty - height / 2) / scaleI;

  const category = getInventoryCategory();
  const items = getInventoryPageItems();
  const layout = getInventoryGridLayout();

  for (let i = 0; i < items.length; i++) {
    const pos = getInventoryItemPosition(i);

    if (
      localX > pos.x &&
      localX < pos.x + layout.cardW &&
      localY > pos.y &&
      localY < pos.y + layout.cardH
    ) {
      inventoryState.selected[category.toLowerCase()] = items[i].id;

      if (player) {
        player.setCustomization(category.toLowerCase(), items[i].id);
      }
      playSound(click_Sound);
      return true;
    }
  }

  const pageY = 155;
  const pageX = -235;

  const buttonW = 100;
  const buttonH = 35;

  if (
    localX > pageX &&
    localX < pageX + buttonW &&
    localY > pageY &&
    localY < pageY + buttonH
  ) {
    inventoryState.page = max(0, inventoryState.page - 1);
    playSound(click_Sound);
    return true;
  }

  if (
    localX > pageX + buttonW + 15 &&
    localX < pageX + buttonW + 15 + buttonW &&
    localY > pageY &&
    localY < pageY + buttonH
  ) {
    const maxPage = max(
      0,
      ceil(inventoryState.items[category].length / inventoryState.perPage) - 1,
    );
    inventoryState.page = min(maxPage, inventoryState.page + 1);
    playSound(click_Sound);
    return true;
  }

  const tabX = -235;
  const tabY = -230;
  const tabW = 150;
  const tabH = 40;

  for (let i = 0; i < inventoryState.categories.length; i++) {
    const x = tabX + i * (tabW + 10);

    if (
      localX > x &&
      localX < x + tabW &&
      localY > tabY &&
      localY < tabY + tabH
    ) {
      inventoryState.categoryIndex = i;
      inventoryState.page = 0;
      playSound(click_Sound);
      return true;
    }
  }

  return false;
}

function mouseClicked() {
  checkInteraction(mouseX, mouseY);
}

function windowResized() {
  let sizeScreen = constrain(windowWidth, 200, 615);
  let canvas = createCanvas(sizeScreen, windowHeight);
  pixelDensity(1);
  noSmooth();
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}

function detectMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
    navigator.userAgent,
  );
}
