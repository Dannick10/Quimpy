class Card extends Entity {
  constructor(x,y,size) {
    super(x,y)
    this.sizeX = size;
    this.sizeY = size * 1.2;
    this.getRandomCard();
  }

  getRandomCard() {
    const cardTypes = [
      { name: "Impulso do Coelho", hability: "jump_boost", price: 3 },
      { name: "Passo Fantasma", hability: "ghost", price: 4 },
      { name: "Tempo Lento", hability: "slow_time", price: 6 },
      { name: "Escudo de Papelão", hability: "shield", price: 3 },
      { name: "Pés de Vento", hability: "dash", price: 4 },
      { name: "Campo Magnético", hability: "magnet", price: 5 },
      { name: "Moeda da Fortuna", hability: "coin_2x", price: 6 },
    ];

    const card = random(cardTypes);

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
    strokeWeight(5);
    noFill();
    rect(this.x, this.y, this.sizeX, this.sizeY, r);

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

function createCards() {
  card_Sound.play();
  cards = [];
  let num = 3;
  let s = constrain(width * 0.28, 140, 220);
  let totalW = num * s + (num - 1) * 20;
  let startX = (width - totalW) / 2;

  for (let i = 0; i < num; i++) {
    cards.push(new Card(startX + i * (s + 20), height * 0.25, s));
  }
}

function updateCards() {
  for (let card of cards) {
    card.show();
  }

  if (cards.length > 0) {
    fill(252, 194, 74);
    rect(width - 72, 20, 54, 54, 14);
    fill(255, 225, 120);
    rect(width - 68, 24, 46, 18, 10);
    stroke(85, 48, 20);
    strokeWeight(4);
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
