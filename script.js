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

  const troutImg = new Image();
  troutImg.src = "./assets/trout.png";

  const boatImg = new Image();
  boatImg.src = "./assets/boat.png";

  // ===== GRID =====
  const GRID = {
    cols: 3,
    rows: 3,
    cellWidth: canvas.width / 3,
    cellHeight: canvas.height / 3
  };

  // ===== PLAYER =====
  const player = {
    x: 160,
    y: 120,
    size: 24,
    speed: 2,
    frame: 0,
    direction: "down"
  };

  // ===== OBJECTS =====
  const objects = [
    { gridX: 1, gridY: 1, img: campImg, url: "https://example.com", frame: 0 },
    { gridX: 0, gridY: 2, img: troutImg, url: "https://example.com", frame: 0 },
    { gridX: 2, gridY: 0, img: boatImg, url: "https://example.com", frame: 0 }
  ];

  function getObjectPosition(obj) {
    return {
      x: obj.gridX * GRID.cellWidth + GRID.cellWidth / 2 - 16,
      y: obj.gridY * GRID.cellHeight + GRID.cellHeight / 2 - 16
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

  // MOBILE DPAD
  document.querySelectorAll("#dpad button").forEach(btn => {
    btn.addEventListener("touchstart", () => {
      keys[btn.dataset.dir] = true;
    });
    btn.addEventListener("touchend", () => {
      keys[btn.dataset.dir] = false;
    });
  });

  // MENU
  const menuBtn = document.getElementById("menu-button");
  const sidebar = document.getElementById("sidebar");

  menuBtn.onclick = () => {
    sidebar.classList.toggle("open");
  };

  // ===== UPDATE =====
  function update() {
    if (keys["ArrowUp"] || keys["w"] || keys["up"]) {
      player.y -= player.speed;
      player.direction = "up";
    }
    if (keys["ArrowDown"] || keys["s"] || keys["down"]) {
      player.y += player.speed;
      player.direction = "down";
    }
    if (keys["ArrowLeft"] || keys["a"] || keys["left"]) {
      player.x -= player.speed;
      player.direction = "left";
    }
    if (keys["ArrowRight"] || keys["d"] || keys["right"]) {
      player.x += player.speed;
      player.direction = "right";
    }

    // wrap
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;
  }

  function drawSprite(img, frame, x, y, size) {
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
      size,
      size
    );
  }

  function drawDuck() {
    player.frame = (player.frame + 0.15) % 4;

    let dirOffset = 0;
    if (player.direction === "down") dirOffset = 0;
    if (player.direction === "left") dirOffset = 1;
    if (player.direction === "right") dirOffset = 2;
    if (player.direction === "up") dirOffset = 3;

    drawSprite(
      duckImg,
      Math.floor(player.frame),
      player.x,
      player.y,
      player.size
    );
  }

  function draw() {
    ctx.fillStyle = "#1c2b22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    objects.forEach(obj => {
      const pos = getObjectPosition(obj);
      const near = isNear(player, pos.x, pos.y);

      if (near) obj.frame = (obj.frame + 0.1) % 4;
      else obj.frame = 0;

      drawSprite(obj.img, Math.floor(obj.frame), pos.x, pos.y, 32);
    });

    drawDuck();
  }

  canvas.addEventListener("click", () => {
    objects.forEach(obj => {
      const pos = getObjectPosition(obj);
      if (isNear(player, pos.x, pos.y)) {
        window.open(obj.url, "_blank");
      }
    });
  });

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();

});