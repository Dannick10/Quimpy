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
  const gamepad = getGamepadState();

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
        text: "CONTROLE: " + (gamepad.connected ? "CONECTADO" : "DESCONECTADO"),
        action: () => {
          const canUseGamepad = getGamepadState().connected;
          settings.control = canUseGamepad
            ? settings.control === "gamepad"
              ? "keyboard"
              : "gamepad"
            : "keyboard";
        },
        template: gamepad.connected
          ? buttonsTemplate.primary
          : buttonsTemplate.secondary,
      },
      {
        text:
          "MOVIMENTO: " +
          (settings.movementMode === "analog" ? "ANALÓGICO" : "SETAS"),
        action: () => {
          settings.movementMode =
            settings.movementMode === "analog" ? "arrows" : "analog";
        },
        template:
          settings.movementMode === "analog"
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
      gap: 90,
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

let menuNavigation = {
  index: 0,
  confirmHeld: false,
  upHeld: false,
  downHeld: false,
};

let inventoryNavigation = {
  focus: "items",
  selectedIndex: 0,
  leftHeld: false,
  rightHeld: false,
  upHeld: false,
  downHeld: false,
  confirmHeld: false,
};

function resetInventoryNavigation() {
  inventoryNavigation = {
    focus: "items",
    selectedIndex: 0,
    leftHeld: false,
    rightHeld: false,
    upHeld: false,
    downHeld: false,
    confirmHeld: false,
  };
}

function getMenuButtonsForCurrentState() {
  if (gameState === "menu") return getMenuButtons();
  if (gameState === "settings") return getSettingsButtons();
  if (gameState === "inventory") return getInventoryButtons();
  if (gameState === "mode") return getOptionGameMode();
  if (player && player.hasGameOver) return getGameOverButtons();
  return [];
}

function updateInventoryNavigation() {
  if (gameState !== "inventory") return;

  const pad = getGamepadState();
  const moveLeft = pad.left || keyIsDown(65) || keyIsDown(37);
  const moveRight = pad.right || keyIsDown(68) || keyIsDown(39);
  const moveUp = pad.up || keyIsDown(87) || keyIsDown(38);
  const moveDown = pad.down || keyIsDown(83) || keyIsDown(40);
  const confirm = pad.jump || keyIsDown(13) || keyIsDown(90) || keyIsDown(65);

  let items = getInventoryPageItems();

  if (inventoryNavigation.selectedIndex >= items.length) {
    inventoryNavigation.selectedIndex = 0;
  }

  if (moveLeft && !inventoryNavigation.leftHeld) {
    if (inventoryState.categories.length > 1) {
      inventoryState.categoryIndex =
        (inventoryState.categoryIndex - 1 + inventoryState.categories.length) %
        inventoryState.categories.length;
      inventoryState.page = 0;
      inventoryNavigation.selectedIndex = 0;
      inventoryNavigation.focus = "items";
    }
    inventoryNavigation.leftHeld = true;
  } else if (!moveLeft) {
    inventoryNavigation.leftHeld = false;
  }

  if (moveRight && !inventoryNavigation.rightHeld) {
    if (inventoryState.categories.length > 1) {
      inventoryState.categoryIndex =
        (inventoryState.categoryIndex + 1) % inventoryState.categories.length;
      inventoryState.page = 0;
      inventoryNavigation.selectedIndex = 0;
      inventoryNavigation.focus = "items";
    }
    inventoryNavigation.rightHeld = true;
  } else if (!moveRight) {
    inventoryNavigation.rightHeld = false;
  }

  items = getInventoryPageItems();

  if (moveUp && !inventoryNavigation.upHeld) {
    if (inventoryNavigation.focus === "back") {
      inventoryNavigation.focus = "items";
      inventoryNavigation.selectedIndex = 0;
      menuNavigation.index = 0;
    } else {
      inventoryNavigation.focus = "back";
      menuNavigation.index = 0;
    }
    inventoryNavigation.upHeld = true;
  } else if (!moveUp) {
    inventoryNavigation.upHeld = false;
  }

  if (moveDown && !inventoryNavigation.downHeld) {
    if (inventoryNavigation.focus === "back") {
      inventoryNavigation.focus = "items";
      inventoryNavigation.selectedIndex = 0;
      menuNavigation.index = 0;
    } else {
      const maxPage = max(
        0,
        ceil(inventoryState.items[getInventoryCategory()].length / inventoryState.perPage) - 1,
      );

      if (inventoryNavigation.selectedIndex >= items.length - 1) {
        if (inventoryState.page < maxPage) {
          inventoryState.page = min(maxPage, inventoryState.page + 1);
          inventoryNavigation.selectedIndex = 0;
        }
      } else {
        inventoryNavigation.selectedIndex = min(
          items.length - 1,
          inventoryNavigation.selectedIndex + 1,
        );
      }
    }
    inventoryNavigation.downHeld = true;
  } else if (!moveDown) {
    inventoryNavigation.downHeld = false;
  }

  items = getInventoryPageItems();
  const categoryKey = getInventoryCategory().toLowerCase();
  const currentItem = items[inventoryNavigation.selectedIndex];

  if (currentItem && inventoryNavigation.focus === "items") {
    inventoryState.selected[categoryKey] = currentItem.id;
    if (player) {
      player.setCustomization(categoryKey, currentItem.id);
    }
  }

  if (confirm && !inventoryNavigation.confirmHeld) {
    if (inventoryNavigation.focus === "back") {
      const backButton = getInventoryButtons()[0];
      if (backButton) {
        backButton.action();
        playSound(click_Sound);
      }
      resetInventoryNavigation();
    } else if (currentItem) {
      inventoryState.selected[categoryKey] = currentItem.id;
      if (player) {
        player.setCustomization(categoryKey, currentItem.id);
      }
      playSound(click_Sound);
      inventoryNavigation.focus = "back";
      menuNavigation.index = 0;
    }
    inventoryNavigation.confirmHeld = true;
  }

  if (!confirm) {
    inventoryNavigation.confirmHeld = false;
  }
}

function updateMenuNavigation() {
  if (gameState === "inventory") {
    updateInventoryNavigation();
    return;
  }

  const buttons = getMenuButtonsForCurrentState();

  if (!buttons.length) {
    menuNavigation.index = 0;
    menuNavigation.confirmHeld = false;
    menuNavigation.upHeld = false;
    menuNavigation.downHeld = false;
    return;
  }

  if (menuNavigation.index >= buttons.length) {
    menuNavigation.index = 0;
  }

  const pad = getGamepadState();

  if (!pad.connected) return;

  const axisY = pad.axisY || 0;
  const moveUp = pad.up || axisY < -0.5;
  const moveDown = pad.down || axisY > 0.5;

  if (moveUp && !menuNavigation.upHeld) {
    menuNavigation.index = (menuNavigation.index - 1 + buttons.length) % buttons.length;
    menuNavigation.upHeld = true;
  } else if (moveDown && !menuNavigation.downHeld) {
    menuNavigation.index = (menuNavigation.index + 1) % buttons.length;
    menuNavigation.downHeld = true;
  }

  if (!moveUp) menuNavigation.upHeld = false;
  if (!moveDown) menuNavigation.downHeld = false;

  const confirmPress = pad.jump || keyIsDown(13) || keyIsDown(90);

  if (confirmPress && !menuNavigation.confirmHeld) {
    const button = buttons[menuNavigation.index];
    if (button) {
      button.action();
      playSound(click_Sound);
    }
    menuNavigation.confirmHeld = true;
  }

  if (!confirmPress) {
    menuNavigation.confirmHeld = false;
  }
}

function getGamepadState() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const pad = pads && pads[0] ? pads[0] : null;

  if (!pad) {
    return {
      connected: false,
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      axisX: 0,
      axisY: 0,
    };
  }

  const axisX = pad.axes && pad.axes[0] !== undefined ? pad.axes[0] : 0;
  const axisY = pad.axes && pad.axes[1] !== undefined ? pad.axes[1] : 0;

  const left =
    !!pad.buttons?.[14]?.pressed ||
    !!pad.buttons?.[6]?.pressed ||
    axisX < -0.35;

  const right =
    !!pad.buttons?.[15]?.pressed ||
    !!pad.buttons?.[7]?.pressed ||
    axisX > 0.35;

  const up =
    !!pad.buttons?.[12]?.pressed ||
    !!pad.buttons?.[4]?.pressed ||
    axisY < -0.35;

  const down =
    !!pad.buttons?.[13]?.pressed ||
    !!pad.buttons?.[5]?.pressed ||
    axisY > 0.35;

  const jump =
    !!pad.buttons?.[0]?.pressed ||
    !!pad.buttons?.[1]?.pressed ||
    !!pad.buttons?.[2]?.pressed ||
    !!pad.buttons?.[3]?.pressed ||
    !!pad.buttons?.[8]?.pressed ||
    !!pad.buttons?.[9]?.pressed;

  return {
    connected: true,
    left,
    right,
    up,
    down,
    jump,
    axisX,
    axisY,
  };
}

