function drawMobileButtons() {
  if (settings.mobileControl !== "buttons") return;

  textAlign(CENTER, CENTER);
  textSize(35);

  drawControlButton(80, height - 100, "←");
  drawControlButton(200, height - 100, "→");
  drawControlButton(140, height - 180, "↑");
}

function drawControlButton(x, y, symbol) {
  noStroke();

  fill(25, 15, 10, 140);
  circle(x + 4, y + 5, 72);

  fill(75, 45, 20);
  circle(x, y, 70);

  fill(240, 185, 75);
  circle(x, y - 2, 60);

  fill(255, 235, 170, 60);
  arc(x, y - 10, 48, 24, PI, TWO_PI);

  fill(60, 35, 10);
  text(symbol, x, y - 1);
}

function drawMenu() {
  background(15, 25, 45);
  image(backgroundQuimpy, 0, 0, width, height);

  for (let btn of getMenuButtons()) {
    drawButton(btn.text, btn.x, btn.y);
  }
}

function drawButton(texto, x, y) {
  const w = 330;
  const h = 68;

  rectMode(CENTER);

  let hover =
    mouseX > x - w / 2 &&
    mouseX < x + w / 2 &&
    mouseY > y - h / 2 &&
    mouseY < y + h / 2;

  let offset = hover && mouseIsPressed ? 2 : 0;

  noStroke();
  fill(35, 20, 15, 180);
  rect(x + 5, y + 6, w, h, 10);

  strokeWeight(4);
  stroke(55, 35, 20);
  fill(90, 55, 25);
  rect(x, y + offset, w, h, 10);

  noStroke();
  fill(hover ? color(255, 210, 90) : color(240, 180, 70));
  rect(x, y - 4 + offset, w - 8, h - 10, 8);

  fill(255, 240, 170, 80);
  rect(x, y - 16 + offset, w - 20, 12, 5);

  fill(60, 30, 10);
  textAlign(CENTER, CENTER);
  textSize(26);
  textStyle(BOLD);
  text(texto, x, y + offset - 1);

  rectMode(CORNER);
}

function scoreUpdate() {
  textSize(32);
  fill(255);
  stroke(0);
  strokeWeight(4);
  text(score, width / 2, 35);
}

const gameOverUI = {
  x: 0,
  y: 0,
  speed: 2,
  direction: 1,
  frame: 0,
  timer: 0,
  frameSpeed: 10,
  maxFrames: 4,
  active: false,

  update(boxX, boxY, boxW) {
    if (!this.active) return;

    this.x += this.speed * this.direction;

    if (this.x > boxW / 2 - 30 || this.x < -boxW / 2 + 30) {
      this.direction *= -1;
    }

    this.timer++;

    if (this.timer >= this.frameSpeed) {
      this.frame++;
      this.timer = 0;

      if (this.frame >= this.maxFrames) {
        this.frame = 0;
      }
    }
  },

  draw(centerX, centerY, boxW) {
    this.update(centerX, centerY, boxW);

    push();
    translate(centerX + this.x, centerY);

    if (this.direction === -1) {
      scale(-1, 1);
    }

    image(
    player.getSkinSprite(player.customization.skin),
      -25,
      -25,
      80,
      80,
      this.frame * FRAME_W,
      1 * FRAME_H,
      FRAME_W,
      FRAME_H,
    );
    pop();
  },
};

function gameOver() {
  if (!player.hasGameOver) return;

  gameOverUI.active = true;

  fill(0, 180);
  rect(0, 0, width, height);

  rectMode(CENTER);

  noStroke();

  for (let i = 0; i < 8; i++) {
    fill(255, 215, 120, 8);
    ellipse(width / 2, height / 2, 560 - i * 40);
  }

  fill(20, 12, 8, 170);
  rect(width / 2 + 8, height / 2, 450, 520, 18);

  fill(75, 45, 20);
  rect(width / 2, height / 2, 440, 520, 18);

  fill(120, 80, 40);
  rect(width / 2, height / 2, 425, 490, 15);

  fill(255, 225, 150, 40);
  rect(width / 2, height / 2 - 175, 410, 32, 10);

  stroke(60, 35, 15);
  strokeWeight(5);
  fill(255, 215, 90);
  textAlign(CENTER, CENTER);
  textSize(48);
  textStyle(BOLD);
  text("FIM DE JOGO", width / 2, height / 2 - 185);
  noStroke();

  gameOverUI.draw(width / 2, height / 2 - 250, 440);

  let startY = height / 2 - 110;
  let spacing = 45;

  const stats = [
    { label: "Pontuação Total", value: score, color: [255, 185, 60] },
    { label: "Peixes Coletados", value: money, color: [255, 220, 70] },
    {
      label: "Plataformas Puladas",
      value: numTotalPlataform,
      color: [120, 255, 150],
    },
    {
      label: "Inimigos Mortos",
      value: numTotalEnemyDie,
      color: [255, 120, 120],
    },
    {
      label: "Cartas Coletadas",
      value: numTotalCardsCollect,
      color: [120, 190, 255],
    },
  ];

  for (let i = 0; i < stats.length; i++) {
    fill(245, 225, 180);
    textAlign(LEFT, CENTER);
    textSize(18);
    text(stats[i].label, width / 2 - 150, startY + i * spacing);

    fill(stats[i].color);
    textAlign(RIGHT, CENTER);
    textSize(22);
    text(stats[i].value, width / 2 + 150, startY + i * spacing);
  }

  for (let btn of getGameOverButtons()) {
    drawButton(btn.text, btn.x, btn.y);
  }

  rectMode(CORNER);
}

