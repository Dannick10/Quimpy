class Card extends Entity {
  constructor(x, y, size, cardData) {
    super(x, y);
    this.sizeX = size;
    this.sizeY = size * 1.2;

    this.getRandomCard(cardData);

    this.exitState = {
      active: false,
      progress: 0,
      vx: 0,
      vy: 0,
    };
  }

  getRandomCard(cardData = null) {
    const card = cardData || random(CARD_TYPES);

    this.name = card.name;
    this.hability = card.hability;

    const multiplier = Math.floor(score / 1000);
    this.price = card.price + multiplier;
    return card;
  }

  show(introProgress = 1, selectionState = null) {
    push();

    const rise = (1 - introProgress) * 28;
    const scaleFactor = 0.82 + introProgress * 0.18;

    let drawX = this.x;
    let drawY = this.y;
    let drawScale = 1;
    let alphaMult = 1;
    let rotationValue = 0;

    if (this.exitState && this.exitState.active) {
      drawX = this.exitState.x;
      drawY = this.exitState.y;
      rotationValue = this.exitState.rotation;
      drawScale = 1;
      alphaMult = 1;
    } else if (selectionState && selectionState.active) {
      const t = constrain(selectionState.progress, 0, 1);
      const isChosen = selectionState.selectedIndex === selectionState.cardIndex;

      if (isChosen) {
        const targetX = width * 0.5 - this.sizeX * 0.5;
        const targetY = height * 0.38;
        drawX = lerp(this.x, targetX, easeOutCubic(t));
        drawY = lerp(this.y, targetY, easeOutCubic(t));
        drawScale = 1 + t * 0.7;
        alphaMult = 1 - t * 0.7;
      } else {
        const dir = this.x < width / 2 ? -1 : 1;
        drawX = lerp(this.x, this.x + dir * (width * 0.82), easeOutCubic(t));
        drawY = lerp(this.y, this.y - 120, easeOutCubic(t));
        alphaMult = 1 - t * 0.95;
      }
    } else if (this.spawnDelay != null) {
      const spawnT = constrain((introProgress * 1.15) - this.spawnDelay / 30, 0, 1);
      const dropDistance = (1 - spawnT) * 220;
      const impact = Math.max(0, 1 - Math.abs(spawnT - 0.8) / 0.25);
      drawY = this.y - dropDistance + impact * 10;
      drawX = this.x;
      drawScale = 0.86 + spawnT * 0.18;
      alphaMult = 0.6 + spawnT * 0.4;
    }

    const cardAlpha = (70 + introProgress * 185) * alphaMult;

    if (this.exitState && this.exitState.active) {
      translate(drawX, drawY);
      rotate(rotationValue);
    } else {
      translate(drawX - this.x, drawY - this.y + rise);
      scale(scaleFactor * drawScale);
    }

    let r = this.sizeX * 0.08;

    noStroke();
    fill(0, 0, 0, (40 + introProgress * 45) * alphaMult);
    rect(
      this.x + this.sizeX * 0.04,
      this.y + this.sizeX * 0.04,
      this.sizeX,
      this.sizeY,
      r,
    );

    fill(252, 205, 90, cardAlpha);
    rect(this.x, this.y, this.sizeX, this.sizeY, r);

    stroke(90, 50, 15);
    strokeWeight(this.isSelected ? 7 : 5);
    noFill();
    rect(this.x, this.y, this.sizeX, this.sizeY, r);

    noStroke();
    fill(255, 235, 170, cardAlpha);
    rect(this.x + 6, this.y + 6, this.sizeX - 12, this.sizeY - 12, r * 0.8);

    fill(185, 115, 35, cardAlpha);
    rect(this.x + 6, this.y + 6, this.sizeX - 12, this.sizeY * 0.18, r * 0.7);

    fill(40, 20, 10, 255 * alphaMult);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(constrain(this.sizeX * 0.09, 14, 24));

    text(this.name, this.x + this.sizeX / 2, this.y + this.sizeY * 0.11);

    let pulse = sin(frameCount * 0.1 + this.x * 0.02) * (this.isSelected ? 3 : 2.5);

    fill(255, 255, 255, 55 * alphaMult);
    circle(
      this.x + this.sizeX / 2,
      this.y + this.sizeY * 0.52,
      this.sizeX * 0.5 + pulse,
    );

    fill(255, 215, 70, 65 * alphaMult);
    circle(
      this.x + this.sizeX / 2,
      this.y + this.sizeY * 0.52,
      this.sizeX * 0.42,
    );

    push();
    translate(this.x + this.sizeX / 2, this.y + this.sizeY * 0.52);
    scale(this.sizeX / 150);
    this.drawIcon();
    pop();

    let priceY = this.y + this.sizeY * 0.88;

    fill(120, 70, 20, 255 * alphaMult);
    rect(this.x + this.sizeX * 0.18, priceY - 18, this.sizeX * 0.64, 36, 10);

    imageMode(CENTER);

    image(
      coinSprite,
      this.x + this.sizeX * 0.34,
      priceY,
      28,
      28,
      0,
      0,
      FRAME_W,
      FRAME_H,
    );

    fill(255, 255, 255, 255 * alphaMult);

    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(constrain(this.sizeX * 0.12, 18, 30));

    text(this.price, this.x + this.sizeX * 0.44, priceY);

    pop();
  }

  drawIcon() {
    stroke(0);

    strokeWeight(3);

    noFill();

    drawPowerIcon(this.hability);
  }
}

