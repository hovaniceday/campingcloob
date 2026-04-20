document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 320;
  canvas.height = 240;

  // IMAGES
  const duckImg = new Image();
  duckImg.src = "./assets/duck.png";

  const troutImg = new Image();
  troutImg.src = "./assets/trout.png";

  const boatImg = new Image();
  boatImg.src = "./assets/boat.png";

  const campImg = new Image();
  campImg.src = "./assets/campsite.png";

  const bushImg = new Image();
  bushImg.src = "./assets/bush.png";

  const treeImg = new Image();
  treeImg.src = "./assets/tree.png";

  const willowImg = new Image();
  willowImg.src = "./assets/willow.png";

  // DESTINATIONS
  const DESTINATIONS = [
    { name: "Lake Luzerne", url: "https://partiful.com" },
    { name: "Beaverkill", url: "https://partiful.com" },
    { name: "Campsite", url: "https://partiful.com" }
  ];

  const list = document.getElementById("trip-list");

  DESTINATIONS.forEach((dest, i) => {
    const li = document.createElement("li");
    li.textContent = dest.name;
    li.onclick = () => window.open(dest.url, "_blank");
    li.dataset.index = i;
    list.appendChild(li);
  });

  const sidebarItems = document.querySelectorAll("#trip-list li");

  const GRID = {
    cellWidth: canvas.width / 3,
    cellHeight: canvas.height / 3
  };

  function getPos(obj) {
    const x = obj.gridX * GRID.cellWidth + GRID.cellWidth / 2;
    const y = obj.gridY * GRID.cellHeight + GRID.cellHeight / 2;
    return { x, y, drawX: x - 16, drawY: y - 16 };
  }

  function isNear(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2) < 50;
  }

  const player = {
    x: 0,
    y: 0,
    size: 24,
    speed: 2,
    frame: 0,
    idle: 0
  };

  const places = [
    { gridX: 2, gridY: 0, img: boatImg, index: 0, frame: 0, idle: 0 },
    { gridX: 0, gridY: 2, img: troutImg, index: 1, frame: 0, idle: 0 },
    { gridX: 1, gridY: 1, img: campImg, index: 2, frame: 0, idle: 0, isHome: true }
  ];

  const environment = [
    { gridX: 1, gridY: 0, img: treeImg, frame: 0 },
    { gridX: 2, gridY: 2, img: willowImg, frame: 0 }
  ];

  const bushes = [];
  for (let i = 0; i < 25; i++) {
    bushes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 16 + Math.random() * 10,
      alpha: 0.6 + Math.random() * 0.3
    });
  }

  const home = places.find(p => p.isHome);
  const homePos = getPos(home);
  player.x = homePos.x;
  player.y = homePos.y;

  const keys = {};
  window.addEventListener("keydown", e => keys[e.key] = true);
  window.addEventListener("keyup", e => keys[e.key] = false);

  document.querySelectorAll("#dpad button").forEach(btn => {
    btn.addEventListener("touchstart", () => keys[btn.dataset.dir] = true);
    btn.addEventListener("touchend", () => keys[btn.dataset.dir] = false);
  });

  const menuBtn = document.getElementById("menu-button");
  const sidebar = document.getElementById("sidebar");

  menuBtn.onclick = () => {
    sidebar.classList.toggle("open");
    menuBtn.textContent = sidebar.classList.contains("open") ? "Back" : "Trips";
  };

  function update() {
    if (keys["ArrowUp"] || keys["w"] || keys["up"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"] || keys["down"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"] || keys["left"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"] || keys["right"]) player.x += player.speed;

    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;

    player.idle += 0.05;
  }

  function drawSprite(img, frame, x, y, size) {
    const cols = 2;
    const fw = img.width / cols;
    const fh = img.height / cols;

    const fx = (frame % cols) * fw;
    const fy = Math.floor(frame / cols) * fh;

    ctx.drawImage(img, fx, fy, fw, fh, x, y, size, size);
  }

  function draw() {
    ctx.fillStyle = "#b7e07a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    sidebarItems.forEach(li => li.classList.remove("active"));

    bushes.forEach(b => {
      ctx.globalAlpha = b.alpha;
      ctx.drawImage(bushImg, b.x, b.y, b.size, b.size);
    });
    ctx.globalAlpha = 1;

    const drawables = [];

    // 🌳 environment (animate on proximity, no float)
    environment.forEach(obj => {
      const pos = getPos(obj);
      const near = isNear(player.x, player.y, pos.x, pos.y);

      if (near) obj.frame = (obj.frame + 0.2) % 4;
      else obj.frame = 0;

      drawables.push({
        y: pos.y,
        draw: () => drawSprite(obj.img, Math.floor(obj.frame), pos.drawX, pos.drawY, 32)
      });
    });

    places.forEach(obj => {
      const pos = getPos(obj);
      const near = isNear(player.x, player.y, pos.x, pos.y);

      obj.idle += 0.05;
      const float = Math.sin(obj.idle) * 2;

      if (near) {
        obj.frame = (obj.frame + 0.2) % 4;
        sidebarItems[obj.index].classList.add("active");
      } else {
        obj.frame = 0;
      }

      drawables.push({
        y: pos.y,
        draw: () => drawSprite(obj.img, Math.floor(obj.frame), pos.drawX, pos.drawY + float, 32)
      });
    });

    const bounce = Math.sin(player.idle) * 2;
    player.frame = (player.frame + 0.15) % 4;

    drawables.push({
      y: player.y,
      draw: () => drawSprite(duckImg, Math.floor(player.frame), player.x, player.y + bounce, player.size)
    });

    drawables.sort((a, b) => a.y - b.y);
    drawables.forEach(d => d.draw());
  }

  canvas.addEventListener("click", () => {
    places.forEach(obj => {
      const pos = getPos(obj);
      if (isNear(player.x, player.y, pos.x, pos.y)) {
        window.open(DESTINATIONS[obj.index].url, "_blank");
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