class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.width = FRAME_W;
    this.height = FRAME_H;
    this.gravity = 0.9;
    this.baseJumpForce = PLAYER_JUMP;
    this.speed = 5;
    this.isDead = false;
    this.canJump = true;
    this.powerSystem = powerSystem;
    this.frame = 0;
    this.frameTimer = 0;
    this.frameSpeed = 10;
    this.maxFrames = 4;
    this.animation = "idle";
    this.direction = 1;
    this.deathTimer = 0;
    this.deathDuration = 100;
    this.autoJumpTimer = 0 
    this.autoJumpDuration = 20
    this.hasGameOver = false;
    this.updateAnimation();
  }

  show() {
    push();

    translate(this.x + this.width / 2, this.y + this.height / 2);

    if (this.direction == -1) {
      scale(-1, 1);
    }

    let row = 0;
    switch (this.animation) {
      case "idle":
        row = 0;
        break;
      case "walk":
        row = 1;
        break;
      case "jump":
        row = 3;
        break;
      case "dead":
        row = 2;
        break;
      case "fall":
        row = 4;
        break;
    }

    image(
      playerSprite,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      this.frame * FRAME_W,
      row * FRAME_H,
      FRAME_W,
      FRAME_H,
    );
    pop();
    this.drawPowerEffects();
  }

  drawPowerEffects() {
    let px = this.x + this.width / 2;
    let py = this.y + this.height / 2;

    if (this.powerSystem.activePowers.has("jump_boost")) {
      noStroke();

      let pulse = sin(frameCount * 0.15) * 8;

      fill(255, 220, 80, 60);

      ellipse(px, py + 20, this.width * 1.8 + pulse, 25);

      for (let i = 0; i < 3; i++) {
        let angle = frameCount * 0.05 + i * 2;

        let x = px + cos(angle) * 35;
        let y = py - abs(sin(angle)) * 35;

        fill(255, 240, 120);

        star(x, y, 7, 3, 5);
      }
    }

    if (this.powerSystem.isGhostActive()) {
      noStroke();

      for (let i = 3; i > 0; i--) {
        fill(180, 240, 255, 40 / i);

        ellipse(px - i * 8, py, this.width + i * 12, this.height + i * 12);
      }

      fill(200, 255, 255, 50);

      ellipse(px, py, this.width * 2, this.height * 2);

      for (let i = 0; i < 4; i++) {
        let x = px + sin(frameCount * 0.08 + i) * 25;

        let y = py + ((frameCount * 0.8 + i * 20) % 50) - 25;

        fill(220, 255, 255, 160);

        circle(x, y, random(3, 6));
      }
    }

    if (this.powerSystem.effects.shieldActive) {
      let size = this.width * 2.2 + sin(frameCount * 0.12) * 6;

      noFill();

      stroke(120, 220, 255, 120);

      strokeWeight(3);

      circle(px, py, size);

      stroke(255, 255, 255, 100);

      circle(px, py, size + 12);

      noStroke();

      for (let i = 0; i < 5; i++) {
        let angle = frameCount * 0.04 + i;

        fill(255, 255, 255, 180);

        circle(px + (cos(angle) * size) / 2, py + (sin(angle) * size) / 2, 4);
      }
    }

    if (this.powerSystem.isDashing()) {
      noStroke();

      for (let i = 0; i < 6; i++) {
        fill(255, 220, 80, 120 - i * 15);

        ellipse(
          this.x - i * 15,

          py,

          35 + i * 8,

          20,
        );
      }

      fill(255, 240, 150, 80);

      ellipse(px, py, this.width * 2, this.height * 2);

      for (let i = 0; i < 5; i++) {
        fill(255);

        circle(px + random(-30, 30), py + random(-20, 20), random(2, 5));
      }
    }

    if (this.powerSystem.isMagnetActive()) {
      let pulse = sin(frameCount * 0.15) * 10;

      noFill();

      stroke(255, 220, 0, 100);

      strokeWeight(3);

      circle(px, py, 90 + pulse);

      noStroke();

      for (let i = 0; i < 3; i++) {
        let angle = frameCount * 0.05 + i * 2;

        fill(255, 230, 80, 180);

        circle(
          px + cos(angle) * 45,

          py + sin(angle) * 45,

          6,
        );
      }
    }

    if (this.powerSystem.isCoin2xActive()) {
      let y = py - this.height * 0.9 + sin(frameCount * 0.15) * 5;

      for (let i = 0; i < 2; i++) {
        let x = i == 0 ? px - 15 : px + 15;

        stroke(180, 120, 0);

        strokeWeight(2);

        fill(255, 215, 0);

        ellipse(x, y, 16, 16);

        noStroke();

        fill(255, 255, 180);

        circle(x - 3, y - 3, 4);
      }

      fill(255, 220, 0);

      textAlign(CENTER);

      textSize(18);

      text("x2", px, py - 45);
    }

    if (this.powerSystem.isSlowTimeActive()) {
      let sy = py - 45;

      fill(80, 220, 255, 100);

      circle(px, sy, 35);

      stroke(255);

      strokeWeight(3);

      line(px, sy, px, sy - 10);

      line(px, sy, px + 8, sy);

      noStroke();
    }
  }

  update() {
    if (this.isDead) {
      this.deathTimer++;
      this.dy += 0.5;
      this.y += this.dy;

      if (this.frame < this.maxFrames - 1) {
        updateSpriteAnimation(this);
      }

      if (this.deathTimer > this.deathDuration) {
        this.hasGameOver = true;
      }

      return;
    }

    const timeScale = this.powerSystem.getTimeScale();

    this.dy += this.gravity * timeScale;
    this.dy = constrain(this.dy, -50, 30);

    let targetSpeed = this.powerSystem.isDashing()
      ? this.powerSystem.getDashSpeed()
      : this.speed;

    if (keyIsDown(68) || keyIsDown(39) || actionMobile.right) {
      this.dx = targetSpeed;
    } else if (keyIsDown(65) || keyIsDown(37) || actionMobile.left) {
      this.dx = -targetSpeed;
    } else {
      this.dx = 0;
    }

    if (this.x < 0) this.x = width - this.width;
    if (this.x + this.width > width) this.x = 0;

    this.y += this.dy;
    this.x += this.dx;

    if (this.canJump && settings.autoJump) {
      this.autoJumpTimer++ 
      if(this.autoJumpTimer >= this.autoJumpDuration) {
        this.jump();
        this.autoJumpTimer = 0
      }
    }

    if (this.dy > 0.1) {
      this.canJump = false;
    }

    this.updateAnimation();
  }

  updateAnimation() {
    let newAnimation = "idle";

    if (this.isDead) {
      newAnimation = "dead";
    } else if (this.dy < -0.1) {
      newAnimation = "jump";
    } else if (this.dy > 0.9 && !this.canJump) {
      newAnimation = "fall";
    } else if (abs(this.dx) > 0.1) {
      newAnimation = "walk";
    }

    changeAnimation(this, newAnimation);

    if (this.dx > 0) {
      this.direction = 1;
    } else if (this.dx < 0) {
      this.direction = -1;
    }

    updateSpriteAnimation(this);
  }

  jump() {
    if (this.canJump) {
      const finalForce = this.powerSystem.getJumpForce(this.baseJumpForce);
      this.dy = -finalForce;
      this.canJump = false;
    }
  }

  die() {
    if (this.isDead) return;

    this.isDead = true;

    this.dy = -8;

    this.deathTimer = 0;

    this.frame = 0;
    this.frameTimer = 0;

    this.updateAnimation();

    failed_Sound.play();
  }

  boost(force) {
    this.dy = -force;
  }

  isOffScreen() {
    return this.y > height;
  }

  isColision(obj) {
    if (obj.width || obj.height) {
      return (
        this.x + this.width <= obj.x ||
        this.x >= obj.x + obj.width ||
        this.y + this.height <= obj.y ||
        this.y >= obj.y + obj.height
      );
    }

    let distance = dist(
      this.x + this.width / 2,
      this.y + this.height / 2,
      obj.x,
      obj.y,
    );
    return distance < this.width / 2 + obj.size / 2;
  }

  colisionWithEnemy(enemy) {
    if (enemy.isDying || this.isDead) {
      return;
    }

    if (this.isColision(enemy)) {
      let forceX =
        enemy.type == "flying" ? { min: -1, max: 1 } : { min: -2, max: 2 };
      let forceY =
        enemy.type == "flying" ? { min: -2, max: 10 } : { min: -1, max: 5 };
      let size = enemy.type == "flying" ? random(0.6, 0.8) : random(0.4, 0.7);

      let spacing = enemy.size * 0.8;
      let playerBottom = this.y + this.height;
      let enemyTop = enemy.y - enemy.size / 2;
      let isFalling = this.dy > 0;
      let isOnHead = playerBottom <= enemyTop + spacing;

      if (isOnHead && isFalling) {
        this.canJump = true;
        const bounceForce = ENEMY_BOUNCE;
        this.boost(bounceForce);

        enemy.isDying = true;
        enemy.frame = 0;
        enemy.frameTimer = 0;
        hitKillSound.play();
        numTotalEnemyDie++;
        addScore(enemy);

        createParticle(
          enemy.x + enemy.size,
          enemy.y + enemy.size,
          enemy.size,
          enemy.baseColor,
          forceX,
          forceY,
          enemy.size * size,
          enemy.size * size,
          "enemyDeath",
        );

        return;
      }

      if (this.powerSystem.effects.shieldActive) {
        this.powerSystem.effects.shieldActive = false;
        enemy.isDying = true;
        enemy.frame = 0;
        enemy.frameTimer = 0;
        hitKillSound.play();
        numTotalEnemyDie++;
        createParticle(
          enemy.x + enemy.size,
          enemy.y + enemy.size,
          enemy.size,
          enemy.baseColor,
          forceX,
          forceY,
          enemy.size * size,
          enemy.size * size,
        );

        return;
      }

      if (this.powerSystem.shouldDieOnCollision()) {
        this.die();
        monsterScream_Sound.play();
        enemy.isRoaring = true;
        enemy.roarTimer = 80;
      }
    }
  }

  colisionWithBlock(block) {
    if (this.isDead) {
      return;
    }

    if (!this.isColision(block)) {
      if (block.type === "moving") {
        this.x += block.dx;
      }

      if (block.type === "freeze") {
        if (!this.powerSystem.isDashing()) {
          this.dx += this.speed * 0.1;
          this.x += this.dx;
        }
      }

      if (this.dy > 1) {
        if (block.type === "normal") {
          plants_impactSound.play();
          colorParticleBlock = color(50, 20, 20);
        }
        if (block.type === "moving") {
          colorParticleBlock = color(4, 55, 242);
          groundMove_Sound.play();
        }
        if (block.type === "brittle") colorParticleBlock = color(128, 0, 0);
        if (block.type === "jump") colorParticleBlock = color(210, 4, 45);
        if (block.type === "freeze") {
          grassPress_Sound.play();
          colorParticleBlock = color(173, 216, 230);
        }

        let forceX = (player.dx + player.gravity) * random(0.6, 0.8);
        let forceY = (player.dy + player.gravity) * random(0.1, 0.4);

        createParticle(
          player.x + player.width / 2,
          player.y + player.height,
          random(6, 8),
          colorParticleBlock,
          { min: -forceX, max: forceX },
          { min: -forceY * 0.4, max: forceY },
          floor(random(10, 18)),
          floor(random(10, 20)),
          "dust",
        );
      }

      if (this.dy > 0) {
        if (block.type === "brittle") {
          if (!this.powerSystem.isDashing()) {
            brokeBlock(block);
            wood_surface.play();
          }
        }

        this.y = block.y - this.height;
        this.dy = 0;

        if (block.type !== "brittle" && block.type !== "jump") {
          this.canJump = true;
        } else {
          if (this.powerSystem.isDashing() && block.type !== "jump") {
            this.canJump = true;
          }
        }

        if (block.type === "jump") {
          this.boost(JUMP_PLATFORM_BOOST);
          jump_longSound.play();
        }
      }
    }
  }
}