const CARD_TYPES = [
  { name: "Impulso do Coelho", hability: "jump_boost", price: 3 },
  { name: "Passo Fantasma", hability: "ghost", price: 4 },
  { name: "Tempo Lento", hability: "slow_time", price: 6 },
  { name: "Escudo de Papelão", hability: "shield", price: 7 },
  { name: "Pés de Vento", hability: "dash", price: 4 },
  { name: "Campo Magnético", hability: "magnet", price: 5 },
  { name: "Moeda da Fortuna", hability: "coin_2x", price: 6 },
  { name: "Guarda Chuva", hability: "delta_force", price: 3 },
];

const CARD_EXIT_SPEED = {
  minX: 2.8,
  maxX: 3.8,
  minY: -1.8,
  maxY: 2.4,
  gravity: 0.12,
  rotationSpeed: 0.08,
};

const CARD_SELECTION_DURATION = 40;
const CARD_SELECTION_SPEED = 1 / CARD_SELECTION_DURATION;
const CARD_PARTICLE_TRIGGER = 0.78;

let cardMenuState = {
  selectedIndex: 0,
  focus: "card",
  leftHeld: false,
  rightHeld: false,
  upHeld: false,
  downHeld: false,
  confirmHeld: false,
  lockTimer: 0,
  selectionStarted: false,
  selectionProgress: 0,
  selectionIndex: -1,
  canSelect: false,
  introTimer: 0,
  exitStarted: false,
  exitMode: null,
  selectionBurstTriggered: false,
  selectionFinishDelay: 0,
};

function resetCardMenuState() {
  cardMenuState = {
    selectedIndex: 0,
    focus: "card",
    leftHeld: false,
    rightHeld: false,
    upHeld: false,
    downHeld: false,
    confirmHeld: false,
    lockTimer: 0,
    selectionStarted: false,
    selectionProgress: 0,
    selectionIndex: -1,
    canSelect: false,
    introTimer: 0,
    exitStarted: false,
    exitMode: null,
    selectionBurstTriggered: false,
    selectionFinishDelay: 0,
  };
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function startCardExit(card, vx, vy) {
  if (!card) return;

  card.exitState = {
    active: true,
    x: card.x,
    y: card.y,
    vx,
    vy,
    gravity: CARD_EXIT_SPEED.gravity,
    rotation: random(-0.3, 0.3),
    rotationSpeed: random(-CARD_EXIT_SPEED.rotationSpeed, CARD_EXIT_SPEED.rotationSpeed),
    finished: false,
  };
}

function updateCardExitAnimations(completeMenu = true) {
  let allFinished = true;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    if (!card || !card.exitState || !card.exitState.active) continue;

    const exitState = card.exitState;

    exitState.vy += exitState.gravity;
    exitState.x += exitState.vx;
    exitState.y += exitState.vy;
    exitState.rotation += exitState.rotationSpeed;
    exitState.vx *= 0.992;

    card.x = exitState.x;
    card.y = exitState.y;

    const leftBounds = exitState.x < -card.sizeX * 2;
    const rightBounds = exitState.x > width + card.sizeX * 2;
    const bottomBounds = exitState.y > height + card.sizeY * 2;
    const topBounds = exitState.y < -card.sizeY * 2;

    if (leftBounds || rightBounds || bottomBounds || topBounds) {
      exitState.finished = true;
      exitState.active = false;
      card.x = exitState.x;
      card.y = exitState.y;
    } else {
      allFinished = false;
    }
  }

  if (allFinished && cardMenuState.exitStarted && completeMenu) {
    cards = [];
    resetCardMenuState();
    return true;
  }

  return false;
}

