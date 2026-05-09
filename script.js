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
    bush: "./assets/bush.png",
    cat: "./assets/cat.png"
  };

  const images = {};

  function loadImage(name, src) {
    return new Promise(resolve => {
      const img = new Image();

      img.onload = () => {
        images[name] = img;
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
        offsetX: -20,
        offsetY: 6,
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
        offsetX: -40,
        offsetY: -14,
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
        offsetX: 28,
        offsetY: 8,
        frame: 0,
        frameSpeed: 0.16,
        size: 104
      },
      {
        name: "Basecamp",
        img: images.camp,
        url: "https://calendar.google.com/calendar/u/0?cid=YmIzYjY5ZDk2OGE5MDg3NDUxMjJiOTkxZWQ3ZjRkMzdmY2JkNGJjNWQ5ZWRiNGIwOGI2NjYzYWI3NTJhYzRhNEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t",
        gridX: 1,
        gridY: 1,
        offsetX: -10,
        offsetY: -8,
        frame: 0,
        frameSpeed: 0.16,
        size: 92,
        icon: "calendar"
      }
    ];

    const scenery = [
      {
        img: images.tree,
        gridX: 1,
        gridY: 0,
        offsetX: -34,
        offsetY: 8,
        frame: 0,
        frameSpeed: 0.1,
        size: 88
      },
      {
        img: images.willow,
        gridX: 1,
        gridY: 2,
        offsetX: -22,
        offsetY: -18,
        frame: 0,
        frameSpeed: 0.1,
        size: 88
      }
    ];

    const tripList = document.getElementById("trip-list");
    tripList.innerHTML = "";

    places.forEach(place => {
      const li = document.createElement("li");

      if (place.icon === "calendar") {
        li.innerHTML = `
          <span class="trip-link-content">
            <svg class="trip-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
              <path d="M8 3v4M16 3v4M4 10h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            </svg>
            <span>${place.name}</span>
          </span>
        `;
      } else {
        li.textContent = place.name;
      }

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

    function getGridPos(gridX, gridY, offsetX = 0, offsetY = 0) {
      const cellWidth = canvas.width / 3;
      const cellHeight = canvas.height / 3;

      return {
        x: gridX * cellWidth + cellWidth / 2 + offsetX,
        y: gridY * cellHeight + cellHeight / 2 + offsetY
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

    const cat = {
      x: canvas.width * 0.72,
      y: canvas.height * 0.42,
      size: 58,
      frame: 0,
      speed: 2.4,
      wanderAngle: Math.random() * Math.PI * 2,
      wanderTimer: 0,
      hiddenUntil: 0,
      isMoving: true,
      isRunning: false
    };

    const catToast = document.getElementById("cat-toast");
    let toastTimeout = null;
    let mobileHintTarget = null;

    function isMobileViewport() {
      return window.matchMedia("(max-width: 900px)").matches;
    }

    function showToast(message, duration = 1200) {
      catToast.textContent = message;
      catToast.classList.add("show");

      if (toastTimeout) {
        window.clearTimeout(toastTimeout);
      }

      toastTimeout = window.setTimeout(() => {
        catToast.classList.remove("show");
      }, duration);
    }

    function maybeShowMobileHint(targetId, message) {
      if (!isMobileViewport()) return;

      if (mobileHintTarget === targetId && catToast.classList.contains("show")) {
        return;
      }

      mobileHintTarget = targetId;
      showToast(message, 1400);
    }

    function clearMobileHintTarget() {
      mobileHintTarget = null;
    }

    function respawnCat() {
      cat.x = 80 + Math.random() * (canvas.width - 160);
      cat.y = 80 + Math.random() * (canvas.height - 160);
      cat.wanderAngle = Math.random() * Math.PI * 2;
      cat.isMoving = true;
      cat.isRunning = false;
    }

    const bushes = [];
    const bushCount = 28;
    const bushPadding = 28;

    for (let i = 0; i < bushCount; i++) {
      bushes.push({
        x: bushPadding + Math.random() * (canvas.width - bushPadding * 2),
        y: bushPadding + Math.random() * (canvas.height - bushPadding * 2),
        size: 32 + Math.random() * 10,
        alpha: 0.32 + Math.random() * 0.1
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
      const dir = btn.dataset.dir;
      const action = btn.dataset.action;

      btn.addEventListener("touchstart", e => {
        e.preventDefault();

        if (dir) {
          keys[dir] = true;
        }

        if (action === "select") {
          activateNearbyPlace();
        }
      });

      btn.addEventListener("touchend", e => {
        e.preventDefault();

        if (dir) {
          keys[dir] = false;
        }
      });

      btn.addEventListener("mousedown", e => {
        e.preventDefault();

        if (dir) {
          keys[dir] = true;
        }

        if (action === "select") {
          activateNearbyPlace();
        }
      });

      btn.addEventListener("mouseup", e => {
        e.preventDefault();

        if (dir) {
          keys[dir] = false;
        }
      });

      btn.addEventListener("mouseleave", () => {
        if (dir) {
          keys[dir] = false;
        }
      });
    });

    const menuButton = document.getElementById("menu-button");
    const sidebar = document.getElementById("sidebar");

    menuButton.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      menuButton.textContent = sidebar.classList.contains("open") ? "Back" : "Trips";
    });

    function isNear(x1, y1, x2, y2, distance = 96) {
      return Math.hypot(x1 - x2, y1 - y2) < distance;
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

    function updatePlayer() {
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

    function updateCat() {
      if (!images.cat) return;

      const now = performance.now();

      if (now < cat.hiddenUntil) {
        cat.isMoving = false;
        cat.isRunning = false;
        return;
      }

      const previousX = cat.x;
      const previousY = cat.y;

      const dx = cat.x - player.x;
      const dy = cat.y - player.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 38) {
        showToast("yay!!!!", 1200);
        cat.hiddenUntil = now + 1400;
        cat.isMoving = false;
        cat.isRunning = false;
        window.setTimeout(respawnCat, 900);
        return;
      }

      if (distance < 150) {
        const angle = Math.atan2(dy, dx);
        cat.x += Math.cos(angle) * cat.speed * 2.35;
        cat.y += Math.sin(angle) * cat.speed * 2.35;
        cat.isRunning = true;
      } else {
        cat.isRunning = false;
        cat.wanderTimer -= 1;

        if (cat.wanderTimer <= 0) {
          cat.wanderAngle += (Math.random() - 0.5) * 1.5;
          cat.wanderTimer = 40 + Math.random() * 80;
        }

        cat.x += Math.cos(cat.wanderAngle) * cat.speed * 0.45;
        cat.y += Math.sin(cat.wanderAngle) * cat.speed * 0.45;
      }

      if (cat.x < 40) {
        cat.x = 40;
        cat.wanderAngle = Math.random() * Math.PI * 2;
      }

      if (cat.x > canvas.width - 40) {
        cat.x = canvas.width - 40;
        cat.wanderAngle = Math.random() * Math.PI * 2;
      }

      if (cat.y < 40) {
        cat.y = 40;
        cat.wanderAngle = Math.random() * Math.PI * 2;
      }

      if (cat.y > canvas.height - 40) {
        cat.y = canvas.height - 40;
        cat.wanderAngle = Math.random() * Math.PI * 2;
      }

      const moved = Math.hypot(cat.x - previousX, cat.y - previousY);
      cat.isMoving = moved > 0.05;

      if (cat.isMoving) {
        cat.frame = (cat.frame + (cat.isRunning ? 0.28 : 0.12)) % 4;
      } else {
        cat.frame = 0;
      }
    }

    function update() {
      updatePlayer();
      updateCat();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
      let nearSomething = false;

      scenery.forEach((item, index) => {
        const pos = getGridPos(item.gridX, item.gridY, item.offsetX, item.offsetY);
        const touching = isNear(player.x, player.y, pos.x, pos.y);

        if (touching) {
          nearSomething = true;
          maybeShowMobileHint(`scenery-${index}`, "keep adventuring!");
        }

        item.frame = touching ? (item.frame + item.frameSpeed) % 4 : 0;

        drawables.push({
          y: pos.y,
          draw: () => {
            drawSprite2x2(item.img, item.frame, pos.x, pos.y, item.size);
          }
        });
      });

      places.forEach(place => {
        const pos = getGridPos(place.gridX, place.gridY, place.offsetX, place.offsetY);
        const touching = isNear(player.x, player.y, pos.x, pos.y);

        place.hover = (place.hover || 0) + 0.05;

        if (touching) {
          nearSomething = true;
          place.frame = (place.frame + place.frameSpeed) % 4;
          place.sidebarElement.classList.add("active");
          maybeShowMobileHint(`place-${place.name}`, "tap ● to see the trip!");
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

      if (!nearSomething) {
        clearMobileHintTarget();
      }

      const duckBounce = Math.sin(player.idle) * 2;

      drawables.push({
        y: player.y,
        draw: () => {
          drawShadow(player.x, player.y, 26);
          drawSprite2x2(images.duck, player.frame, player.x, player.y + duckBounce, player.size);
        }
      });

      if (images.cat && performance.now() >= cat.hiddenUntil) {
        drawables.push({
          y: cat.y,
          draw: () => {
            drawShadow(cat.x, cat.y, 18);
            drawSprite2x2(images.cat, cat.frame, cat.x, cat.y, cat.size);
          }
        });
      }

      drawables.sort((a, b) => a.y - b.y);
      drawables.forEach(item => item.draw());
    }

    function activateNearbyPlace() {
      for (const place of places) {
        const pos = getGridPos(place.gridX, place.gridY, place.offsetX, place.offsetY);

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