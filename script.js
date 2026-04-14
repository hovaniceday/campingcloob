document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 320;
  canvas.height = 240;

  // ===== IMAGES =====
  const duckImg = new Image();
  duckImg.src = "./assets/duck.png";

  const troutImg = new Image();
  troutImg.src = "./assets/trout.png";

  const boatImg = new Image();
  boatImg.src = "./assets/boat.png";

  // ===== DESTINATIONS =====
  const DESTINATIONS = [
    { name: "Lake Luzerne", url: "https://partiful.com" },
    { name: "Beaverkill", url: "https://partiful.com" }
  ];

  const list = document.getElementById("trip-list");

  DESTINATIONS.forEach((dest, index) => {
    const li = document.createElement("li");
    li.textContent = dest.name;
    li.onclick = () => window.open(dest.url, "_blank");
    li.dataset.index = index;
    list.appendChild(li);
  });

  const sidebarItems = document.querySelectorAll("#trip-list li");

  // ===== GRID =====
  const GRID = {
    cellWidth: canvas.width / 3,
    cellHeight: canvas.height / 3
  };

  // ===== PLAYER =====
  const player = {
    x: 160,
    y: 120,
    size: 24,
    speed: 2,
    frame: 0
  };

  // ===== OBJECTS =====
  const objects = [
    { gridX: 2, gridY: 0, img: boatImg, index: 0, frame: 0 },
    { gridX: 0, gridY: 2, img: troutImg, index: 1, frame: 0 }
  ];

  function getPos(obj) {
    return {
      x: obj.gridX * GRID.cellWidth + GRID.cellWidth / 2 - 16,
      y: obj.gridY * GRID.cellHeight + GRID.cellHeight / 2 - 16
    };
  }

  function isNear(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2) < 40;
  }

  // ===== INPUT =====
  const keys = {};

  window.addEventListener("keydown", e => keys[e.key] = true);
  window.addEventListener("keyup", e => keys[e.key] = false);

  // ===== DPAD TOUCH =====
  const dpad = document.getElementById("dpad-img");

  dpad.addEventListener("touchstart", (e) => {
    const rect = dpad.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    const dx = x - rect.width / 2;
    const dy = y - rect.height / 2;

    keys["up"] = dy < -20;
    keys["down"] = dy > 20;
    keys["left"] = dx < -20;
    keys["right"] = dx > 20;
  });

  dpad.addEventListener("touchend", () => {
    keys["up"] = keys["down"] = keys["left"] = keys["right"] = false;
  });

  // ===== MENU =====
  const menuBtn = document.getElementById("menu-button");
  const sidebar = document.getElementById("sidebar");
  const backBtn = document.getElementById("back-button");

  menuBtn.onclick = () => sidebar.classList.toggle("open");
  backBtn.onclick = () => sidebar.classList.remove("open");

  // ===== UPDATE =====
  function update() {
    if (keys["ArrowUp"] || keys["w"] || keys["up"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"] || keys["down"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"] || keys["left"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"] || keys["right"]) player.x += player.speed;

    // wrap
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;
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
    ctx.fillStyle = "#1c2b22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    sidebarItems.forEach(li => li.classList.remove("active"));

    // objects
    objects.forEach(obj => {
      const pos = getPos(obj);
      const near = isNear(player.x, player.y, pos.x, pos.y);

      if (near) {
        obj.frame = (obj.frame + 0.1) % 4;
        sidebarItems[obj.index].classList.add("active");
      } else {
        obj.frame = 0;
      }

      drawSprite(obj.img, Math.floor(obj.frame), pos.x, pos.y, 32);
    });

    // duck animation
    player.frame = (player.frame + 0.15) % 4;
    drawSprite(duckImg, Math.floor(player.frame), player.x, player.y, player.size);
  }

  canvas.addEventListener("click", () => {
    objects.forEach(obj => {
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