function updateCardMenuSelection() {
  if (cards.length === 0) {
    resetCardMenuState();
    return;
  }

  if (cardMenuState.exitStarted) {
    if (updateCardExitAnimations()) {
      return;
    }

    return;
  }

  if (cardMenuState.selectionStarted) {
    updateCardExitAnimations(false);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      if (card && card.exitState && card.exitState.active) {
        card.exitState.progress = Math.min(
          1,
          card.exitState.progress + 1 / 40,
        );
      }
    }

    cardMenuState.selectionProgress = Math.min(
      1,
      cardMenuState.selectionProgress + CARD_SELECTION_SPEED,
    );

    const chosenCard = cards[cardMenuState.selectionIndex];
    const remainingDiscarded = cards.some((card, index) => {
      if (index === cardMenuState.selectionIndex) return false;
      return card && card.exitState && card.exitState.active;
    });

    if (
      !cardMenuState.selectionBurstTriggered &&
      cardMenuState.selectionProgress >= CARD_PARTICLE_TRIGGER
    ) {
      if (chosenCard) {
        const burstX = width / 2;
        const burstY = height * 0.38 + chosenCard.sizeY * 0.15;

        createParticle(
          burstX,
          burstY,
          4,
          color(255, 255, 255),
          { min: -2.8, max: 2.8 },
          { min: -2.8, max: 2.8 },
          36,
          42,
          "normal",
        );

        createParticle(
          burstX,
          burstY,
          3,
          color(255, 215, 120),
          { min: -3.2, max: 3.2 },
          { min: -3.2, max: 3.2 },
          32,
          40,
          "normal",
        );
      }

      cardMenuState.selectionBurstTriggered = true;
    }

    if (cardMenuState.selectionProgress >= 1 && !remainingDiscarded) {
      if (cardMenuState.selectionFinishDelay <= 0) {
        cardMenuState.selectionFinishDelay = 18;
      }

      cardMenuState.selectionFinishDelay--;

      if (cardMenuState.selectionFinishDelay <= 0) {
        cards = [];
        resetCardMenuState();
        return;
      }

      return;
    }

    if (cardMenuState.selectionProgress >= 1) {
      cardMenuState.selectionFinishDelay = 0;
    }

    return;
  }

  const pad = getGamepadState();
  const moveLeft = pad.left || keyIsDown(65) || keyIsDown(37);
  const moveRight = pad.right || keyIsDown(68) || keyIsDown(39);
  const moveUp = pad.up || keyIsDown(87) || keyIsDown(38);
  const moveDown = pad.down || keyIsDown(83) || keyIsDown(40);
  const confirmPress = pad.jump || keyIsDown(13) || keyIsDown(90);

  if (cardMenuState.lockTimer > 0) {
    cardMenuState.lockTimer--;

    cardMenuState.leftHeld = false;
    cardMenuState.rightHeld = false;
    cardMenuState.upHeld = false;
    cardMenuState.downHeld = false;
    cardMenuState.confirmHeld = confirmPress;

    return;
  }

  if (!cardMenuState.canSelect) {
    cardMenuState.leftHeld = false;
    cardMenuState.rightHeld = false;
    cardMenuState.upHeld = false;
    cardMenuState.downHeld = false;
    cardMenuState.confirmHeld = confirmPress;
    return;
  }

  if (moveLeft && !cardMenuState.leftHeld) {
    if (cardMenuState.focus === "close") {
      cardMenuState.focus = "card";
    } else {
      cardMenuState.selectedIndex =
        (cardMenuState.selectedIndex - 1 + cards.length) % cards.length;
    }
    cardMenuState.leftHeld = true;
  } else if (!moveLeft) {
    cardMenuState.leftHeld = false;
  }

  if (moveRight && !cardMenuState.rightHeld) {
    if (cardMenuState.focus === "close") {
      cardMenuState.focus = "card";
    } else {
      cardMenuState.selectedIndex =
        (cardMenuState.selectedIndex + 1) % cards.length;
    }
    cardMenuState.rightHeld = true;
  } else if (!moveRight) {
    cardMenuState.rightHeld = false;
  }

  if (moveUp && !cardMenuState.upHeld) {
    cardMenuState.focus = "close";
    cardMenuState.upHeld = true;
  } else if (!moveUp) {
    cardMenuState.upHeld = false;
  }

  if (moveDown && !cardMenuState.downHeld) {
    if (cardMenuState.focus === "close") {
      cardMenuState.focus = "card";
    }
    cardMenuState.downHeld = true;
  } else if (!moveDown) {
    cardMenuState.downHeld = false;
  }

  if (confirmPress && !cardMenuState.confirmHeld) {
    if (cardMenuState.focus === "close") {
      cards.forEach((card) => {
        const direction = random(-1, 1);
        const powerX = random(CARD_EXIT_SPEED.minX, CARD_EXIT_SPEED.maxX) * (direction >= 0 ? 1 : -1);
        const powerY = random(CARD_EXIT_SPEED.minY, CARD_EXIT_SPEED.maxY);
        startCardExit(card, powerX, powerY);
      });

      cardMenuState.exitStarted = true;
      cardMenuState.exitMode = "close";
      cardMenuState.confirmHeld = true;
      return;
    }

    const chosenCard = cards[cardMenuState.selectedIndex];

    if (!chosenCard) {
      resetCardMenuState();
      return;
    }

    if (money >= chosenCard.price) {
      buyCard(chosenCard);

      cards.forEach((card, index) => {
        if (index === cardMenuState.selectedIndex) return;

        const direction = card.x < width / 2 ? -1 : 1;
        const exitVx = random(CARD_EXIT_SPEED.minX, CARD_EXIT_SPEED.maxX) * direction;
        const exitVy = random(CARD_EXIT_SPEED.minY, CARD_EXIT_SPEED.maxY);
        startCardExit(card, exitVx, exitVy);
      });

      cardMenuState.selectionStarted = true;
      cardMenuState.selectionProgress = 0;
      cardMenuState.selectionIndex = cardMenuState.selectedIndex;
      cardMenuState.selectionBurstTriggered = false;
      cardMenuState.confirmHeld = true;
      return;
    }

    cardMessage = "você não tem peixes suficientes!";
    cardMessageTimer = 120;

    cardMenuState.confirmHeld = true;
  }

  if (!confirmPress) {
    cardMenuState.confirmHeld = false;
  }
}

