console.log("JS LOADED");

document.addEventListener("DOMContentLoaded", () => {

  console.log("DOM READY");

  // ===== DESTINATIONS =====
  const DESTINATIONS = [
    {
      name: "Adirondacks",
      url: "https://example.com"
    },
    {
      name: "Catskills",
      url: "https://example.com"
    }
  ];

  // ===== SIDEBAR =====
  const list = document.getElementById("trip-list");

  DESTINATIONS.forEach((dest, index) => {
    const li = document.createElement("li");
    li.textContent = dest.name;
    li.onclick = () => window.open(dest.url, "_blank");
    li.dataset.index = index;
    list.appendChild(li);
  });

  const sidebarItems = document.querySelectorAll("#trip-list li");

  // ===== CANVAS =====
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 320;
  canvas.height = 240;

  // ===== GRID SYSTEM =====
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
    size: 10,
    speed: 2
  };

  const keys = {};

  window.addEventListener("keydown", e => keys[e.key] = true);
  window.addEventListener("keyup", e => keys[e.key] = false);

  // ===== OBJECTS =====
  const objects = [
    {
      gridX: 1,
      gridY: 0,
      width: 24,
      height: 24,
      label: "Adirondacks",
      url: "https://example.com",
      index: 0,
      frame: 0
    },
    {
      gridX: 2,
      gridY: 2,
      width: 24,
      height: 24,
      label: "Catskills",
      url: "https://example.com",
      index: 1,
      frame: 0
    }
  ];

  function getObjectPosition(obj) {
    return {
      x: obj.gridX * GRID.cellWidth + GRID.cellWidth / 2 - obj.width / 2,
      y: obj.gridY * GRID.cellHeight + GRID.cellHeight / 2 - obj.height / 2
    };
  }

  function isNear(player, objX, objY) {
    const dx = player.x - objX;
    const dy = player.y - objY;
    return Math.sqrt(dx * dx + dy * dy) < 30;
  }

  // ===== UPDATE =====
  function update() {
    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

    // Wrap around screen
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;
  }

  // ===== DRAW =====
  function draw() {
    ctx.fillStyle = "#1c2b22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (light debug)
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID.cellWidth, 0);
      ctx.lineTo(i * GRID.cellWidth, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * GRID.cellHeight);
      ctx.lineTo(canvas.width, i * GRID.cellHeight);
      ctx.stroke();
    }

    // Reset sidebar
    sidebarItems.forEach(li => li.classList.remove("active"));

    // Draw objects
    objects.forEach(obj => {
      const pos = getObjectPosition(obj);

      const near = isNear(player, pos.x, pos.y);

      if (near) {
        sidebarItems[obj.index].classList.add("active");

        // simple animation (pulse)
        obj.frame += 0.1;
      } else {
        obj.frame = 0;
      }

      const sizeOffset = near ? Math.sin(obj.frame) * 2 : 0;

      ctx.fillStyle = near ? "#c8ff78" : "#4a7c59";
      ctx.fillRect(
        pos.x - sizeOffset,
        pos.y - sizeOffset,
        obj.width + sizeOffset * 2,
        obj.height + sizeOffset * 2
      );
    });

    // Draw player
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x, player.y, player.size, player.size);
  }

  // ===== CLICK INTERACTION =====
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