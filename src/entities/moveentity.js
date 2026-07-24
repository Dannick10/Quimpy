class MovingEntity extends Entity {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.9;
    this.angle = 0;
  }

  isColision(obj) {
    if (obj.collisionType === "circle") {
      let distance = dist(
        this.x + this.width / 2,
        this.y + this.height / 2,
        obj.x,
        obj.y,
      );

      return distance < this.width / 2 + obj.size / 2;
    }

    return !(
      this.x + this.width <= obj.x ||
      this.x >= obj.x + obj.width ||
      this.y + this.height <= obj.y ||
      this.y >= obj.y + obj.height
    );
  }

  boost(force) {
    this.dy = -force;
  }

  applyGravity(timeScale = 1) {
    this.dy += this.gravity * timeScale;
    this.dy = constrain(this.dy, -50, 30);
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;
  }
}
