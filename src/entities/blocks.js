class Block extends MovingEntity {
  constructor(x, y, type) {
    super(x, y);
    this.type = type;
    this.dx = random(-1, 1);
    this.width = 80;
    this.height = 5;
  }
}

class NormalBlock extends Block {
  constructor(x, y, type) {
    super(x, y, type);
  }

  show() {
    fill(40, 100, 20, 120);
    rect(this.x + 2, this.y + 2, this.width, this.height, 20);

    fill(80, 200, 40);
    rect(this.x, this.y, this.width, this.height, 20);

    fill(120, 240, 80);
    rect(this.x, this.y - 2, this.width, 4, 20);

    fill(50, 180, 30);
    rect(
      this.x,
      this.y + this.height - this.height * 2 * 0.8,
      this.width,
      this.height,
      20,
    );
    fill(60, 180, 30);

    for (let i = 6; i < this.width; i += 12) {
      triangle(
        this.x + i,
        this.y,
        this.x + i + 3,
        this.y - 5,
        this.x + i + 6,
        this.y,
      );
    }
  }
}

class MovingBlock extends Block {
  constructor(x, y, type) {
    super(x, y, type);
  }

  show() {
    fill(93, 63, 211);
    rect(this.x, this.y, this.width, this.height, 20);

    fill(140, 100, 255);
    rect(this.x, this.y - 2, this.width, 4, 20);

    fill(25, 25, 112);
    rect(
      this.x,
      this.y + this.height - this.height * 2 * 0.8,
      this.width,
      this.height,
    );

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text("◄ ►", this.x + this.width / 2, this.y + this.height / 2);
  }

  update() {
    if (this.type === "moving") {
      if (this.colisionWithWall()) {
        this.dx *= -1;
      }

      this.x += this.dx;
    }
  }

  colisionWithWall() {
    return this.x + this.width >= width || this.x <= 0;
  }
}

class JumpBlock extends Block {
  constructor(x, y, type) {
    super(x, y, type);
  }

  show() {
    fill(255, 70, 70);
    rect(this.x, this.y, this.width, this.height, 20);

    fill(255, 40, 40);
    rect(
      this.x,
      this.y + this.height - this.height * 2 * 0.8,
      this.width,
      this.height,
    );

    stroke(255);
    strokeWeight(2);

    for (let i = 0; i < 5; i++) {
      line(this.x + 15 + i * 10, this.y + 2, this.x + 20 + i * 10, this.y + 8);

      line(this.x + 20 + i * 10, this.y + 8, this.x + 25 + i * 10, this.y + 2);
    }

    noStroke();
  }
}

class BrittleBlock extends Block {
  constructor(x, y, type) {
    super(x, y, type);
  }

  show() {
    let sizeBrittle = 4;

    fill(165, 42, 42);
    rect(this.x, this.y, this.width, this.height, 20);

    fill(128, 0, 32);
    rect(
      this.x,
      this.y + this.height - this.height * 2 * 0.8,
      this.width,
      this.height,
    );

    fill(233, 116, 81);
    rect(
      this.x + this.width / 2 - sizeBrittle / 2,
      this.y - sizeBrittle,
      sizeBrittle,
      this.height + sizeBrittle,
      20,
    );

    stroke(70);

    line(this.x + 15, this.y, this.x + 25, this.y + 8);
    line(this.x + 25, this.y + 8, this.x + 18, this.y + 10);

    line(this.x + 40, this.y, this.x + 48, this.y + 7);
    line(this.x + 48, this.y + 7, this.x + 55, this.y + 2);

    noStroke();
  }
}

class FreezeBlock extends Block {
  constructor(x, y, type) {
    super(x, y, type);
  }

  show() {
    fill(0, 71, 171);
    rect(this.x, this.y, this.width, this.height, 20);

    fill(120, 220, 255);
    rect(this.x, this.y - 2, this.width, 4, 20);

    fill(0, 149, 237);
    rect(
      this.x,
      this.y + this.height - this.height * 2 * 0.8,
      this.width,
      this.height,
    );

    fill(255, 180);
    circle(this.x + 12, this.y + 3, 3);
    circle(this.x + 40, this.y + 5, 2);
    circle(this.x + 60, this.y + 2, 4);
  }
}

function createInitialBlock() {
  numBlocks = constrain(numBlocks, 4, maxPlataformRate);
  lastBlockX = random(50, width - 120);

  let y = height - 50;

  for (let i = 0; i < numBlocks; i++) {
    if (i !== 0) {
      let distance;

      if (random() < 0.7) {
        distance = random(70, 110);
      } else {
        distance = random(120, 170);
      }

      let direction = random() < 0.5 ? -1 : 1;

      lastBlockX += direction * distance;
      lastBlockX = constrain(lastBlockX, 30, width - 100);

      y -= random(80, 120);
    }

    blocks.push(createTypeBlock(lastBlockX, y, "normal"));
  }
}