function getMovementInput() {
  const pad = getGamepadState();
  const keyboardLeft = keyIsDown(65) || keyIsDown(37);
  const keyboardRight = keyIsDown(68) || keyIsDown(39);
  const useGamepad = settings.control === "gamepad" && pad.connected;

  if (useGamepad) {
    return {
      left: keyboardLeft || actionMobile.left || pad.left,
      right: keyboardRight || actionMobile.right || pad.right,
    };
  }

  return {
    left: keyboardLeft || actionMobile.left,
    right: keyboardRight || actionMobile.right,
  };
}

function getJumpInput() {
  const pad = getGamepadState();
  const keyboardJump = keyIsDown(87) || keyIsDown(38) || keyIsDown(32);
  const gamepadJump =
    settings.control === "gamepad" && pad.connected && (pad.jump || pad.up);

  return keyboardJump || actionMobile.jump || gamepadJump;
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
        actionMobile.jump = true;
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
      actionMobile.jump = true;
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
  actionMobile.jump = false;

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
      closeCardMenu();
      return;
    }
  }

  for (let i = cards.length - 1; i >= 0; i--) {
    let c = cards[i];
    if (tx > c.x && tx < c.x + c.sizeX && ty > c.y && ty < c.y + c.sizeY) {
      cardMenuState.selectedIndex = i;
      cardMenuState.focus = "card";
      purchaseSelectedCard(i);
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
