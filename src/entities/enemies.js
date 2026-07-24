class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.dy = 0;
    this.dx = 0;
    this.type = type ?? this.generateType();
    this.angle = 0;
    this.angleDegress = 1;
    this.size = this.getSize();
    this.isDead = false;
    this.isDying = false;
    this.baseColor = this.getColor();
    this.moveTimer = 0;
    this.targetX = x;
    this.targetY = y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.warning = this.type === "bigBall";
    this.warningTime = 60;
    this.lockToScreen = this.type === "bigBall";
    this.frame = 0;
    this.frameTimer = 0;
    this.frameSpeed = 10;
    this.maxFrames = 4;
    this.animation = "idle";
    this.roarTimer = 80;
    this.direction;
    this.updateAnimation();
  }

  generateType() {
    let type;
    this.size = random(40, 50);

    if (random(1) > 0.5) {
      type = "bigBall";
    } else {
      type = "flying";
    }

    return type;
  }

  getSize() {
    let size;

    switch (this.type) {
      case "flying":
        size = random(100, 128);
        break;
      case "bigBall":
        size = random(70, 100);
        break;
      default:
        break;
    }

    return size;
  }

  getColor() {
    return this.type === "flying" ? color(100, 149, 237) : color(140);
  }

  show() {
    if (this.type === "flying") {
      push();

      translate(this.x, this.y);

      if (this.direction == -1) {
        scale(-1, 1);
      }

      rotate(this.angle);

      let row = 0;

      switch (this.animation) {
        case "fly":
          row = 0;
          break;

        case "roar":
          row = 1;
          break;

        case "dead":
          row = 2;
          break;
      }

      image(
        enemySprite,
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size,
        this.frame * FRAME_W,
        row * FRAME_H,
        FRAME_W,
        FRAME_H,
      );

      pop();
    }

    if (this.type === "bigBall" && this.warning) {
      push();

      translate(this.x, 60);

      let pulse = 1 + sin(frameCount * 0.3) * 0.15;
      scale(pulse);

      fill(255, 70, 70);
      noStroke();

      triangle(-20, 0, 20, 0, 0, 40);

      pop();
    }

    if (this.type === "bigBall") {
      push();

      translate(this.x, this.y);

      rotate(this.angle);

      let row = 0;

      if (this.isDying) {
        row = 2;
      } else if (this.warning) {
        row = 1;
      } else {
        row = 0;
      }

      image(
        enemySprite2,
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size,
        this.bigBallFrame * FRAME_W,
        row * FRAME_H,
        FRAME_W,
        FRAME_H,
      );

      pop();
    }
  }

  update() {
    if (this.velocityX > 0.1) {
      this.direction = 1;
    } else if (this.velocityX < -0.1) {
      this.direction = -1;
    }

    if (this.type === "flying") {
      this.moveTimer--;

      if (this.moveTimer <= 0) {
        this.targetX = random(30, width - 30);
        this.targetY = this.y + random(-80, 80);

        this.moveTimer = random(40, 100);
      }

      let forceX = (this.targetX - this.x) * 0.001;
      let forceY = (this.targetY - this.y) * 0.001;

      this.velocityX += forceX;
      this.velocityY += forceY;

      this.velocityX = constrain(this.velocityX, -1.2, 1.2);
      this.velocityY = constrain(this.velocityY, -1.2, 1.2);

      this.x += this.velocityX;
      this.y += this.velocityY;

      this.angle += sin(frameCount * 0.1) * 0.02;

      if (this.x < 20 || this.x > width - 20) {
        this.velocityX *= -1;
      }

      if (random(1, 540) > 539) {
        monsterScream_Sound.play();
        this.isRoaring = true;
        this.roarTimer = 80;
      }

      if (this.isRoaring) {
        this.roarTimer--;

        if (this.roarTimer <= 0) {
          this.isRoaring = false;
        }
      }
    }

    if (this.warning && this.lockToScreen) {
      this.x = this.x;
      this.y = player.y - 300;

      this.warningTime--;

      if (this.warningTime <= 0) {
        this.warning = false;
        this.lockToScreen = false;
        this.dy = 0;
      }

      return;
    }

    if (this.type === "bigBall") {
      this.dy += player.gravity;

      if (this.dx === 0) {
        this.dx = random(-2, 2);
      }

      this.angleDegress = this.dx;
      this.angle += this.angleDegress * 0.1;

      if (this.x - this.size / 2 <= 0 || this.x + this.size / 2 >= width) {
        this.dx *= -1;
      }
    }

    if (player.dy < 0) {
      this.y += cameraSpeed;
    }

    this.y += this.dy;
    this.x += this.dx;

    this.updateAnimation();

    if (
      this.isDying &&
      this.frame == this.maxFrames - 1 &&
      this.frameTimer == 0
    ) {
      this.isDead = true;
    }
  }

  updateAnimation() {
    let newAnimation = "fly";

    if (this.isDying) {
      newAnimation = "dead";
    } else if (this.isRoaring) {
      newAnimation = "roar";
    } else {
      newAnimation = "fly";
    }

    changeAnimation(this, newAnimation);

    updateSpriteAnimation(this);
  }

  bigBallUpdate() {
    for (let i = 0; i < blocks.length; i++) {
      let block = blocks[i];

      let ballBottom = this.y + this.size / 2;
      let previousBottom = ballBottom - this.dy;

      if (
        this.dy > 0 &&
        previousBottom <= block.y &&
        ballBottom >= block.y &&
        this.x + this.size / 2 > block.x &&
        this.x - this.size / 2 < block.x + block.width
      ) {
        let impactVelocity = this.dy;

        this.y = block.y - this.size / 2;
        this.dy = 0;

        if (
          impactVelocity > 6 &&
          block.type !== "jump" &&
          block.type !== "brittle" &&
          this.type === "bigBall"
        ) {
          rock_Sound.play();
        }

        if (block.type === "brittle") {
          brokeBlock(block);
          wood_surface.play();
        }

        if (block.type === "freeze") {
          brokeBlock(block);
          grassBreak_Sound.play();
        }

        if (block.type === "jump") {
          this.dy -= this.size * random(0.2, 0.4);
        }

        if (block.type === "moving") {
          this.dx += block.dx * 0.1;
        }
      }
    }
  }

  blockColision(obj) {
    let w = obj.width ? obj.width : obj.size;
    let h = obj.height ? obj.height : obj.size;
    let closestX = constrain(this.x, obj.x, obj.x + w);
    let closestY = constrain(this.y, obj.y, obj.y + h);

    let distance = dist(this.x, this.y, closestX, closestY);

    return distance < this.size / 2;
  }

  isOffScreen() {
    return this.y > height;
  }
}

function createEnemies(type,blockX) {
  if (type == "jump" || type == "brittle") {
    return;
  }

  enemyCounter++;

  if (enemyCounter >= respawnEnemiesRate) {
    let x = blockX + random(-50,50);
    let y = player.y - max(300, abs(player.dy) * 20);

    enemies.push(new Enemy(x, y));

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
    enemies[i].bigBallUpdate();
    player.colisionWithEnemy(enemies[i]);
  }

  enemies = enemies.filter((enemy) => !enemy.isOffScreen());
  enemies = enemies.filter((enemy) => !enemy.isDead);
}
