console.log("JS LOADED");

document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 320;
  canvas.height = 240;

  // ===== LOAD IMAGES =====
  const duckImg = new Image();
  duckImg.src = "./assets/duck.png";

  const campImg = new Image();
  campImg.src = "./assets/campsite.png";

  // ===== GRID =====
  const GRID = {
    cols: 3,
    rows: 3,
    cellWidth: canvas.width / 3,
    cellHeight: canvas.height / 3
  };

  // ===== PLAYER (DUCK) =====
  const player = {
    x: 160,
    y: 120,
    size: 24,
    speed: 2,
    frame: 0
  };

  // ===== OBJECT =====
  const objects = [
    {
      gridX: 1,
      gridY: 1,
      width: 32,
      height: 32,
      url: "https://example.com",
      frame: 0
    }
  ];

  function getObjectPosition(obj) {
    return {
      x: obj.gridX * GRID.cellWidth + GRID.cellWidth / 2 - obj.width / 2,
      y: obj.gridY * GRID.cellHeight + GRID.cellHeight / 2 - obj.height / 2
    };
  }

  function isNear(player, x, y) {
    const dx = player.x - x;
    const dy = player.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 40;
  }

  // ===== INPUT =====
  const keys = {};

  window.addEventListener("keydown", e => keys[e.key] = true);
  window.addEventListener("keyup", e => keys[e.key] = false);

  // ===== UPDATE =====
  function update() {
    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

    // Wrap
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;
  }

  // ===== DRAW SPRITE =====
  function drawSprite(img, frame, x, y, w, h) {
    const cols = 2;

    const frameX = (frame % cols) * (img.width / cols);
    const frameY = Math.floor(frame / cols) * (img.height / cols);

    ctx.drawImage(
      img,
      frameX,
      frameY,
      img.width / cols,
      img.height / cols,
      x,
      y,
      w,
      h
    );
  }

  // ===== DRAW =====
  function draw() {
    ctx.fillStyle = "#1c2b22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw campsite
    objects.forEach(obj => {
      const pos = getObjectPosition(obj);
      const near = isNear(player, pos.x, pos.y);

      if (near) {
        obj.frame = (obj.frame + 0.1) % 4;
      } else {
        obj.frame = 0;
      }

      drawSprite(
        campImg,
        Math.floor(obj.frame),
        pos.x,
        pos.y,
        obj.width,
        obj.height
      );
    });

    // Animate duck
    player.frame = (player.frame + 0.1) % 4;

    drawSprite(
      duckImg,
      Math.floor(player.frame),
      player.x,
      player.y,
      player.size,
      player.size
    );
  }

  // ===== CLICK =====
  canvas.addEventListener("click", () => {
    objects.forEach(obj => {
      const pos = getObjectPosition(obj);
      if (isNear(player, pos.x, pos.y)) {
        window.open(obj.url, "_blank");
      }
    });
  });

  // ===== LOOP =====
  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();

});