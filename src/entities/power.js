class PowerSystem {
  constructor() {
    this.activePowers = new Map();
    this.effects = {
      jumpBoost: 10,
      slowTimeFactor: 0.4,
      dashSpeed: 10,
      magnetRadius: 150,
      shieldActive: false, 
    };
    this.durations = {
      jump_boost: 30000,
      ghost: 30000,
      slow_time: 30000,
      dash: 30000,
      magnet: 30000,
      coin_2x: 30000,
    };
  }
  activatePower(powerName) {
    if (powerName === "shield") {
      this.effects.shieldActive = true;
      return;
    }
    const duration = this.durations[powerName] || 30000;
    this.activePowers.set(powerName, millis() + duration);
  }

  isPowerActive(powerName) {
    if (powerName === "shield") return this.effects.shieldActive;
    if (!this.activePowers.has(powerName)) return false;
    return millis() < this.activePowers.get(powerName);
  }

  isGhostActive() {
    return this.isPowerActive("ghost");
  }

  isSlowTimeActive() {
    return this.isPowerActive("slow_time");
  }

  isDashing() {
    return this.isPowerActive("dash");
  }

  isMagnetActive() {
    return this.isPowerActive("magnet");
  }
  
  isCoin2xActive() {
    return this.isPowerActive("coin_2x");
  }

  shouldDieOnCollision() {
    return !this.effects.shieldActive && !this.isGhostActive();
  }

  getJumpForce(baseForce) {
    return (
      baseForce +
      (this.isPowerActive("jump_boost") ? this.effects.jumpBoost : 0)
    );
  }

  getTimeScale() {
    return this.isSlowTimeActive() ? this.effects.slowTimeFactor : 1;
  }

  getDashSpeed() {
    return this.effects.dashSpeed;
  }
  update() {
    const now = millis();
    for (let [power, expireTime] of this.activePowers.entries()) {
      if (now > expireTime) {
        this.activePowers.delete(power);
      }
    }
  }

  draw(player) {
    let px = player.x + player.width / 2;
    let py = player.y + player.height / 2;

    if (this.isPowerActive("jump_boost"))
      this.drawJumpBoost(px, py, player.width);
    if (this.isGhostActive())
      this.drawGhost(px, py, player.width, player.height);
    if (this.effects.shieldActive) this.drawShield(px, py, player.width);
    if (this.isDashing())
      this.drawDash(px, py, player.x, player.width, player.height);
    if (this.isMagnetActive()) this.drawMagnet(px, py);
    if (this.isCoin2xActive()) this.drawCoin2x(px, py, player.height);
    if (this.isSlowTimeActive()) this.drawSlowTime(px, py);
  }

  drawJumpBoost(px, py, playerWidth) {
    noStroke();
    let pulse = sin(frameCount * 0.15) * 8;
    fill(255, 220, 80, 60);
    ellipse(px, py + 20, playerWidth * 1.8 + pulse, 25);

    for (let i = 0; i < 3; i++) {
      let angle = frameCount * 0.05 + i * 2;
      let x = px + cos(angle) * 35;
      let y = py - abs(sin(angle)) * 35;
      fill(255, 240, 120);
      star(x, y, 7, 3, 5);
    }
  }

  drawGhost(px, py, playerWidth, playerHeight) {
    noStroke();
    for (let i = 3; i > 0; i--) {
      fill(180, 240, 255, 40 / i);
      ellipse(px - i * 8, py, playerWidth + i * 12, playerHeight + i * 12);
    }

    fill(200, 255, 255, 50);
    ellipse(px, py, playerWidth * 2, playerHeight * 2);

    for (let i = 0; i < 4; i++) {
      let x = px + sin(frameCount * 0.08 + i) * 25;
      let y = py + ((frameCount * 0.8 + i * 20) % 50) - 25;
      fill(220, 255, 255, 160);
      circle(x, y, random(3, 6));
    }
  }

  drawShield(px, py, playerWidth) {
    let size = playerWidth * 2.2 + sin(frameCount * 0.12) * 6;
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

  drawDash(px, py, playerX, playerWidth, playerHeight) {
    noStroke();
    for (let i = 0; i < 6; i++) {
      fill(255, 220, 80, 120 - i * 15);
      ellipse(playerX - i * 15, py, 35 + i * 8, 20);
    }

    fill(255, 240, 150, 80);
    ellipse(px, py, playerWidth * 2, playerHeight * 2);

    for (let i = 0; i < 5; i++) {
      fill(255);
      circle(px + random(-30, 30), py + random(-20, 20), random(2, 5));
    }
  }

  drawMagnet(px, py) {
    let pulse = sin(frameCount * 0.15) * 10;
    noFill();
    stroke(255, 220, 0, 100);
    strokeWeight(3);
    circle(px, py, 90 + pulse);

    noStroke();
    for (let i = 0; i < 3; i++) {
      let angle = frameCount * 0.05 + i * 2;
      fill(255, 230, 80, 180);
      circle(px + cos(angle) * 45, py + sin(angle) * 45, 6);
    }
  }

  drawCoin2x(px, py, playerHeight) {
    let y = py - playerHeight * 0.9 + sin(frameCount * 0.15) * 5;

    for (let i = 0; i < 2; i++) {
      let x = i === 0 ? px - 15 : px + 15;
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

  drawSlowTime(px, py) {
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

function drawHudPower() {
  let x = 20;
  let y = 70;
  let size = 30;
  let gap = 10;

  let active = Array.from(powerSystem.activePowers.keys());
  if (powerSystem.effects.shieldActive) {
    active.push("shield");
  }

  for (let i = 0; i < active.length; i++) {
    let power = active[i];
    let posX = x + i * (size + gap);

    fill(255, 255, 255, 200);
    stroke(0);
    strokeWeight(1);
    rect(posX, y, size, size, 5);

    push();
    translate(posX + size / 2, y + size / 2);
    scale(0.2);
    strokeWeight(8);
    drawPowerIcon(power);
    pop();
  }
}

function iconCircle(bgColor) {
  fill(bgColor);
  ellipse(0, 0, 58);
  fill(255, 255, 255, 120);
  ellipse(-12, -14, 18);
}

function drawPowerIcon(hability) {
  noStroke();

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
