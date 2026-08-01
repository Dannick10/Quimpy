class Enemy extends AnimatedEntity {
  constructor(x, y, size) {
    super(x, y, FRAME_W, FRAME_H);
    this.size = size;
    this.width = size;
    this.height = size;
    this.isDead = false;
    this.isDying = false;
    this.baseColor = color(255);
    this.collisionType = "box";
    this.angle = 0;
    this.isRoaring = false;
    this.roarTimer = 80;
  }

  show() {}

  update() {}

  updateAnimation() {
    let animation = "fly";

    if (this.isDying) {
      animation = "dead";
    } else if (this.isRoaring) {
      animation = "roar";
    }

    this.setAnimation(animation);
    this.updateDirection();
    this.updateSprite();
  }

  die() {
    if (this.isDying) return;
    this.isDying = true;
    this.frame = 0;
    this.frameTimer = 0;
    playSound(hitKillSound);

    numTotalEnemyDie++;

    addScore(this.type);

    createParticle(
      this.x + this.size / 2,
      this.y + this.size / 2,
      this.size,
      this.baseColor,
      { min: -2, max: 2 },
      { min: -2, max: 5 },
      this.size * 0.5,
      this.size * 0.5,
      "enemyDeath",
    );
  }

  isOffScreen() {
    return this.y > height;
  }
}

class FlyingEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, random(100, 128));
    this.type = "flying";
    this.baseColor = color(100, 149, 237);
    this.moveTimer = 0;
    this.targetX = x;
    this.targetY = y;
  }

  show() {
    let row = 0;
    if (this.isDying) row = 2;
    else if (this.isRoaring) row = 1;
    this.drawSprite(enemySprite, FRAME_W, FRAME_H, row);
  }

  update() {
    this.moveTimer--;

    if (this.moveTimer <= 0) {
      this.targetX = random(30, width - 30);
      this.targetY = this.y + random(-80, 80);
      this.moveTimer = random(40, 100);
    }

    let forceX = (this.targetX - this.x) * 0.001;
    let forceY = (this.targetY - this.y) * 0.001;

    this.dx += forceX;
    this.dy += forceY;

    this.dx = constrain(this.dx, -1.2, 1.2);
    this.dy = constrain(this.dy, -1.2, 1.2);

    this.x += this.dx;
    this.y += this.dy;

    this.angle += sin(frameCount * 0.1) * 0.02;

    if (random(1, 540) > 539) {
      playSound(monsterScream_Sound);

      this.isRoaring = true;
      this.roarTimer = 80;
    }

    if (this.isRoaring) {
      this.roarTimer--;

      if (this.roarTimer <= 0) this.isRoaring = false;
    }

    this.updateAnimation();

    if (
      this.isDying &&
      this.frame == this.maxFrames - 1 &&
      this.frameTimer == 0
    ) {
      this.isDead = true;
    }
  }
}

class BigBallEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, random(70, 100));
    this.type = "bigBall";
    this.collisionType = "circle";
    this.baseColor = color(140);
    this.dx = random(-2, 2);
    this.warning = true;
    this.warningTime = 60;
    this.lockToScreen = true;
  }

  show() {
    if (this.warning) {
      push();

      translate(this.x, 60);
      let pulse = 1 + sin(frameCount * 0.3) * 0.15;
      scale(pulse);
      fill(255, 70, 70);
      noStroke();
      triangle(-20, 0, 20, 0, 0, 40);
      pop();
    }

    let row = 0;

    if (this.isDying) row = 2;
    else if (this.warning) row = 1;

    this.drawSprite(enemySprite2, FRAME_W, FRAME_H, row, "center");
  }

  update() {
    if (this.warning && this.lockToScreen) {
      this.y = player.y - 300;

      this.warningTime--;

      if (this.warningTime <= 0) {
        this.warning = false;
        this.lockToScreen = false;
      }

      return;
    }

    this.dy += player.gravity;
    this.angle += this.dx * 0.1;

    if (this.x - this.size / 2 <= 0 || this.x + this.size / 2 >= width) {
      this.dx *= -1;
    }

    if (player.dy < 0) this.y += cameraSpeed;

    this.x += this.dx;
    this.y += this.dy;

    this.updateAnimation();

    if (
      this.isDying &&
      this.frame == this.maxFrames - 1 &&
      this.frameTimer == 0
    ) {
      this.isDead = true;
    }
  }

  bigBallUpdate() {
    for (let block of blocks) {
      let ballBottom = this.y + this.size / 2;
      let previousBottom = ballBottom - this.dy;

      if (
        this.dy > 0 &&
        previousBottom <= block.y &&
        ballBottom >= block.y &&
        this.x + this.size / 2 > block.x &&
        this.x - this.size / 2 < block.x + block.width
      ) {
        this.y = block.y - this.size / 2;
        this.dy = 0;

        if (block.type === "brittle") {
          brokeBlock(block);
          playSound(wood_surface);
        }

        if (block.type === "freeze") {
          brokeBlock(block);
          playSound(grassBreak_Sound);
        }

        if (block.type === "jump") {
          this.dy -= this.size * random(0.2, 0.4);
        }
      }
    }
  }
}

function createEnemies(type, blockX) {
  if (type == "jump" || type == "brittle" || settings.mode == "CASUAL") {
    return;
  }

  enemyCounter++;

  if (enemyCounter >= respawnEnemiesRate) {
    let x = blockX + random(-50, 50);
    let y = player.y - max(300, abs(player.dy) * 20);

    if (random(1) > 0.5) {
      let safeDistance = 80;
      let extraRange = random(20, 120);

      let side = random() < 0.5 ? -1 : 1;
      let x = player.x + (safeDistance + extraRange) * side;
      enemies.push(new FlyingEnemy(x, y));
    } else {
      enemies.push(new BigBallEnemy(x, y));
    }

    enemyCounter = 0;
  }

  if (score > 10000) {
    respawnEnemiesRate -= 10;
  }

  if (score > 20000) {
    respawnEnemiesRate -= 10;
  }

  if (score > 30000) {
    respawnEnemiesRate -= 10;
  }
}

function updateEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].show();
    enemies[i].update();
    if (enemies[i].type === "bigBall") {
      enemies[i].bigBallUpdate();
    }
    player.colisionWithEnemy(enemies[i]);
  }

  enemies = enemies.filter((enemy) => !enemy.isOffScreen());
  enemies = enemies.filter((enemy) => !enemy.isDead);
}