function updatePlayer() {
  if (!player.hasGameOver) {
    player.show();
    player.update();
  }

  if (player.isOffScreen() && !player.isDead) {
    player.y = height - player.height;
    player.dy = 0;
    player.die();
    failed_Sound.play();
  }

  let target = height * 0.35;

  if (player.y < target) {
    let difference = target - player.y;

    player.y = target;

    for (let block of blocks) {
      block.y += difference;
    }

    for (let enemy of enemies) {
      enemy.y += difference;
      enemy.targetY += difference;
    }

    for (let coin of coins) {
      coin.y += difference;
    }

    for (let piece of pieces) {
      piece.y += difference;
    }
  }
}

function keyPressed() {
  let pressed = key.toLowerCase();

  if (pressed === "w" || pressed === "arrowup") {
    player.jump();

    if (player.canJump) {
      if (speed <= 5) {
        jump_cuteSound.play();
      } else {
        jump_longSound.play();
      }

      createParticle(
        player.x + player.width / 2,
        player.y + player.height,
        10,
        color(255, 255, 255),
        { min: -1, max: 1 },
        { min: 1, max: 2 },
        floor(random(5, 8)),
        floor(random(20, 30)),
        "jump",
      );
    }
  }
}

function initialPlayerPosition() {
  let LastBlock = blocks.reduce((maxBlock, currentBlock) => {
    return currentBlock.y > maxBlock.y ? currentBlock : maxBlock;
  }, blocks[0]);
  player.y = LastBlock.y - player.height - 10;
  player.x = LastBlock.x + LastBlock.width / 2 - player.width / 2;
}
