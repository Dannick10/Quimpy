class Particle {
  constructor(x, y, size, color, randomX, randomY, life, effect) {
    this.x = x;
    this.y = y;
    this.startSize = size;
    this.size = size;
    this.color = color;
    this.dx = random(randomX.min, randomX.max);
    this.dy = random(randomY.min, randomY.max);
    this.life = life ?? 35;
    this.maxLife = this.life;
    this.gravity = random(0.01, 0.04);
    this.floatForce = random(-0.02, 0.02);
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(-0.04, 0.04);
    this.effect = effect ?? "normal";
    this.type = this.getParticleType();
    this.time = random(1000);
  }

  getParticleType() {
    if (this.effect === "jump") {
      return random(["fur", "star", "bubble", "fur"]);
    }

    if (this.effect === "enemyDeath") {
      return random(["heart", "star", "fur"]);
    }

    if (this.effect === "dust") {
      return random(["fur", "star", "bubble",]);
    }

    return random(["fur", "star", "bubble", "fur", "heart"]);
  }

  show() {
    push();

    translate(this.x, this.y);

    rotate(this.rotation);

    let progress = this.life / this.maxLife;

    let scalePop = sin((1 - progress) * PI);

    let alpha = map(progress, 0, 1, 0, 255);

    let c = color(this.color);

    c.setAlpha(alpha);

    fill(c);

    noStroke();

   let currentSize = this.startSize * (0.25 + scalePop * 0.15);

    if (this.type === "bubble") {
      circle(0, 0, currentSize);
    }

    if (this.type === "fur") {
      ellipse(0, 0, currentSize, currentSize * 0.7);
    }

    if (this.type === "star") {
      beginShape();

      for (let i = 0; i < 10; i++) {
        let radius = i % 2 === 0 ? currentSize : currentSize * 0.45;

        let angle = (i * PI) / 5;

        vertex(cos(angle) * radius, sin(angle) * radius);
      }

      endShape(CLOSE);
    }

    if (this.type === "heart") {
      beginShape();

      vertex(0, currentSize * 0.7);

      bezierVertex(
        -currentSize,
        -currentSize * 0.1,
        -currentSize * 0.6,
        -currentSize,
        0,
        -currentSize * 0.4,
      );

      bezierVertex(
        currentSize * 0.6,
        -currentSize,
        currentSize,
        -currentSize * 0.1,
        0,
        currentSize * 0.7,
      );

      endShape(CLOSE);
    }

    pop();
  }

  update() {
    this.life--;

    this.x += this.dx;
    this.y += this.dy;

    this.dy += this.gravity;
    this.dy += sin(frameCount * 0.08 + this.time) * this.floatForce;

    this.dx *= 0.97;

    this.rotation += this.rotationSpeed;
  }

  isDead() {
    return this.life <= 0;
  }
}

function createParticle(
  x,
  y,
  size,
  color,
  randomX,
  randomY,
  quantity,
  life,
  effect,
) {
  for (let i = 0; i < quantity; i++) {
    particles.push(
      new Particle(x, y, size, color, randomX, randomY, life, effect),
    );
  }
}

function updateParticle() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let particle = particles[i];

    particle.update();

    particle.show();

    if (typeof player !== "undefined" && player && player.dy > 0) {
      particle.y += speed * 0.2;
    }

    if (particle.isDead()) {
      particles.splice(i, 1);
    }
  }
}