function createCards() {
  if (settings.mode == "CASUAL") return;

  let availableCards = CARD_TYPES.filter(
    (card) => !player.powerSystem.isPowerActive(card.hability)
  );

  if (availableCards.length === 0) return;

  playSound(card_Sound);
  cards = [];

  cardMenuState.selectedIndex = 0;
  cardMenuState.focus = "card";
  cardMenuState.leftHeld = false;
  cardMenuState.rightHeld = false;
  cardMenuState.upHeld = false;
  cardMenuState.downHeld = false;
  cardMenuState.confirmHeld = false;
  cardMenuState.lockTimer = 30;
  cardMenuState.canSelect = false;
  cardMenuState.introTimer = 0;

  availableCards = shuffle(availableCards);
  let num = Math.min(3, availableCards.length);

  let s = constrain(width * 0.28, 140, 220);
  let totalW = num * s + (num - 1) * 20;
  let startX = (width - totalW) / 2;

  for (let i = 0; i < num; i++) {
    const card = new Card(startX + i * (s + 20), height * 0.25, s, availableCards[i]);
    card.spawnDelay = i * 0.28;
    card.introProgress = 0;
    card.introDone = false;
    card.exitState = {
      active: false,
      progress: 0,
      vx: 0,
      vy: 0,
    };
    cards.push(card);
  }
}

