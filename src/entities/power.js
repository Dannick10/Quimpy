class PowerSystem {
  constructor() {
    this.activePowers = new Set();
    this.timers = {};
    this.effects = {
      jumpBoost: 10,
      jumpBoostDuration: 30000,
      ghostDuration: 30000,
      slowTimeFactor: 0.4,
      slowTimeDuration: 30000,
      shieldActive: false,
      dashSpeed: 10,
      dashDuration: 30000,
      magnetDuration: 30000,
      magnetRadius: 150,
      coin2xDuration: 30000,
    };
  }

  activatePower(powerName) {
    this.activePowers.add(powerName);
    switch (powerName) {
      case "jump_boost":
        this.timers.jumpBoost = millis() + this.effects.jumpBoostDuration;
        break;
      case "ghost":
        this.timers.ghost = millis() + this.effects.ghostDuration;
        break;
      case "slow_time":
        this.timers.slowTime = millis() + this.effects.slowTimeDuration;
        break;
      case "shield":
        this.effects.shieldActive = true;
        break;
      case "dash":
        this.timers.dash = millis() + this.effects.dashDuration;
        break;
      case "magnet":
        this.timers.magnet = millis() + this.effects.magnetDuration;
        break;
      case "coin_2x":
        this.timers.coin2x = millis() + this.effects.coin2xDuration;
        break;
    }
  }

  isGhostActive() {
    return (
      this.activePowers.has("ghost") &&
      (!this.timers.ghost || millis() < this.timers.ghost)
    );
  }

  shouldDieOnCollision() {
    return !this.effects.shieldActive && !this.isGhostActive();
  }

  getJumpForce(baseForce) {
    return (
      baseForce +
      (this.activePowers.has("jump_boost") ? this.effects.jumpBoost : 0)
    );
  }

  isSlowTimeActive() {
    return (
      this.activePowers.has("slow_time") &&
      (!this.timers.slowTime || millis() < this.timers.slowTime)
    );
  }

  getTimeScale() {
    return this.isSlowTimeActive() ? this.effects.slowTimeFactor : 1;
  }

  isDashing() {
    return (
      this.activePowers.has("dash") &&
      (!this.timers.dash || millis() < this.timers.dash)
    );
  }

  getDashSpeed() {
    return this.effects.dashSpeed;
  }

  isMagnetActive() {
    return (
      this.activePowers.has("magnet") &&
      (!this.timers.magnet || millis() < this.timers.magnet)
    );
  }

  isCoin2xActive() {
    return (
      this.activePowers.has("coin_2x") &&
      (!this.timers.coin2x || millis() < this.timers.coin2x)
    );
  }

  update() {
    const now = millis();

    if (this.timers.jumpBoost && now > this.timers.jumpBoost) {
      this.activePowers.delete("jump_boost");
      delete this.timers.jumpBoost;
    }

    if (this.timers.ghost && now > this.timers.ghost) {
      this.activePowers.delete("ghost");
      delete this.timers.ghost;
    }

    if (this.timers.slowTime && now > this.timers.slowTime) {
      this.activePowers.delete("slow_time");
      delete this.timers.slowTime;
    }

    if (this.timers.dash && now > this.timers.dash) {
      this.activePowers.delete("dash");
      delete this.timers.dash;
    }

    if (this.timers.magnet && now > this.timers.magnet) {
      this.activePowers.delete("magnet");
      delete this.timers.magnet;
    }

    if (this.timers.coin2x && now > this.timers.coin2x) {
      this.activePowers.delete("coin_2x");
      delete this.timers.coin2x;
    }
  }
}

