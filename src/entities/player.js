class Player extends AnimatedEntity {
  constructor(x, y) {
    super(x, y, FRAME_W, FRAME_H);
    this.baseJumpForce = PLAYER_JUMP;
    this.speed = 5;
    this.isDead = false;
    this.canJump = true;
    this.powerSystem = powerSystem;
    this.customization = {
      skin: inventoryState?.selected?.skin || "default",
    };
    this.deathTimer = 0;
    this.deathDuration = 100;
    this.autoJumpTimer = 0;
    this.autoJumpDuration = 20;
    this.hasGameOver = false;
    this.updateAnimation();
  }

  show() {
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

    this.drawSprite(this.getSkinSprite(), FRAME_W, FRAME_H, row);
    this.powerSystem.draw(this);
  }

  getCustomizationSprite(category, itemId) {
    return getCustomizationAsset(category, itemId);
  }

  getSkinSprite(skin) {
    return this.getCustomizationSprite("skin", skin || this.customization.skin);
  }

  setCustomization(category, itemId) {
    if (!this.customization) return;
    this.customization[category] = itemId;
  }

  drawCustomizationPreview(x, y, size) {
    this.updateAnimation();
    push();
    translate(x, y);

    imageMode(CENTER);

    const previewScale = size / FRAME_W;

    scale(previewScale);

    image(
      this.getSkinSprite(),
      0,
      0,
      FRAME_W,
      FRAME_H,
      this.frame * FRAME_W,
      0,
      FRAME_W,
      FRAME_H,
    );

    imageMode(CORNER);

    pop();
  }

  handleInput(targetSpeed) {
    if (keyIsDown(68) || keyIsDown(39) || actionMobile.right) {
      this.dx = targetSpeed;
    } else if (keyIsDown(65) || keyIsDown(37) || actionMobile.left) {
      this.dx = -targetSpeed;
    } else {
      this.dx = 0;
    }
  }

  update() {
    if (this.isDead) {
      this.deathTimer++;
      this.dy += 0.5;
      this.y += this.dy;

      if (this.frame < this.maxFrames - 1) {
        this.updateSprite();
      }

      if (this.deathTimer > this.deathDuration) {
        this.hasGameOver = true;
      }

      return;
    }

    const timeScale = this.powerSystem.getTimeScale();
    this.applyGravity(timeScale);

    let targetSpeed = this.powerSystem.isDashing()
      ? this.powerSystem.getDashSpeed()
      : this.speed;

    this.handleInput(targetSpeed);

    if (this.x + this.width / 2 < 0) this.x = width - this.width;
    if (this.x + this.width / 2 > width) this.x = 0;

    this.move();

    if (this.canJump && settings.autoJump) {
      this.autoJumpTimer++;
      if (this.autoJumpTimer >= this.autoJumpDuration) {
        this.jump();
        this.autoJumpTimer = 0;
      }
    }

    if (this.dy > 0.1) {
      this.canJump = false;
    }

    if (this.powerSystem.isDeltaForceActive() && player.dy > 0) {
      this.gravity = this.powerSystem.effects.deltaForce;
    } else {
      this.gravity = 0.9; 
    }

    this.updateAnimation();
    this.powerSystem.update();
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

    this.setAnimation(newAnimation);
    this.updateDirection();
    this.updateSprite();
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

    playSound(failed_Sound);
  }

  colisionWithEnemy(enemy) {
    if (enemy.isDying || this.isDead) {
      return;
    }

    if (this.isColision(enemy)) {
      let spacing = enemy.size * 0.8;
      let playerBottom = this.y + this.height;
      let enemyTop = enemy.y - enemy.size / 2;
      let isFalling = this.dy > 0;
      let isOnHead = playerBottom <= enemyTop + spacing;

      if (isOnHead && isFalling) {
        this.canJump = true;
        const bounceForce = ENEMY_BOUNCE;
        this.boost(bounceForce);
        enemy.die();
        return;
      }

      if (this.powerSystem.isPowerActive("ghost")) return;

      if (this.powerSystem.effects.shieldActive) {
        this.powerSystem.effects.shieldActive = false;
        enemy.die();
        return;
      }

      if (this.powerSystem.shouldDieOnCollision()) {
        this.die();
        playSound(monsterScream_Sound);
        enemy.isRoaring = true;
        enemy.roarTimer = 80;
      }
    }
  }

  colisionWithBlock(block) {
    if (this.isDead) {
      return;
    }

    if (this.isColision(block)) {
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
        this.handleBlockImpact(block);
      }

      if (this.dy > 0) {
        if (block.type === "brittle") {
          if (!this.powerSystem.isDashing()) {
            brokeBlock(block);
            playSound(wood_surface);
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
          playSound(jump_longSound);
        }
      }
    }
  }

  handleBlockImpact(block) {
    let colorParticleBlock;

    if (block.type === "normal") {
      playSound(plants_impactSound);
      colorParticleBlock = color(50, 20, 20);
    } else if (block.type === "moving") {
      colorParticleBlock = color(4, 55, 242);
      playSound(groundMove_Sound);
    } else if (block.type === "brittle") {
      colorParticleBlock = color(128, 0, 0);
    } else if (block.type === "jump") {
      colorParticleBlock = color(210, 4, 45);
    } else if (block.type === "freeze") {
      playSound(grassPress_Sound);
      colorParticleBlock = color(173, 216, 230);
    }

    let forceX = (this.dx + this.gravity) * random(0.6, 0.8);
    let forceY = (this.dy + this.gravity) * random(0.1, 0.4);

    createParticle(
      this.x + this.width / 2,
      this.y + this.height,
      random(6, 8),
      colorParticleBlock,
      { min: -forceX, max: forceX },
      { min: -forceY * 0.4, max: forceY },
      floor(random(10, 18)),
      floor(random(10, 20)),
      "dust",
    );
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
    playSound(failed_Sound);
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
        playSound(jump_cuteSound);
      } else {
        playSound(jump_longSound);
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