function drawSweepGlow(progress) {
  if (progress <= 0) return;

  const startX = lerp(-width * 0.95, 0, progress);
  const endX = lerp(width * 1.05, width * 1.8, progress);
  const bandW = width * (0.9 + progress * 0.26);

  push();
  noStroke();

  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const x = lerp(startX, endX, t);
    const alpha = (1 - t) * (28 + progress * 90) * 0.12;
    fill(255, 255, 255, alpha);
    rect(x - bandW / 2, 0, bandW, height, 20);
  }

  fill(255, 255, 255, 10 + progress * 24);
  rect(startX - bandW * 0.16, 0, bandW * 0.45, height, 20);
  rect(endX - bandW * 0.22, 0, bandW * 0.32, height, 20);
  pop();
}

function updateCards() {
  updateCardMenuSelection();

  if (!cardMenuState.selectionStarted && cards.length > 0 && !cardMenuState.canSelect) {
    cardMenuState.introTimer++;

    cards.forEach((card, index) => {
      const startDelay = index * 12;
      const duration = 18;
      const localProgress = constrain(
        (cardMenuState.introTimer - startDelay) / duration,
        0,
        1,
      );
      card.introProgress = localProgress;
      card.introDone = localProgress >= 1;
    });

    cardMenuState.canSelect = cards.every((card) => card.introDone);
  }

  const introProgress = cards.length > 0 && cardMenuState.lockTimer > 0
    ? 1 - cardMenuState.lockTimer / 30
    : 1;

  const closeProgress =
    cardMenuState.selectionStarted ? cardMenuState.selectionProgress : 0;

  if (cards.length > 0) {
    const sweepProgress = cardMenuState.selectionStarted
      ? 1 - closeProgress
      : constrain(cardMenuState.introTimer / 44, 0, 1);
    drawSweepGlow(sweepProgress);
  }

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    card.isSelected =
      cardMenuState.focus === "card" && i === cardMenuState.selectedIndex;
    card.show(card.introProgress ?? introProgress, {
      active: cardMenuState.selectionStarted,
      progress: cardMenuState.selectionProgress,
      selectedIndex: cardMenuState.selectionIndex,
      cardIndex: i,
    });
  }

  if (cards.length > 0) {
    const closeSelected = cardMenuState.focus === "close";
    const closeScale = 0.9 + introProgress * 0.1;

    push();
    translate(width - 72 + 27, 20 + 27);
    scale(closeScale);
    translate(-27, -27);

    fill(closeSelected ? 255 : 252, closeSelected ? 220 : 194, 74, 180 + introProgress * 75);
    rect(0, 0, 54, 54, 14);
    fill(closeSelected ? 255 : 255, closeSelected ? 240 : 225, 120, 200 + introProgress * 55);
    rect(4, 4, 46, 18, 10);
    stroke(85, 48, 20, 200);
    strokeWeight(closeSelected ? 6 : 4);
    noFill();
    rect(0, 0, 54, 54, 14);
    noStroke();
    fill(60, 30, 10, 220);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(28);
    text("✕", 27, 27);
    pop();
  }

  if (cardMenuState.selectionStarted) {
    const fade = constrain(cardMenuState.selectionProgress * 1.5, 0, 1);
    noStroke();
    fill(255, 255, 255, 30 * fade);
    rect(0, 0, width, height);
  }

  drawCardMessage();
}

function spawnCardBurst(x, y) {
  createParticle(
    x,
    y,
    4,
    color(255, 255, 255),
    { min: -2.4, max: 2.4 },
    { min: -2.6, max: 2.4 },
    28,
    38,
    "normal",
  );

  createParticle(
    x,
    y,
    3,
    color(255, 212, 120),
    { min: -3, max: 3 },
    { min: -3.5, max: 2.7 },
    24,
    34,
    "normal",
  );
}

function checkForNewCards() {
  if (cards.length > 0) return;

  if (score >= nextCardScore) {
    createCards();

    let min = 800;
    let max = 1800;

    if (score > 5000) {
      min = 1200;
      max = 2500;
    }

    if (score > 10000) {
      min = 1800;
      max = 3200;
    }

    nextCardScore += random(min, max);
  }
}

function drawCardMessage() {
  if (cardMessageTimer > 0) {
    let y = height * 0.15 - sin(frameCount * 0.1) * 5;

    push();

    textAlign(CENTER, CENTER);

    textSize(22);

    fill(255);

    text(cardMessage, width / 2, y);

    pop();

    cardMessageTimer--;
  }
}