function drawSettings() {
  background(15, 20, 35);
  image(backgroundQuimpy, 0, 0, width, height);

  for (let btn of getSettingsButtons()) {
    drawButton(btn.text, btn.x, btn.y);
  }
}

function drawInventary() {
  const scaleI = getInventoryScale();

  background(15, 25, 45);

  if (typeof backgroundQuimpy !== "undefined" && backgroundQuimpy) {
    image(backgroundQuimpy, 0, 0, width, height);
  }

  push();

  translate(width / 2, height / 2);

  scale(scaleI);

  rectMode(CENTER);
  noStroke();

  fill(20, 12, 8, 170);
  rect(8, -20, 520, 480, 18);

  fill(75, 45, 20);
  rect(0, -20, 510, 480, 18);

  fill(120, 80, 40);
  rect(0, -20, 495, 455, 15);

  fill(255, 225, 150, 40);
  rectMode(CORNER);

  drawInventoryTabs();
  drawInventoryOptions();
  drawInventoryPreview();

  pop();

  for (let btn of getInventoryButtons()) {
    drawButton(btn.text, btn.x, btn.y);
  }
}

function drawInventoryTabs() {
  const tabX = -235;
  const tabY = -230;
  const tabW = 150;
  const tabH = 40;

  for (let i = 0; i < inventoryState.categories.length; i++) {
    const category = inventoryState.categories[i];

    const isActive = inventoryState.categoryIndex === i;

    const x = tabX + i * (tabW + 10);

    fill(isActive ? color(255, 210, 90) : color(75, 45, 20));

    stroke(55, 35, 20);
    strokeWeight(2);

    rect(x, tabY, tabW, tabH, 8);

    noStroke();

    fill(isActive ? 60 : 240);

    textSize(16);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);

    text(category, x + tabW / 2, tabY + tabH / 2);
  }
}

function drawInventoryOptions() {
  const items = getInventoryPageItems();
  const layout = getInventoryGridLayout();

  textSize(14);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const pos = getInventoryItemPosition(i);

    const x = pos.x;
    const y = pos.y;

    const isSelected =
      inventoryState.selected[getInventoryCategory().toLowerCase()] === item.id;

    stroke(isSelected ? color(255, 215, 90) : color(60, 35, 15));

    strokeWeight(isSelected ? 3 : 2);

    fill(90, 55, 25, 230);

    rect(x, y, layout.cardW / 2, layout.cardH, 10);

    noStroke();

    push();

    translate(x + 30, y + layout.cardH / 2);

    fill(40, 25, 10);
    circle(0, 0, 42);

    const category = getInventoryCategory().toLowerCase();
    const customizationImage = player.getCustomizationSprite(category, item.id);

    if (customizationImage) {
      image(
        customizationImage,
        -FRAME_W / 2,
        -FRAME_H / 2,
        FRAME_W,
        FRAME_H,
        0,
        0,
        FRAME_W,
        FRAME_H,
      );
    }

    pop();

    fill(255, 240, 190);

    textSize(15);
    textStyle(BOLD);

    text(item.label, x + 60, y + 14);

    textSize(12);
    textStyle(NORMAL);

    if (isSelected) {
      fill(255, 220, 100);

      text("★ Selecionado", x + 60, y + 36);
    } else {
      fill(200, 180, 150);

      text("Clique para usar", x + 60, y + 36);
    }
  }

  drawInventoryPagination();
}

function drawInventoryPagination() {
  const pageY = 155;
  const pageX = -235;

  const buttonW = 100;
  const buttonH = 35;

  stroke(55, 35, 20);
  strokeWeight(2);

  fill(90, 55, 25);

  rect(pageX, pageY, buttonW, buttonH, 8);

  rect(pageX + buttonW + 15, pageY, buttonW, buttonH, 8);

  noStroke();

  fill(255, 240, 170);

  textSize(13);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);

  text("ANTERIOR", pageX + buttonW / 2, pageY + buttonH / 2);

  text("PRÓXIMO", pageX + buttonW + 15 + buttonW / 2, pageY + buttonH / 2);

  textSize(14);
  textAlign(LEFT, CENTER);

  fill(255, 220, 150);

  const category = getInventoryCategory();

  const totalItems = inventoryState.items[category].length;

  const totalPages = max(1, ceil(totalItems / inventoryState.perPage));

  text(
    `Página ${inventoryState.page + 1} / ${totalPages}`,

    pageX + buttonW * 2 + 30,

    pageY + buttonH / 2,
  );
}

function drawInventoryPreview() {
  const previewX = 120;
  const previewY = -50;
  const previewSize = 160;

  stroke(60, 35, 15);
  strokeWeight(2);

  fill(50, 30, 12, 240);

  rect(
    previewX - previewSize / 2 - 15,
    previewY - previewSize / 2 - 25,
    previewSize + 30,
    previewSize + 55,
    12,
  );

  noStroke();

  if (player) {
    push();
    translate(previewX, previewY);
    player.drawCustomizationPreview(0, 20, previewSize);
    pop();
  }
}