function drawHudPower() {
  let x = 20;
  let y = 70;
  let size = 30;
  let gap = 10;

  let active = [];
  if (powerSystem.activePowers.has("jump_boost")) active.push("jump_boost");
  if (powerSystem.activePowers.has("ghost")) active.push("ghost");
  if (powerSystem.activePowers.has("slow_time")) active.push("slow_time");
  if (powerSystem.effects.shieldActive) active.push("shield");
  if (powerSystem.activePowers.has("dash")) active.push("dash");
  if (powerSystem.isMagnetActive()) active.push("magnet");
  if (powerSystem.isCoin2xActive()) active.push("coin_2x");

  for (let i = 0; i < active.length; i++) {
    let power = active[i];

    fill(255, 255, 255, 200);
    stroke(0);
    strokeWeight(1);
    rect(x + i * (size + gap), y, size, size, 5);

    push();
    translate(x + i * (size + gap) + size / 2, y + size / 2);
    scale(0.2);
    strokeWeight(8);
    drawPowerIcon(power);
    pop();
  }
}

function drawPowerIcon(hability) {
  noStroke();

  function iconCircle(color) {
    fill(color);
    ellipse(0, 0, 58);
    fill(255, 255, 255, 120);
    ellipse(-12, -14, 18);
  }

  switch (hability) {
    case "jump_boost":
      iconCircle("#ffb703");

      fill("#fff");
      ellipse(0, 8, 32, 24);

      ellipse(-10, -16, 10, 24);
      ellipse(10, -16, 10, 24);

      fill("#333");
      ellipse(-7, 5, 5, 7);
      ellipse(7, 5, 5, 7);

      break;

    case "ghost":
      iconCircle("#9b5de5");

      fill("#fff");

      ellipse(0, 0, 35, 40);
      rect(-17, 0, 34, 18, 10);

      fill("#333");

      ellipse(-8, -5, 6, 8);
      ellipse(8, -5, 6, 8);

      fill("#fff");

      ellipse(-8, -3, 2, 3);
      ellipse(8, -3, 2, 3);

      break;

    case "slow_time":
      iconCircle("#00bbf9");

      fill("#fff");
      ellipse(0, 0, 35);

      stroke("#333");
      strokeWeight(3);

      line(0, 0, 0, -12);
      line(0, 0, 10, 7);

      noStroke();

      break;

    case "shield":
      iconCircle("#43aa8b");

      fill("#fff");

      beginShape();

      vertex(-18, -14);
      vertex(18, -14);
      vertex(14, 15);
      vertex(0, 28);
      vertex(-14, 15);

      endShape(CLOSE);

      fill("#43aa8b");

      ellipse(0, 0, 12);

      break;

    case "shockwave":
      iconCircle("#f94144");

      noFill();
      stroke("#fff");
      strokeWeight(3);

      ellipse(0, 0, 18);
      ellipse(0, 0, 32);
      ellipse(0, 0, 46);

      noStroke();

      break;

    case "wall_climb":
      iconCircle("#577590");

      fill("#fff");

      rect(-12, -15, 6, 30, 3);
      rect(-2, -22, 6, 38, 3);
      rect(8, -12, 6, 27, 3);

      break;

    case "dash":
      iconCircle("#f9c74f");

      fill("#fff");

      triangle(-18, 0, 10, -15, 0, 0);

      triangle(0, 0, 25, -10, 10, 10);

      break;

    case "magnet":
      iconCircle("#f94144");

      fill("#fff");

      arc(0, 5, 35, 35, PI, TWO_PI);

      fill("#577590");

      rect(-20, -5, 10, 15, 3);
      rect(10, -5, 10, 15, 3);

      break;

    case "coin_2x":
      iconCircle("#ffd166");

      fill("#fff");

      ellipse(-8, 4, 25);
      ellipse(8, -4, 25);

      fill("#f4a261");

      textAlign(CENTER, CENTER);
      textSize(13);
      textStyle(BOLD);

      text("2X", 0, 25);

      break;
  }
}


function star(x, y, radius1, radius2, points) {
  let angle = TWO_PI / points;
  let halfAngle = angle / 2;

  beginShape();

  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius1;
    let sy = y + sin(a) * radius1;
    vertex(sx, sy);

    sx = x + cos(a + halfAngle) * radius2;
    sy = y + sin(a + halfAngle) * radius2;
    vertex(sx, sy);
  }

  endShape(CLOSE);
}