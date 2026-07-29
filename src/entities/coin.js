class Coin extends AnimatedEntity {
  constructor(x, y) {
    super(x, y);
    this.size = 18;
    this.width = 40;
    this.height = 40;
    this.colisionType = "circle";
  }

  show() {
    let row = 0;

    switch (this.animation) {
      case "idle":
        row = 0;
        break;
      case "die":
        row = 1;
        break;
    }

    this.drawSprite(coinSprite, FRAME_W, FRAME_H, row);
  }

  update() {
    if (!this.isDying) {
      this.dy = sin(frameCount * 0.08) * 1;
      this.y += this.dy;
    }

    this.updateSprite();
  }

  colision() {
    if (this.isDying) return;

    this.animation = "die";
    money++;
    numTotalCoinCollect++;

    if (powerSystem.isCoin2xActive()) {
      money++;
    }

    playSound(coinCollect_Sound);

    createParticle(
      this.x,
      this.y,
      5,
      color(255, 220, 0),
      { min: -1, max: 1 },
      { min: -0.4, max: 1.2 },
      25,
      25,
    );
    this.frame = 0;
    this.frameTimer = 0;
    this.isDying = true;
  }
}

let cardMessage = "";
let cardMessageTimer = 0;

function buyCard(card) {
  if (money < card.price) {
    cardMessage = "você não tem peixes suficientes!";
    cardMessageTimer = 120;

    return;
  }

  money -= card.price;
  powerSystem.activatePower(card.hability);

  cards = [];

  numTotalCardsCollect++;

  playSound(buyCard_Sound);
}

function updateCoins() {
  for (let i = 0; i < coins.length; i++) {
    let coin = coins[i];

    if (powerSystem.isMagnetActive()) {
      let distance = dist(player.x, player.y, coin.x, coin.y);

      if (distance < powerSystem.effects.magnetRadius) {
        coin.x += (player.x - coin.x) * 0.05;
        coin.y += (player.y - coin.y) * 0.05;
      }
    }

    coin.show();
    coin.update();

    if (coin.isDying) {
      coin.dy += 0.25;
      coin.y += coin.dy;

      coin.angle += 0.15;

      if (coin.frame == coin.maxFrames - 1 && coin.frameTimer == 0) {
        coins.splice(i, 1);
        i--;
      }

      continue;
    }

    if (player.dy < 0) {
      coin.y += cameraSpeed;
    }

    let d = dist(
      player.x + player.width / 2,
      player.y + player.height / 2,
      coin.x,
      coin.y,
    );

    if (player.isColision(coin)) {
      coin.colision();
    }
  }
  coins = coins.filter((c) => !c.isOffScreen());
}

function createCoin(x, y) {
  if (settings.mode == "CASUAL") return;
  coins.push(new Coin(x + random(10, 60), y - 50));
}

function drawCoinHud() {
  if (settings.mode == "CASUAL") return;
  push();

  noStroke();
  fill(0, 0, 0, 70);
  rect(19, 19, 120, 48, 14);

  fill(252, 194, 74);
  rect(15, 15, 120, 48, 14);

  fill(255, 225, 120);
  rect(20, 20, 110, 18, 10);
  stroke(85, 48, 20);
  strokeWeight(4);
  noFill();
  rect(15, 15, 120, 48, 14);

  image(coinSprite, 22, 19, 30, 30, 0, 0, FRAME_W, FRAME_H);

  fill(60, 30, 10);
  noStroke();
  textStyle(BOLD);
  textSize(26);
  textAlign(LEFT, CENTER);

  text(money, 60, 39);

  pop();
}
