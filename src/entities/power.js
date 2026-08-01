class PowerSystem {
  constructor() {
    this.activePowers = new Map();
    this.effects = {
      jumpBoost: 10,
      slowTimeFactor: 0.4,
      dashSpeed: 10,
      magnetRadius: 150,
      shieldActive: false,
      deltaForce: 0.1,
    };
    this.durations = {
      jump_boost: 30000,
      ghost: 30000,
      slow_time: 30000,
      dash: 30000,
      magnet: 30000,
      coin_2x: 30000,
      delta_force: 30000,
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

  isDeltaForceActive() {
    return this.isPowerActive("delta_force");
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
      this.drawJumpBoost(px, py, player.width, player.height);
    if (this.isGhostActive())
      this.drawGhost(px, py, player.width, player.height);
    if (this.effects.shieldActive)
      this.drawShield(px, py, player.width, player.height);
    if (this.isDashing())
      this.drawDash(px, py, player.x, player.width, player.height);
    if (this.isMagnetActive()) this.drawMagnet(px, py);
    if (this.isCoin2xActive()) this.drawCoin2x(px, py, player.height);
    if (this.isSlowTimeActive()) this.drawSlowTime(px, py);
    if (this.isDeltaForceActive()) this.drawDeltaForce(px, py);
  }

  drawJumpBoost(px, py, playerWidth, playerHeight) {
    push();
    let feetY = py + playerHeight / 2 + 2;

    noFill();
    stroke(255, 220, 80, 220);
    strokeWeight(2.5);
    beginShape();
    for (let i = 0; i < 12; i++) {
      let angle = frameCount * 0.2 + i * 0.5;
      let sx = px + sin(angle) * (12 - i * 0.8);
      let sy = feetY + i * 2.2;
      vertex(sx, sy);
    }
    endShape();

    noStroke();
    for (let i = 0; i < 4; i++) {
      let angle = frameCount * 0.08 + i * 1.5;
      let sx = px + cos(angle) * 28;
      let sy = feetY - 10 - ((frameCount * 1.5 + i * 15) % 40);
      let alpha = map(feetY - sy, 10, 50, 255, 0);

      fill(255, 235, 110, alpha);
      star(sx, sy, 6, 2.5, 5);
    }
    pop();
  }

  drawGhost(px, py, playerWidth, playerHeight) {
    push();
    noStroke();
    for (let i = 3; i > 0; i--) {
      fill(180, 240, 255, 40 / i);
      ellipse(px - i * 8, py, playerWidth + i * 12, playerHeight + i * 12);
    }
    fill(200, 255, 255, 50);
    ellipse(px, py, playerWidth * 1.5, playerHeight * 1.5);

    for (let i = 0; i < 5; i++) {
      let floatOffset = sin(frameCount * 0.06) * 4;
      let pulse = sin(frameCount * 0.1) * 4;
      let ghostY = py + floatOffset;
      let speed = 0.9 + (i % 3) * 0.2;
      let progress = (frameCount * speed + i * 18) % 100;

      let spreadAngle = -HALF_PI + sin(i * 1.4) * 0.65;
      let travelDist = map(progress, 0, 55, 8, 70);

      let mgX =
        px + cos(spreadAngle) * travelDist + sin(frameCount * 0.08 + i) * 6;
      let mgY = ghostY + sin(spreadAngle) * travelDist;

      let alpha = map(progress, 0, 55, 230, 0);
      let scaleFactor = map(progress, 0, 55, 0.5, 1.1);

      let gW = 20 * scaleFactor;
      let gH = 24 * scaleFactor;

      push();
      translate(mgX, mgY);
      rotate(sin(frameCount * 0.1 + i) * 0.25);
      noStroke();
      fill(100, 200, 255, alpha * 0.35);
      ellipse(0, 0, gW * 1.7, gH * 1.6);
      fill(225, 248, 255, alpha);
      arc(0, -gH * 0.15, gW, gH * 0.85, PI, TWO_PI);
      rect(-gW / 2, -gH * 0.15, gW, gH * 0.45);
      let waveW = gW / 3;
      for (let k = 0; k < 3; k++) {
        let xOffset = -gW / 2 + k * waveW + waveW / 2;
        arc(xOffset, gH * 0.3, waveW, 5 * scaleFactor, 0, PI);
      }
      pop();
    }
    pop();
  }

  drawShield(px, py, playerWidth, playerHeight) {
    push();
    let size = max(playerWidth, playerHeight) * 1.5 + sin(frameCount * 0.1) * 4;

    noStroke();
    fill(60, 220, 200, 30);
    ellipse(px, py, size * 1.25);
    fill(100, 255, 230, 20);
    ellipse(px, py, size * 1.45);

    fill(40, 180, 220, 50);
    stroke(120, 245, 255, 220);
    strokeWeight(2.5);
    ellipse(px, py, size);

    noFill();
    stroke(255, 255, 255, 180);
    strokeWeight(1.5);
    push();
    translate(px, py);
    rotate(frameCount * 0.03);
    arc(0, 0, size + 10, size + 10, 0, HALF_PI);
    arc(0, 0, size + 10, size + 10, PI, PI + HALF_PI);
    pop();

    stroke(255, 255, 255, 190);
    strokeWeight(2);
    noFill();
    arc(px, py, size * 0.85, size * 0.85, PI + QUARTER_PI, TWO_PI - QUARTER_PI);

    noStroke();
    for (let i = 0; i < 6; i++) {
      let angle = frameCount * 0.05 + i * (TWO_PI / 6);
      let sx = px + (cos(angle) * size) / 2;
      let sy = py + (sin(angle) * size) / 2;
      fill(200, 255, 255, 220);
      ellipse(sx, sy, 5, 5);
    }
    pop();
  }

  drawDash(px, py, playerX, playerWidth, playerHeight) {
    push();
    noStroke();
    if (player.dx > 0 || player.dx < 0) {
      for (let i = 1; i <= 5; i++) {
        let alpha = 140 - i * 25;
        fill(255, 210, 80, alpha);
        ellipse(
          playerX - i * 14,
          py,
          playerWidth * (1 - i * 0.12),
          playerHeight * 0.8,
        );
      }
    }
    stroke(255, 230, 120, 200);
    strokeWeight(2);
    noFill();
    let feetY = py + playerHeight / 2 - 4;
    for (let i = 0; i < 3; i++) {
      let waveW = 35 + sin(frameCount * 0.2 + i) * 12;
      let waveY = feetY - i * 8;
      arc(px - 5, waveY, waveW, 10, PI * 0.2, PI * 1.8);
    }

    stroke(255, 255, 255, 220);
    strokeWeight(1.5);
    for (let i = 0; i < 4; i++) {
      let lx = px + random(-25, 25);
      let ly = py + random(-playerHeight / 2, playerHeight / 2);
      line(lx, ly, lx - random(15, 30), ly);
    }

    noStroke();
    for (let i = 0; i < 6; i++) {
      let dx = px - ((frameCount * 6 + i * 18) % 70);
      let dy = feetY + sin(i + frameCount * 0.1) * 6;
      fill(255, 245, 180, map(px - dx, 0, 70, 255, 0));
      ellipse(dx, dy, random(3, 6), random(2, 4));
    }
    pop();
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

  drawDeltaForce(px, py) {
    let y = py - 38;
    let pulse = sin(frameCount * 0.15) * 2;
    let w = 54 + pulse;
    let h = 34 + pulse;

    push();

    noStroke();
    fill(140, 210, 255, 40);
    ellipse(px, y + 8, 75 + pulse * 2, 48 + pulse);
    fill(180, 235, 255, 20);
    ellipse(px, y + 8, 95 + pulse * 2, 60 + pulse);

    stroke(255);
    strokeWeight(2);
    fill(210, 245, 255);
    triangle(px - 3, y - h / 2 + 2, px + 3, y - h / 2 + 2, px, y - h / 2 - 6);

    stroke(255);
    strokeWeight(2);
    fill(60, 150, 230, 230);
    arc(px, y, w, h, PI, TWO_PI, CHORD);
    fill(100, 185, 255, 230);
    arc(px, y, w * 0.65, h, PI, TWO_PI, CHORD);

    fill(170, 225, 255, 240);
    arc(px, y, w * 0.32, h, PI, TWO_PI, CHORD);

    strokeWeight(1.5);
    for (let i = -2; i <= 2; i++) {
      if (i === 0) fill(170, 225, 255, 240);
      else if (Math.abs(i) === 1) fill(100, 185, 255, 230);
      else fill(60, 150, 230, 230);

      arc(px + i * 10, y, 10.5, 8, 0, PI, CHORD);
    }

    noFill();
    stroke(255, 255, 255, 160);
    strokeWeight(1.5);
    arc(px - 9, y, 18, h, PI + HALF_PI * 0.3, TWO_PI);
    arc(px + 9, y, 18, h, PI, TWO_PI - HALF_PI * 0.3);

    stroke(220, 240, 255);
    strokeWeight(3);
    line(px, y, px, y + 28);

    noFill();
    arc(px + 5, y + 28, 10, 10, 0, HALF_PI);

    fill(255);
    noStroke();
    ellipse(px + 10, y + 28, 3, 3);

    for (let i = 0; i < 6; i++) {
      let angle = frameCount * 0.06 + i * (TWO_PI / 6);
      let x = px + cos(angle) * 30;
      let yy = y - 8 + sin(angle * 2) * 7;

      fill(180, 245, 255, 210);
      ellipse(x, yy, 4, 7);
    }

    fill(255, 255, 255, 210);
    ellipse(px - 12, y - h / 4, 7, 7);
    ellipse(px + 10, y - h / 3, 4, 4);

    for (let i = 0; i < 5; i++) {
      let dx = sin(frameCount * 0.04 + i * 2) * 24;
      let dy = (frameCount * 1.3 + i * 12) % 38;
      let alpha = map(dy, 0, 38, 220, 0);

      fill(200, 240, 255, alpha);
      ellipse(px + dx, y + dy, 3, 6);
    }

    pop();
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
    case "delta_force":
      iconCircle("#00bbf9");
      stroke("#fff");
      strokeWeight(3);
      noFill();
      arc(0, -2, 34, 22, PI, TWO_PI);
      line(-17, -2, -12, 2);
      line(-12, 2, -6, -2);
      line(-6, -2, 0, 2);
      line(0, 2, 6, -2);
      line(6, -2, 12, 2);
      line(12, 2, 17, -2);
      line(0, -2, 0, 15);
      arc(4, 18, 8, 8, 0, HALF_PI);
      noStroke();
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
