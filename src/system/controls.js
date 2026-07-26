function getMenuButtons() {
  return [
    {
      text: "JOGAR",
      x: width / 2,
      y: height / 2 - 100,
      w: 330,
      h: 68,
      action: () => {
        gameState = "playing";
        startGame();
      },
    },
    {
      text: "INVENTÁRIO",
      x: width / 2,
      y: height / 2,
      w: 330,
      h: 68,
      action: () => {
        gameState = "inventory";
      },
    },
    {
      text: "CONFIGURAÇÕES",
      x: width / 2,
      y: height / 2 + 100,
      w: 330,
      h: 68,
      action: () => {
        gameState = "settings";
      },
    },
  ];
}

function getSettingsButtons() {
  return [
    {
      text: "SOM: " + (settings.sound ? "ON" : "OFF"),
      x: width / 2,
      y: 200,
      w: 330,
      h: 68,
      action: () => {
        settings.sound = !settings.sound;
        outputVolume(settings.sound ? 0.1 : 0);
      },
    },
    {
      text:
        "CONTROLE: " +
        (settings.mobileControl === "swipe" ? "DESLIZAR" : "BOTÕES"),
      x: width / 2,
      y: 300,
      w: 330,
      h: 68,
      action: () => {
        settings.mobileControl =
          settings.mobileControl === "swipe" ? "buttons" : "swipe";
      },
    },
    {
      text: "PULO AUTOMÁTICO: " + (settings.autoJump ? "ON" : "OFF"),
      x: width / 2,
      y: 400,
      w: 330,
      h: 68,
      action: () => {
        settings.autoJump = !settings.autoJump;
      },
    },
    {
      text: "VOLTAR",
      x: width / 2,
      y: 500,
      w: 330,
      h: 68,
      action: () => {
        gameState = "menu";
      },
    },
  ];
}

function getInventoryButtons() {
  return [
    {
      text: "VOLTAR",
      x: width / 2,
      y: width / 2 + 240,
      w: 330,
      h: 68,
      action: () => {
        gameState = "menu";
        inventoryState.categoryIndex = 0;
        inventoryState.page = 0;
      },
    },
  ];
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

function getGameOverButtons() {
  return [
    {
      text: "REINICIAR",
      x: width / 2,
      y: height / 2 + 130,
      w: 330,
      h: 68,
      action: () => {
        gameState = "playing";
        startGame();
      },
    },
    {
      text: "VOLTAR AO MENU",
      x: width / 2,
      y: height / 2 + 210,
      w: 330,
      h: 68,
      action: () => {
        gameState = "menu";
      },
    },
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
  };

  let activeButtons = [];

  if (gameState === "menu") {
    activeButtons = getMenuButtons();
  } else if (gameState === "settings") {
    activeButtons = getSettingsButtons();
  } else if (gameState === "inventory") {
    activeButtons = getInventoryButtons();
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
