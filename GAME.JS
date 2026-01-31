const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 520;
canvas.height = 720;

let keys = {};
let gameOver = false;
let paused = false;
let score = 0;
let speed = 2;
let glowPulse = 0;

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (e.key === "Escape" && !gameOver) {
    paused = !paused;
  }
});

document.addEventListener("keyup", e => keys[e.key] = false);

class Player {
  constructor() {
    this.w = 40;
    this.h = 40;
    this.x = canvas.width/2 - this.w/2;
    this.y = canvas.height - 90;
    this.speed = 7;
  }

  move() {
    if (keys["a"] || keys["ArrowLeft"]) this.x -= this.speed;
    if (keys["d"] || keys["ArrowRight"]) this.x += this.speed;
    this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
  }

  draw() {
    ctx.save();
    ctx.shadowColor = "#00fff2";
    ctx.shadowBlur = 25;
    ctx.fillStyle = "#00ffe1";
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.restore();
  }
}

class Enemy {
  constructor() {
    this.w = 30 + Math.random()*25;
    this.h = this.w;
    this.x = Math.random() * (canvas.width - this.w);
    this.y = -this.h;
    this.hue = Math.random()*360;
  }

  update() {
    this.y += speed;
  }

  draw() {
    ctx.save();
    ctx.shadowColor = `hsl(${this.hue},100%,60%)`;
    ctx.shadowBlur = 20;
    ctx.fillStyle = `hsl(${this.hue},100%,55%)`;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.restore();
  }

  collide(p) {
    return (
      this.x < p.x + p.w &&
      this.x + this.w > p.x &&
      this.y < p.y + p.h &&
      this.y + this.h > p.y
    );
  }
}

let player = new Player();
let enemies = [];

function spawnEnemy() {
  if (!paused && !gameOver) enemies.push(new Enemy());
}
setInterval(spawnEnemy, 700);

function resetGame() {
  enemies = [];
  score = 0;
  speed = 2;
  paused = false;
  player = new Player();
  gameOver = false;
}

function drawCentered(text, y, size=24, glow="#fff") {
  ctx.save();
  ctx.font = size + "px Segoe UI";
  ctx.fillStyle = "white";
  ctx.shadowColor = glow;
  ctx.shadowBlur = 15;

  const w = ctx.measureText(text).width;
  ctx.fillText(text, canvas.width/2 - w/2, y);

  ctx.restore();
}

function backgroundGlow() {
  glowPulse += 0.02;
  let alpha = 0.05 + Math.sin(glowPulse)*0.03;
  ctx.fillStyle = `rgba(0,255,255,${alpha})`;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function loop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  backgroundGlow();

  if (!gameOver && !paused) {
    player.move();
    player.draw();

    enemies.forEach((e, i) => {
      e.update();
      e.draw();

      if (e.collide(player)) gameOver = true;

      if (e.y > canvas.height) {
        enemies.splice(i,1);
        score++;
      }
    });

    if (score % 10 === 0 && score !== 0) speed += 0.01;

    drawCentered("SCORE " + score, 40, 26, "#00fff2");
  }

  if (paused && !gameOver) {
    drawCentered("PAUSED", 340, 50, "#00fff2");
    drawCentered("Press ESC to resume", 400, 22);
  }

  if (gameOver) {
    drawCentered("GAME OVER", 320, 48, "#ff0080");
    drawCentered("Score: " + score, 370, 28);
    drawCentered("Press R to restart", 420, 22, "#00fff2");

    if (keys["r"] || keys["R"]) resetGame();
  }

  requestAnimationFrame(loop);
}

loop();
