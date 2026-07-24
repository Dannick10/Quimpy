class AnimatedEntity extends MovingEntity {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.frame = 0;
    this.frameTimer = 0;
    this.frameSpeed = 10;
    this.maxFrames = 4;
    this.animation = "idle";
    this.direction = 1;
  }

  setAnimation(name) {
    changeAnimation(this, name);
  }

  updateSprite() {
    updateSpriteAnimation(this);
  }

  updateDirection() {
    if (this.dx > 0) this.direction = 1;
    else if (this.dx < 0) this.direction = -1;
  }

  drawSprite(spriteSheet, frameW, frameH, row, mode) {
    push();

    if (this.collisionType === "circle") {
      translate(this.x, this.y);
    } else {
      translate(this.x + this.width / 2, this.y + this.height / 2);
    }

    if (this.direction === -1 &&  this.collisionType !== "circle") {
      scale(-1, 1);
    }

    rotate(this.angle);

    image(
      spriteSheet,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      this.frame * frameW,
      row * frameH,
      frameW,
      frameH,
    );
    pop();
  }
}
