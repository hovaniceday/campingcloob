document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 320;
  canvas.height = 240;

  // ⏳ COUNTDOWN
  const countdownEl = document.getElementById("countdown");
  const launchDate = new Date("May 22, 2026 15:00:00 GMT-0400");
  let isUnlocked = false;

  function updateCountdown() {
    const now = new Date();
    const diff = launchDate - now;

    if (diff <= 0) {
      countdownEl.textContent = "Trips are now open! 🌲";
      isUnlocked = true;
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    countdownEl.textContent =
      `Trips open in ${d}d ${h}h ${m}m ${s}s`;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // IMAGES
  const duckImg = new Image(); duckImg.src = "./assets/duck.png";
  const troutImg = new Image(); troutImg.src = "./assets/trout.png";
  const boatImg = new Image(); boatImg.src = "./assets/boat.png";
  const campImg = new Image(); campImg.src = "./assets/campsite.png";
  const bushImg = new Image(); bushImg.src = "./assets/bush.png";
  const treeImg = new Image(); treeImg.src = "./assets/tree.png";
  const willowImg = new Image(); willowImg.src = "./assets/willow.png";

  const DESTINATIONS = [
    { name: "Acadia", url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1978556881#gid=1978556881" },
    { name: "Beaverkill", url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1591163723#gid=1591163723" },
    { name: "Adirondacks", url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1346249244#gid=1346249244" },
    { name: "Campsite", url: "https://calendar.google.com/calendar/u/0?cid=YmIzYjY5ZDk2OGE5MDg3NDUxMjJiOTkxZWQ3ZjRkMzdmY2JkNGJjNWQ5ZWRiNGIwOGI2NjYzYWI3NTJhYzRhNEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t" }
  ];

  const list = document.getElementById("trip-list");

  DESTINATIONS.forEach((dest, i) => {
    const li = document.createElement("li");
    li.textContent = dest.name;
    li.onclick = () => {
      if (!isUnlocked) return;
      window.open(dest.url, "_blank");
    };
    list.appendChild(li);
  });

  const GRID = { cellWidth: canvas.width / 3, cellHeight: canvas.height / 3 };

  function getPos(obj) {
    const x = obj.gridX * GRID.cellWidth + GRID.cellWidth / 2;
    const y = obj.gridY * GRID.cellHeight + GRID.cellHeight / 2;
    return { x, y, drawX: x - 16, drawY: y - 16 };
  }

  function isNear(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2) < 50;
  }

  const player = { x: 0, y: 0, size: 24, speed: 2, frame: 0, idle: 0 };

  const places = [
    { gridX: 2, gridY: 0, img: boatImg, index: 0, frame: 0, idle: 0 },
    { gridX: 0, gridY: 2, img: troutImg, index: 1, frame: 0, idle: 0 },
    { gridX: 2, gridY: 2, img: willowImg, index: 2, frame: 0, idle: 0 },
    { gridX: 1, gridY: 1, img: campImg, index: 3, frame: 0, idle: 0 }
  ];

  const environment = [{ gridX: 1, gridY: 0, img: treeImg, frame: 0 }];

  const bushes = [];
  for (let i = 0; i < 25; i++) {
    bushes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 16 + Math.random() * 10,
      alpha: 0.6 + Math.random() * 0.3
    });
  }

  const keys = {};
  window.addEventListener("keydown", e => keys[e.key] = true);
  window.addEventListener("keyup", e => keys[e.key] = false);

  function update() {
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

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

    bushes.forEach(b => {
      ctx.globalAlpha = b.alpha;
      ctx.drawImage(bushImg, b.x, b.y, b.size, b.size);
    });
    ctx.globalAlpha = 1;

    places.forEach(obj => {
      const pos = getPos(obj);
      const near = isNear(player.x, player.y, pos.x, pos.y);

      obj.idle += 0.05;
      const float = Math.sin(obj.idle) * 2;

      if (near) obj.frame = (obj.frame + 0.2) % 4;
      else obj.frame = 0;

      drawSprite(obj.img, Math.floor(obj.frame), pos.drawX, pos.drawY + float, 32);
    });

    const bounce = Math.sin(player.idle) * 2;
    player.frame = (player.frame + 0.15) % 4;

    drawSprite(duckImg, Math.floor(player.frame), player.x, player.y + bounce, player.size);
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();

});