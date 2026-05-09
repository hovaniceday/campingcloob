document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 960;
  canvas.height = 720;

  // -------------------------
  // IMAGE LOADER
  // -------------------------

  const images = {};

  function loadImage(name, src) {

    return new Promise(resolve => {

      const img = new Image();

      img.onload = () => {

        images[name] = img;
        resolve();

      };

      img.onerror = () => {

        console.warn("Missing image:", src);

        images[name] = null;
        resolve();

      };

      img.src = src + "?v=2";

    });

  }

  Promise.all([

    loadImage("duck", "./assets/duck.png"),

    loadImage("trout", "./assets/trout.png"),
    loadImage("puffin", "./assets/puffin.png"),
    loadImage("highpeak", "./assets/highpeak.png"),
    loadImage("camp", "./assets/campsite.png"),

    loadImage("tree", "./assets/tree.png"),
    loadImage("willow", "./assets/willow.png"),

    loadImage("bush", "./assets/bush.png")

  ]).then(startGame);

  // -------------------------
  // GAME
  // -------------------------

  function startGame() {

    // -------------------------
    // PLACES
    // -------------------------

    const places = [

      {
        name: "Beaverkill",

        img: images.trout,

        url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1591163723#gid=1591163723",

        gridX: 0,
        gridY: 2,

        frame: 0,
        defaultFrame: 0,

        frameSpeed: 0.16
      },

      {
        name: "Adirondacks",

        img: images.highpeak,

        url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1346249244#gid=1346249244",

        gridX: 2,
        gridY: 2,

        frame: 0,
        defaultFrame: 0,

        frameSpeed: 0.16
      },

      // FIXED PUFFIN

      {
        name: "Acadia",

        img: images.puffin,

        url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1978556881#gid=1978556881",

        gridX: 2,
        gridY: 0,

        frame: 1,
        defaultFrame: 1,

        frameSpeed: 0.16
      },

      {
        name: "Campsite",

        img: images.camp,

        url: "https://calendar.google.com/calendar/u/0?cid=YmIzYjY5ZDk2OGE5MDg3NDUxMjJiOTkxZWQ3ZjRkMzdmY2JkNGJjNWQ5ZWRiNGIwOGI2NjYzYWI3NTJhYzRhNEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t",

        gridX: 1,
        gridY: 1,

        frame: 0,
        defaultFrame: 0,

        frameSpeed: 0.16
      }

    ];

    // -------------------------
    // SCENERY
    // -------------------------

    const scenery = [

      {
        img: images.tree,

        gridX: 1,
        gridY: 0,

        frame: 0,
        frameSpeed: 0.1
      },

      {
        img: images.willow,

        gridX: 1,
        gridY: 2,

        frame: 0,
        frameSpeed: 0.1
      }

    ];

    // -------------------------
    // SIDEBAR
    // -------------------------

    const tripList =
      document.getElementById("trip-list");

    places.forEach(place => {

      const li =
        document.createElement("li");

      li.textContent = place.name;

      li.addEventListener("click", () => {

        window.location.href = place.url;

      });

      place.sidebarElement = li;

      tripList.appendChild(li);

    });

    // -------------------------
    // COUNTDOWN
    // -------------------------

    const countdown =
      document.getElementById("countdown");

    function updateCountdown() {

      const target =
        new Date("2026-05-22T15:00:00-04:00");

      const now =
        new Date();

      const diff =
        target - now;

      if (diff <= 0) {

        countdown.textContent =
          "Trips are open!";

        return;

      }

      const days =
        Math.floor(diff / (1000 * 60 * 60 * 24));

      const hours =
        Math.floor((diff / (1000 * 60 * 60)) % 24);

      const mins =
        Math.floor((diff / (1000 * 60)) % 60);

      countdown.textContent =
        `Opens in ${days}d ${hours}h ${mins}m`;

    }

    updateCountdown();

    setInterval(updateCountdown, 60000);

    // -------------------------
    // GRID
    // -------------------------

    function getGridPos(gridX, gridY) {

      const cellWidth =
        canvas.width / 3;

      const cellHeight =
        canvas.height / 3;

      return {

        x:
          gridX * cellWidth + cellWidth / 2,

        y:
          gridY * cellHeight + cellHeight / 2

      };

    }

    // -------------------------
    // PLAYER
    // -------------------------

    const player = {

      x: canvas.width / 2,
      y: canvas.height / 2,

      size: 72,

      speed: 4,

      frame: 0,
      idle: 0

    };

    // -------------------------
    // BUSHES
    // -------------------------

    const bushes = [];

    for (let i = 0; i < 34; i++) {

      bushes.push({

        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,

        size: 48 + Math.random() * 14,

        alpha: 0.28 + Math.random() * 0.12

      });

    }

    // -------------------------
    // INPUT
    // -------------------------

    const keys = {};

    window.addEventListener("keydown", e => {

      keys[e.key] = true;

    });

    window.addEventListener("keyup", e => {

      keys[e.key] = false;

    });

    document.querySelectorAll("#dpad button")
      .forEach(btn => {

        btn.addEventListener("touchstart", e => {

          e.preventDefault();

          keys[btn.dataset.dir] = true;

        });

        btn.addEventListener("touchend", e => {

          e.preventDefault();

          keys[btn.dataset.dir] = false;

        });

      });

    // -------------------------
    // MOBILE MENU
    // -------------------------

    const menuButton =
      document.getElementById("menu-button");

    const sidebar =
      document.getElementById("sidebar");

    menuButton.addEventListener("click", () => {

      sidebar.classList.toggle("open");

      if (sidebar.classList.contains("open")) {

        menuButton.textContent = "Back";

      } else {

        menuButton.textContent = "Trips";

      }

    });

    // -------------------------
    // HELPERS
    // -------------------------

    function isNear(x1, y1, x2, y2) {

      return Math.hypot(
        x1 - x2,
        y1 - y2
      ) < 94;

    }

    function drawShadow(x, y, width = 34) {

      ctx.save();

      ctx.globalAlpha = 0.18;

      ctx.fillStyle = "#000";

      ctx.beginPath();

      ctx.ellipse(
        x,
        y + 32,
        width,
        10,
        0,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.restore();

    }

    // -------------------------
    // 2x2 SPRITE DRAWER
    // -------------------------

    function drawSprite2x2(
      img,
      frame,
      x,
      y,
      size
    ) {

      if (!img) return;

      const cols = 2;
      const rows = 2;

      const frameIndex =
        Math.floor(frame) % 4;

      const fw =
        img.width / cols;

      const fh =
        img.height / rows;

      const sx =
        (frameIndex % cols) * fw;

      const sy =
        Math.floor(frameIndex / cols) * fh;

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

    }

    // -------------------------
    // UPDATE
    // -------------------------

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

      // WRAP

      if (player.x < -20)
        player.x = canvas.width;

      if (player.x > canvas.width + 20)
        player.x = 0;

      if (player.y < -20)
        player.y = canvas.height;

      if (player.y > canvas.height + 20)
        player.y = 0;

      player.idle += 0.08;

      player.frame =
        (player.frame + 0.14) % 4;

    }

    // -------------------------
    // DRAW
    // -------------------------

    function draw() {

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // BUSHES

      if (images.bush) {

        bushes.forEach(bush => {

          ctx.save();

          ctx.globalAlpha = bush.alpha;

          drawSprite2x2(

            images.bush,

            0,

            bush.x,
            bush.y,

            bush.size

          );

          ctx.restore();

        });

      }

      // RESET SIDEBAR

      places.forEach(place => {

        place.sidebarElement
          .classList.remove("active");

      });

      const drawables = [];

      // SCENERY

      scenery.forEach(item => {

        const pos =
          getGridPos(
            item.gridX,
            item.gridY
          );

        const touching =
          isNear(
            player.x,
            player.y,
            pos.x,
            pos.y
          );

        item.frame = touching
          ? (item.frame + item.frameSpeed) % 4
          : 0;

        drawables.push({

          y: pos.y,

          draw: () => {

            drawSprite2x2(

              item.img,

              item.frame,

              pos.x,
              pos.y,

              86

            );

          }

        });

      });

      // INTERACTIVE

      places.forEach(place => {

        const pos =
          getGridPos(
            place.gridX,
            place.gridY
          );

        const touching =
          isNear(
            player.x,
            player.y,
            pos.x,
            pos.y
          );

        place.hover =
          (place.hover || 0) + 0.05;

        if (touching) {

          place.frame =
            (place.frame + place.frameSpeed) % 4;

          place.sidebarElement
            .classList.add("active");

        } else {

          place.frame =
            place.defaultFrame || 0;

        }

        const float =
          Math.sin(place.hover) * 3;

        drawables.push({

          y: pos.y,

          draw: () => {

            drawShadow(
              pos.x,
              pos.y,
              38
            );

            drawSprite2x2(

              place.img,

              place.frame,

              pos.x,
              pos.y + float,

              88

            );

          }

        });

      });

      // DUCK

      const duckBounce =
        Math.sin(player.idle) * 2;

      drawables.push({

        y: player.y,

        draw: () => {

          drawShadow(
            player.x,
            player.y,
            26
          );

          drawSprite2x2(

            images.duck,

            player.frame,

            player.x,
            player.y + duckBounce,

            player.size

          );

        }

      });

      // DEPTH SORT

      drawables.sort((a, b) => a.y - b.y);

      drawables.forEach(item => item.draw());

    }

    // -------------------------
    // CLICKING
    // -------------------------

    function activateNearbyPlace() {

      for (const place of places) {

        const pos =
          getGridPos(
            place.gridX,
            place.gridY
          );

        if (
          isNear(
            player.x,
            player.y,
            pos.x,
            pos.y
          )
        ) {

          window.location.href =
            place.url;

          return;

        }

      }

    }

    canvas.addEventListener(
      "click",
      activateNearbyPlace
    );

    window.addEventListener("keydown", e => {

      if (e.key === "Enter") {

        activateNearbyPlace();

      }

    });

    // -------------------------
    // LOOP
    // -------------------------

    function loop() {

      update();
      draw();

      requestAnimationFrame(loop);

    }

    loop();

  }

});