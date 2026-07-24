class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw() {}

  update() {}

  isOffScreen() {
    return this.y > height;
  }
}