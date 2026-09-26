class Card extends Entity {
  constructor(x, y, size, cardData) {
    super(x, y);
    this.sizeX = size;
    this.sizeY = size * 1.2;
    const card = cardData || random(CARD_TYPES);

    this.name = card.name;
    this.hability = card.hability;

    let multiplier = Math.floor(score / 1000);
    this.price = card.price + multiplier;
  }

  getRandomCard() {
    const card = cardData || random(CARD_TYPES);

    this.name = card.name;

    this.hability = card.hability;

    let multiplier = Math.floor(score / 1000);
    this.price = card.price + multiplier;
  }

  show() {
    push();

    let r = this.sizeX * 0.08;

    noStroke();
    fill(0, 0, 0, 90);
    rect(
      this.x + this.sizeX * 0.04,
      this.y + this.sizeX * 0.04,
      this.sizeX,
      this.sizeY,
      r,
    );

    fill(252, 205, 90);
    rect(this.x, this.y, this.sizeX, this.sizeY, r);

    stroke(90, 50, 15);
    strokeWeight(this.isSelected ? 7 : 5);
    noFill();
    rect(this.x, this.y, this.sizeX, this.sizeY, r);

    if (this.isSelected) {
      stroke(255, 210, 90);
      strokeWeight(4);
      noFill();
      rect(
        this.x - 8,
        this.y - 8,
        this.sizeX + 16,
        this.sizeY + 16,
        r + 6,
      );
    }

    noStroke();
    fill(255, 235, 170);
    rect(this.x + 6, this.y + 6, this.sizeX - 12, this.sizeY - 12, r * 0.8);

    fill(185, 115, 35);
    rect(this.x + 6, this.y + 6, this.sizeX - 12, this.sizeY * 0.18, r * 0.7);

    fill(40, 20, 10);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(constrain(this.sizeX * 0.09, 14, 24));

    text(this.name, this.x + this.sizeX / 2, this.y + this.sizeY * 0.11);

    let pulse = sin(frameCount * 0.1) * 4;

    fill(255, 255, 255, 70);
    circle(
      this.x + this.sizeX / 2,
      this.y + this.sizeY * 0.52,
      this.sizeX * 0.5 + pulse,
    );

    fill(255, 215, 70, 80);
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

    fill(120, 70, 20);
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

    fill(255);

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

let cardMenuState = {
  selectedIndex: 0,
  focus: "card",
  leftHeld: false,
  rightHeld: false,
  upHeld: false,
  downHeld: false,
  confirmHeld: false,
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
  };
}

function updateCardMenuSelection() {
  if (cards.length === 0) {
    resetCardMenuState();
    return;
  }

  const pad = getGamepadState();
  const moveLeft = pad.left || keyIsDown(65) || keyIsDown(37);
  const moveRight = pad.right || keyIsDown(68) || keyIsDown(39);
  const moveUp = pad.up || keyIsDown(87) || keyIsDown(38);
  const moveDown = pad.down || keyIsDown(83) || keyIsDown(40);
  const confirmPress = pad.jump || keyIsDown(13) || keyIsDown(90) || keyIsDown(65);

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
      cards = [];
      resetCardMenuState();
      return;
    }

    const chosenCard = cards[cardMenuState.selectedIndex];

    if (!chosenCard) {
      resetCardMenuState();
      return;
    }

    if (money >= chosenCard.price) {
      buyCard(chosenCard);
      resetCardMenuState();
    } else {
      cardMessage = "você não tem peixes suficientes!";
      cardMessageTimer = 120;
    }

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


  availableCards = shuffle(availableCards);
  let num = Math.min(3, availableCards.length);
  
  let s = constrain(width * 0.28, 140, 220);
  let totalW = num * s + (num - 1) * 20;
  let startX = (width - totalW) / 2;

  for (let i = 0; i < num; i++) {
    cards.push(new Card(startX + i * (s + 20), height * 0.25, s, availableCards[i]));
  }
}

function updateCards() {
  updateCardMenuSelection();

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    card.isSelected =
      cardMenuState.focus === "card" && i === cardMenuState.selectedIndex;
    card.show();
  }

  if (cards.length > 0) {
    const closeSelected = cardMenuState.focus === "close";

    fill(closeSelected ? 255 : 252, closeSelected ? 220 : 194, 74);
    rect(width - 72, 20, 54, 54, 14);
    fill(closeSelected ? 255 : 255, closeSelected ? 240 : 225, 120);
    rect(width - 68, 24, 46, 18, 10);
    stroke(85, 48, 20);
    strokeWeight(closeSelected ? 6 : 4);
    noFill();
    rect(width - 72, 20, 54, 54, 14);
    noStroke();
    fill(60, 30, 10);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(28);
    text("✕", width - 45, 47);
  }

  drawCardMessage();
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
