document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 960;
  canvas.height = 720;

  const ASSET_PATHS = {
    duck: "./assets/duck.png",
    trout: "./assets/trout.png",
    puffin: "./assets/puffin.png",
    highpeak: "./assets/highpeak.png",
    camp: "./assets/campsite.png",
    tree: "./assets/tree.png",
    willow: "./assets/willow.png",
    bush: "./assets/bush.png"
  };

  const images = {};

  function loadImage(name, src) {
    return new Promise(resolve => {
      const img = new Image();

      img.onload = () => {
        images[name] = img;
        console.log(`Loaded image: ${name}`, img.width, img.height);
        resolve();
      };

      img.onerror = () => {
        console.warn(`Missing image: ${src}`);
        images[name] = null;
        resolve();
      };

      img.src = `${src}?v=${Date.now()}`;
    });
  }

  Promise.all(
    Object.entries(ASSET_PATHS).map(([name, src]) => loadImage(name, src))
  ).then(startGame);

  function startGame() {
    const places = [
      {
        name: "Beaverkill",
        img: images.trout,
        url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1591163723#gid=1591163723",
        gridX: 0,
        gridY: 2,
        frame: 0,
        frameSpeed: 0.16,
        size: 92
      },
      {
        name: "Adirondacks",
        img: images.highpeak,
        url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1346249244#gid=1346249244",
        gridX: 2,
        gridY: 2,
        frame: 0,
        frameSpeed: 0.16,
        size: 96
      },
      {
        name: "Acadia",
        img: images.puffin,
        url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1978556881#gid=1978556881",
        gridX: 0,
        gridY: 0,
        frame: 0,
        frameSpeed: 0.16,
        size: 104
      },
      {
        name: "Campsite",
        img: images.camp,
        url: "https://calendar.google.com/calendar/u/0?cid=YmIzYjY5ZDk2OGE5MDg3NDUxMjJiOTkxZWQ3ZjRkMzdmY2JkNGJjNWQ5ZWRiNGIwOGI2NjYzYWI3NTJhYzRhNEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t",
        gridX: 1,
        gridY: 1,
        frame: 0,
        frameSpeed: 0.16,
        size: 92
      }
    ];

    const scenery = [
      {
        img: images.tree,
        gridX: 1,
        gridY: 0,
        frame: 0,
        frameSpeed: 0.1,
        size: 88
      },
      {
        img: images.willow,
        gridX: 1,
        gridY: 2,
        frame: 0,
        frameSpeed: 0.1,
        size: 88
      }
    ];

    const tripList = document.getElementById("trip-list");
    tripList.innerHTML = "";

    places.forEach(place => {
      const li = document.createElement("li");
      li.textContent = place.name;

      li.addEventListener("click", () => {
        window.location.href = place.url;
      });

      place.sidebarElement = li;
      tripList.appendChild(li);
    });

    const countdown = document.getElementById("countdown");

    function updateCountdown() {
      const target = new Date("2026-05-22T15:00:00-04:00");
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        countdown.textContent = "Trips are open!";
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);

      countdown.textContent = `Opens in ${days}d ${hours}h ${mins}m`;
    }

    updateCountdown();
    setInterval(updateCountdown, 60000);

    function getGridPos(gridX, gridY) {
      const cellWidth = canvas.width / 3;
      const cellHeight = canvas.height / 3;

      return {
        x: gridX * cellWidth + cellWidth / 2,
        y: gridY * cellHeight + cellHeight / 2
      };
    }

    const player = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      size: 72,
      speed: 4,
      frame: 0,
      idle: 0
    };

    // BUSHES — back to plain-image random scatter
    const bushes = [];
    const bushCount = 34;
    const bushPadding = 28;

    for (let i = 0; i < bushCount; i++) {
      bushes.push({
        x: bushPadding + Math.random() * (canvas.width - bushPadding * 2),
        y: bushPadding + Math.random() * (canvas.height - bushPadding * 2),
        size: 34 + Math.random() * 10,
        alpha: 0.34 + Math.random() * 0.12
      });
    }

    const keys = {};

    window.addEventListener("keydown", e => {
      keys[e.key] = true;
    });

    window.addEventListener("keyup", e => {
      keys[e.key] = false;
    });

    document.querySelectorAll("#dpad button").forEach(btn => {
      btn.addEventListener("touchstart", e => {
        e.preventDefault();
        keys[btn.dataset.dir] = true;
      });

      btn.addEventListener("touchend", e => {
        e.preventDefault();
        keys[btn.dataset.dir] = false;
      });

      btn.addEventListener("mousedown", e => {
        e.preventDefault();
        keys[btn.dataset.dir] = true;
      });

      btn.addEventListener("mouseup", e => {
        e.preventDefault();
        keys[btn.dataset.dir] = false;
      });

      btn.addEventListener("mouseleave", () => {
        keys[btn.dataset.dir] = false;
      });
    });

    const menuButton = document.getElementById("menu-button");
    const sidebar = document.getElementById("sidebar");

    menuButton.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      menuButton.textContent = sidebar.classList.contains("open") ? "Back" : "Trips";
    });

    function isNear(x1, y1, x2, y2) {
      return Math.hypot(x1 - x2, y1 - y2) < 96;
    }

    function drawShadow(x, y, width = 34) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(x, y + 32, width, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawSprite2x2(img, frame, x, y, size) {
      if (!img) return false;

      const cols = 2;
      const rows = 2;
      const frameIndex = Math.floor(frame) % 4;

      const fw = img.width / cols;
      const fh = img.height / rows;

      const sx = (frameIndex % cols) * fw;
      const sy = Math.floor(frameIndex / cols) * fh;

      ctx.drawImage(
        img,
        sx,
        sy,
        fw,
        fh,
        x - size / 2,
        y - size / 2,
        size,
        size
      );

      return true;
    }

    function update() {
      if (keys["ArrowUp"] || keys["w"] || keys["up"]) {
        player.y -= player.speed;
      }

      if (keys["ArrowDown"] || keys["s"] || keys["down"]) {
        player.y += player.speed;
      }

      if (keys["ArrowLeft"] || keys["a"] || keys["left"]) {
        player.x -= player.speed;
      }

      if (keys["ArrowRight"] || keys["d"] || keys["right"]) {
        player.x += player.speed;
      }

      if (player.x < -20) player.x = canvas.width;
      if (player.x > canvas.width + 20) player.x = 0;
      if (player.y < -20) player.y = canvas.height;
      if (player.y > canvas.height + 20) player.y = 0;

      player.idle += 0.08;
      player.frame = (player.frame + 0.14) % 4;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Bushes: plain image, no sprite slicing, top-left positioning
      if (images.bush) {
        bushes.forEach(bush => {
          ctx.save();
          ctx.globalAlpha = bush.alpha;
          ctx.drawImage(
            images.bush,
            bush.x - bush.size / 2,
            bush.y - bush.size / 2,
            bush.size,
            bush.size
          );
          ctx.restore();
        });
      }

      places.forEach(place => {
        place.sidebarElement.classList.remove("active");
      });

      const drawables = [];

      scenery.forEach(item => {
        const pos = getGridPos(item.gridX, item.gridY);
        const touching = isNear(player.x, player.y, pos.x, pos.y);

        item.frame = touching ? (item.frame + item.frameSpeed) % 4 : 0;

        drawables.push({
          y: pos.y,
          draw: () => {
            drawSprite2x2(item.img, item.frame, pos.x, pos.y, item.size);
          }
        });
      });

      places.forEach(place => {
        const pos = getGridPos(place.gridX, place.gridY);
        const touching = isNear(player.x, player.y, pos.x, pos.y);

        place.hover = (place.hover || 0) + 0.05;

        if (touching) {
          place.frame = (place.frame + place.frameSpeed) % 4;
          place.sidebarElement.classList.add("active");
        } else {
          place.frame = 0;
        }

        const float = Math.sin(place.hover) * 3;

        drawables.push({
          y: pos.y,
          draw: () => {
            drawShadow(pos.x, pos.y, 38);
            drawSprite2x2(place.img, place.frame, pos.x, pos.y + float, place.size);
          }
        });
      });

      const duckBounce = Math.sin(player.idle) * 2;

      drawables.push({
        y: player.y,
        draw: () => {
          drawShadow(player.x, player.y, 26);
          drawSprite2x2(images.duck, player.frame, player.x, player.y + duckBounce, player.size);
        }
      });

      drawables.sort((a, b) => a.y - b.y);
      drawables.forEach(item => item.draw());
    }

    function activateNearbyPlace() {
      for (const place of places) {
        const pos = getGridPos(place.gridX, place.gridY);

        if (isNear(player.x, player.y, pos.x, pos.y)) {
          window.location.href = place.url;
          return;
        }
      }
    }

    canvas.addEventListener("click", activateNearbyPlace);

    window.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        activateNearbyPlace();
      }
    });

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    loop();
  }
});