document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 320;
  canvas.height = 240;

  // --------------------
  // COUNTDOWN
  // --------------------

  const countdownEl = document.getElementById("countdown");

  const launchDate = new Date("May 22, 2026 15:00:00 GMT-0400");

  let isUnlocked = false;

  function updateCountdown() {

    const now = new Date();
    const diff = launchDate - now;

    if (diff <= 0) {
      countdownEl.textContent = "Trips are now open!";
      isUnlocked = true;
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);

    countdownEl.textContent = `Opens in ${d}d ${h}h ${m}m`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // --------------------
  // IMAGES
  // --------------------

  const images = {};

  function loadImage(name, src) {
    return new Promise(resolve => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve({ name, img });
    });
  }

  Promise.all([

    loadImage("duck", "./assets/duck.png"),
    loadImage("trout", "./assets/trout.png"),
    loadImage("camp", "./assets/campsite.png"),
    loadImage("highpeak", "./assets/highpeak.png"),
    loadImage("puffin", "./assets/puffin.png"),

    loadImage("tree", "./assets/tree.png"),
    loadImage("willow", "./assets/willow.png"),
    loadImage("boat", "./assets/boat.png"),

    loadImage("bush", "./assets/bush.png")

  ]).then(results => {

    results.forEach(r => {
      images[r.name] = r.img;
    });

    startGame();

  });

  // --------------------
  // GAME
  // --------------------

  function startGame() {

    const DESTS = [
      {
        name: "Beaverkill",
        url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1591163723#gid=1591163723"
      },
      {
        name: "Adirondacks",
        url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1346249244#gid=1346249244"
      },
      {
        name: "Acadia",
        url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1978556881#gid=1978556881"
      },
      {
        name: "Campsite",
        url: "https://calendar.google.com/calendar/u/0?cid=YmIzYjY5ZDk2OGE5MDg3NDUxMjJiOTkxZWQ3ZjRkMzdmY2JkNGJjNWQ5ZWRiNGIwOGI2NjYzYWI3NTJhYzRhNEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
      }
    ];

    // SIDEBAR LINKS

    const list = document.getElementById("trip-list");

    DESTS.forEach((d, i) => {

      const li = document.createElement("li");

      li.textContent = d.name;

      li.onclick = () => {

        if (!isUnlocked) return;

        window.open(d.url, "_blank");

      };

      list.appendChild(li);

    });

    const sidebarItems = document.querySelectorAll("#trip-list li");

    // GRID

    const GRID = 3;

    function gridPos(gx, gy) {

      return {
        x: (gx + 0.5) * (canvas.width / GRID),
        y: (gy + 0.5) * (canvas.height / GRID)
      };

    }

    function near(a, b) {

      return Math.hypot(a.x - b.x, a.y - b.y) < 46;

    }

    // PLAYER

    const player = {
      x: 160,
      y: 120,
      frame: 0,
      idle: 0
    };

    // INTERACTIVE

    const places = [

      {
        gx: 0,
        gy: 2,
        img: images.trout,
        index: 0,
        frame: 0,
        hover: 0
      },

      {
        gx: 2,
        gy: 2,
        img: images.highpeak,
        index: 1,
        frame: 0,
        hover: 0
      },

      {
        gx: 2,
        gy: 0,
        img: images.puffin,
        index: 2,
        frame: 0,
        hover: 0
      },

      {
        gx: 1,
        gy: 1,
        img: images.camp,
        index: 3,
        frame: 0,
        hover: 0
      }

    ];

    // SCENIC INTERACTIVE

    const environment = [

      {
        gx: 1,
        gy: 0,
        img: images.tree,
        frame: 0
      },

      {
        gx: 1,
        gy: 2,
        img: images.willow,
        frame: 0
      },

      {
        gx: 0,
        gy: 0,
        img: images.boat,
        frame: 0
      }

    ];

    // BUSHES

    const bushes = [];

    for (let i = 0; i < 34; i++) {

      bushes.push({

        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,

        size: 16 + Math.random() * 8,
        alpha: 0.35 + Math.random() * 0.25

      });

    }

    // INPUT

    const keys = {};

    window.addEventListener("keydown", e => {
      keys[e.key] = true;
    });

    window.addEventListener("keyup", e => {
      keys[e.key] = false;
    });

    document.querySelectorAll("#dpad button").forEach(btn => {

      btn.addEventListener("touchstart", () => {
        keys[btn.dataset.dir] = true;
      });

      btn.addEventListener("touchend", () => {
        keys[btn.dataset.dir] = false;
      });

    });

    // SPRITES

    function drawShadow(x, y, width = 18) {

      ctx.globalAlpha = 0.18;

      ctx.fillStyle = "black";

      ctx.beginPath();

      ctx.ellipse(x, y + 13, width, 5, 0, 0, Math.PI * 2);

      ctx.fill();

      ctx.globalAlpha = 1;

    }

    function drawSprite(img, frame, x, y, size = 32) {

      const cols = 2;

      const fw = img.width / cols;
      const fh = img.height / cols;

      const fx = (frame % cols) * fw;
      const fy = Math.floor(frame / cols) * fh;

      ctx.drawImage(
        img,
        fx,
        fy,
        fw,
        fh,
        x - size / 2,
        y - size / 2,
        size,
        size
      );

    }

    // UPDATE

    function update() {

      if (keys["ArrowUp"] || keys["up"]) player.y -= 2;
      if (keys["ArrowDown"] || keys["down"]) player.y += 2;
      if (keys["ArrowLeft"] || keys["left"]) player.x -= 2;
      if (keys["ArrowRight"] || keys["right"]) player.x += 2;

      player.x = (player.x + canvas.width) % canvas.width;
      player.y = (player.y + canvas.height) % canvas.height;

      player.idle += 0.08;

    }

    // DRAW

    function draw() {

      ctx.fillStyle = "#b7e07a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // bushes

      bushes.forEach(b => {

        ctx.globalAlpha = b.alpha;

        ctx.drawImage(images.bush, b.x, b.y, b.size, b.size);

      });

      ctx.globalAlpha = 1;

      sidebarItems.forEach(li => li.classList.remove("active"));

      const drawables = [];

      // ENVIRONMENT

      environment.forEach(obj => {

        const pos = gridPos(obj.gx, obj.gy);

        if (near(player, pos)) {
          obj.frame = (obj.frame + 0.15) % 4;
        } else {
          obj.frame = 0;
        }

        drawables.push({

          y: pos.y,

          draw: () => {

            drawShadow(pos.x, pos.y);

            drawSprite(
              obj.img,
              Math.floor(obj.frame),
              pos.x,
              pos.y
            );

          }

        });

      });

      // INTERACTIVE

      places.forEach(obj => {

        const pos = gridPos(obj.gx, obj.gy);

        const touching = near(player, pos);

        obj.hover += 0.05;

        const float = Math.sin(obj.hover) * 2;

        if (touching) {

          obj.frame = (obj.frame + 0.18) % 4;

          sidebarItems[obj.index].classList.add("active");

        } else {

          obj.frame = 0;

        }

        drawables.push({

          y: pos.y,

          draw: () => {

            drawShadow(pos.x, pos.y);

            drawSprite(
              obj.img,
              Math.floor(obj.frame),
              pos.x,
              pos.y + float
            );

          }

        });

      });

      // PLAYER

      const bounce = Math.sin(player.idle) * 2;

      player.frame = (player.frame + 0.12) % 4;

      drawables.push({

        y: player.y,

        draw: () => {

          drawShadow(player.x, player.y, 12);

          drawSprite(
            images.duck,
            Math.floor(player.frame),
            player.x,
            player.y + bounce
          );

        }

      });

      // DEPTH SORT

      drawables.sort((a, b) => a.y - b.y);

      drawables.forEach(d => d.draw());

    }

    // CLICK INTERACTION

    canvas.addEventListener("click", () => {

      if (!isUnlocked) return;

      places.forEach(obj => {

        const pos = gridPos(obj.gx, obj.gy);

        if (near(player, pos)) {

          window.open(
            DESTS[obj.index].url,
            "_blank"
          );

        }

      });

    });

    // MENU

    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menu-button");
    const backBtn = document.getElementById("back-button");

    menuBtn.onclick = () => {
      sidebar.classList.toggle("open");
    };

    backBtn.onclick = () => {
      sidebar.classList.remove("open");
    };

    // LOOP

    function loop() {

      update();
      draw();

      requestAnimationFrame(loop);

    }

    loop();

  }

});