function generateBlocksByPlayer() {
  let highestBlock = blocks[0];

  for (let block of blocks) {
    if (block.y < highestBlock.y) {
      highestBlock = block;
    }
  }

  let distance = player.y - highestBlock.y;

  if (distance < height * 0.5) {
    createNewBlock();
  }
}

function updateBlock() {
  for (let i = 0; i < blocks.length; i++) {
    blocks[i].show();
    blocks[i].update();
    player.colisionWithBlock(blocks[i]);

    if (player.dy < 0) {
      blocks[i].y += cameraSpeed;
    }
  }

  blocks = blocks.filter((item) => {
    if (item.isOffScreen()) {
      addScore(item);
      numTotalPlataform++;
    }

    return !item.isOffScreen();
  });

  generateBlocksByPlayer();
}

function brokeBlock(block) {
  let middle = block.width / 2;

  pieces.push({
    x: block.x,
    y: block.y,
    width: middle,
    height: block.height,
    type: block.type,
    dy: random(1, 3),
    angle: 0,
    dAngle: random(-0.1, 0.1),
    alpha: 255,
  });

  pieces.push({
    x: block.x + middle,
    y: block.y,
    width: middle,
    height: block.height,
    type: block.type,
    dy: random(1, 3),
    angle: 0,
    dAngle: random(-0.1, 0.1),
    alpha: 255,
  });

  blocks = blocks.filter((b) => b !== block);
}

function updatePieces() {
  for (let i = 0; i < pieces.length; i++) {
    let p = pieces[i];

    p.y += p.dy;
    p.angle += p.dAngle;
    p.alpha -= 5;
    if (p.alpha < 0) p.alpha = 0;
    let colorBlock =
      p.type === "freeze" ? color(167, 199, 231) : color(131, 67, 51, 0.2);
    let sizeParticle = p.type === "freeze" ? 3 : 2;
    let effectX =
      p.type === "freeze" ? { min: -2, max: 2 } : { min: -1, max: 1 };
    let effectY =
      p.type === "freeze" ? { min: -3, max: 2 } : { min: -3, max: 1 };

    if (p.alpha > 0) {
      createParticle(
        p.x + p.width / 2,
        p.y + p.height,
        random(((p.width + p.height) / sizeParticle) % p.alpha),
        colorBlock,
        effectX,
        effectY,
        2,
        (p.width + p.height) % p.alpha,
      );
    }

    push();
    translate(p.x + p.width / 2, p.y + p.height / 2);
    rotate(p.angle);

    fill(100, p.alpha);
    rect(-p.width / 2, -p.height / 2, p.width, p.height);
    pop();
  }

  pieces = pieces.filter((p) => p.y <= height);
}

function middleOfScreen(block) {
  if (!block) return;
  if (player.y <= height / 2) {
    block.y += speed * 0.1;
  }
}

function createNewBlock() {
  let distance;

  if (random() < 0.7) {
    distance = random(70, 110);
  } else {
    distance = random(110, 160);
  }

  let direction = random() < 0.5 ? -1 : 1;

  let x = lastBlockX + direction * distance;

  x = constrain(x, 30, width - 100);

  lastBlockX = x;

  let highestY = blocks[0].y;

  for (let block of blocks) {
    if (block.y < highestY) {
      highestY = block.y;
    }
  }

  let y = highestY - random(70, 120);

  let chance = random();

  let jumpChance = 0.08;
  let movingChance = 0.16;
  let brittleChance = 0.24;
  let freezeChance = 0.32;

  if (score > 10000) {
    jumpChance = 0.1;
    movingChance = 0.22;
    brittleChance = 0.34;
    freezeChance = 0.46;
  }

  if (score > 20000) {
    jumpChance = 0.12;
    movingChance = 0.28;
    brittleChance = 0.44;
    freezeChance = 0.6;
  }

  if (score > 30000) {
    jumpChance = 0.15;
    movingChance = 0.35;
    brittleChance = 0.55;
    freezeChance = 0.75;
  }

  let type = "normal";

  if (chance < jumpChance) {
    type = "jump";
  } else if (chance < movingChance) {
    type = "moving";
  } else if (chance < brittleChance) {
    type = "brittle";
  } else if (chance < freezeChance) {
    type = "freeze";
  }

  if (type !== "normal" && lastBlockType !== "normal") {
    type = "normal";
  }

  lastBlockType = type;

  if (random() < 0.2) {
    createCoin(x + random(-10, 10), y - 20);
  }

  blocks.push(createTypeBlock(lastBlockX, y, type));

  createEnemies(type, x);
}

function createTypeBlock(x, y, type) {
  switch (type) {
    case "normal":
      return new NormalBlock(x, y, type);

    case "moving":
      return new MovingBlock(x, y, type);

    case "jump":
      return new JumpBlock(x, y, type);

    case "brittle":
      return new BrittleBlock(x, y, type);

    case "freeze":
      return new FreezeBlock(x, y, type);

    default:
      return new NormalBlock(x, y, type);
  }
}
