document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 960;
  canvas.height = 720;

  // -------------------
  // COUNTDOWN
  // -------------------

  const countdownEl =
    document.getElementById("countdown");

  const launchDate =
    new Date("May 22, 2026 15:00:00 GMT-0400");

  function updateCountdown() {

    const now = new Date();
    const diff = launchDate - now;

    if (diff <= 0) {

      countdownEl.textContent =
        "Trips are now open!";

      return;

    }

    const d =
      Math.floor(diff / (1000 * 60 * 60 * 24));

    const h =
      Math.floor((diff / (1000 * 60 * 60)) % 24);

    const m =
      Math.floor((diff / (1000 * 60)) % 60);

    countdownEl.textContent =
      `Opens in ${d}d ${h}h ${m}m`;

  }

  updateCountdown();

  setInterval(updateCountdown, 1000);

  // -------------------
  // IMAGES
  // -------------------

  const images = {};

  const imageList = [

    ["duck", "./assets/duck.png"],
    ["trout", "./assets/trout.png"],
    ["camp", "./assets/campsite.png"],
    ["puffin", "./assets/puffin.png"],

    ["highpeak", "./assets/highpeak.png"],

    ["tree", "./assets/tree.png"],
    ["willow", "./assets/willow.png"],

    ["bush", "./assets/bush.png"]

  ];

  Promise.all(

    imageList.map(([name, src]) => {

      return new Promise(resolve => {

        const img = new Image();

        img.src = src;

        img.onload = () => {

          images[name] = img;

          resolve();

        };

        img.onerror = () => {

          console.log("Missing:", src);

          resolve();

        };

      });

    })

  ).then(startGame);

  // -------------------
  // GAME
  // -------------------

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

    // SIDEBAR

    const list =
      document.getElementById("trip-list");

    DESTS.forEach((d, i) => {

      const li =
        document.createElement("li");

      li.textContent = d.name;

      li.addEventListener("click", () => {

        window.open(d.url, "_blank");

      });

      list.appendChild(li);

    });

    const sidebarItems =
      document.querySelectorAll("#trip-list li");

    // GRID

    const GRID = 3;

    function gridPos(gx, gy) {

      return {

        x: (gx + 0.5) * (canvas.width / GRID),
        y: (gy + 0.5) * (canvas.height / GRID)

      };

    }

    function isNear(a, b) {

      return Math.hypot(
        a.x - b.x,
        a.y - b.y
      ) < 90;

    }

    // PLAYER

    const player = {

      x: canvas.width / 2,
      y: canvas.height / 2,

      frame: 0,
      idle: 0,

      size: 88

    };

    // CLICKABLE PLACES

    const places = [

      {
        gx: 0,
        gy: 2,

        img: images.trout,

        index: 0,

        frame: 0,
        hover: 0,

        frames: 4
      },

      {
        gx: 2,
        gy: 2,

        img: images.highpeak,

        index: 1,

        frame: 0,
        hover: 0,

        frames: 6
      },

      {
        gx: 2,
        gy: 0,

        img: images.puffin,

        index: 2,

        frame: 0,
        hover: 0,

        frames: 4
      },

      {
        gx: 1,
        gy: 1,

        img: images.camp,

        index: 3,

        frame: 0,
        hover: 0,

        frames: 4
      }

    ];

    // SCENERY

    const scenery = [

      {
        gx: 1,
        gy: 0,

        img: images.tree,

        frame: 0,

        frames: 4
      },

      {
        gx: 1,
        gy: 2,

        img: images.willow,

        frame: 0,

        frames: 4
      }

    ];

    // BUSHES

    const bushes = [];

    for (let i = 0; i < 38; i++) {

      bushes.push({

        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,

        size: 42 + Math.random() * 12,
        alpha: 0.12 + Math.random() * 0.1

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

    document.querySelectorAll("#dpad button")
      .forEach(btn => {

        btn.addEventListener("touchstart", () => {
          keys[btn.dataset.dir] = true;
        });

        btn.addEventListener("touchend", () => {
          keys[btn.dataset.dir] = false;
        });

      });

    // DRAWING

    function drawShadow(x, y, width = 40) {

      ctx.globalAlpha = 0.12;

      ctx.fillStyle = "black";

      ctx.beginPath();

      ctx.ellipse(
        x,
        y + 34,
        width,
        12,
        0,
        0,
        Math.PI * 2
      );

      ctx.fill();

      ctx.globalAlpha = 1;

    }

    function drawSprite(
      img,
      frame,
      totalFrames,
      x,
      y,
      size = 88
    ) {

      if (!img) return;

      const cols = 2;

      const rows =
        Math.ceil(totalFrames / cols);

      const fw =
        img.width / cols;

      const fh =
        img.height / rows;

      const fx =
        (frame % cols) * fw;

      const fy =
        Math.floor(frame / cols) * fh;

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

      if (keys["ArrowUp"] || keys["up"]) {
        player.y -= 4;
      }

      if (keys["ArrowDown"] || keys["down"]) {
        player.y += 4;
      }

      if (keys["ArrowLeft"] || keys["left"]) {
        player.x -= 4;
      }

      if (keys["ArrowRight"] || keys["right"]) {
        player.x += 4;
      }

      // WRAP

      if (player.x < 0)
        player.x = canvas.width;

      if (player.x > canvas.width)
        player.x = 0;

      if (player.y < 0)
        player.y = canvas.height;

      if (player.y > canvas.height)
        player.y = 0;

      player.idle += 0.08;

    }

    // DRAW

    function draw() {

      ctx.fillStyle = "#b7e07a";

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // BUSHES

      bushes.forEach(b => {

        ctx.globalAlpha = b.alpha;

        drawSprite(
          images.bush,
          0,
          1,
          b.x,
          b.y,
          b.size
        );

      });

      ctx.globalAlpha = 1;

      // RESET SIDEBAR

      sidebarItems.forEach(li => {
        li.classList.remove("active");
      });

      const drawables = [];

      // SCENERY

      scenery.forEach(obj => {

        const pos =
          gridPos(obj.gx, obj.gy);

        if (isNear(player, pos)) {

          obj.frame =
            (obj.frame + 0.12) % obj.frames;

        } else {

          obj.frame = 0;

        }

        drawables.push({

          y: pos.y,

          draw: () => {

            drawSprite(
              obj.img,
              Math.floor(obj.frame),
              obj.frames,
              pos.x,
              pos.y
            );

          }

        });

      });

      // PLACES

      places.forEach(obj => {

        const pos =
          gridPos(obj.gx, obj.gy);

        const touching =
          isNear(player, pos);

        obj.hover += 0.05;

        const float =
          Math.sin(obj.hover) * 4;

        if (touching) {

          obj.frame =
            (obj.frame + 0.16) % obj.frames;

          sidebarItems[obj.index]
            .classList.add("active");

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

              obj.frames,

              pos.x,
              pos.y + float,

              92

            );

          }

        });

      });

      // PLAYER

      const bounce =
        Math.sin(player.idle) * 3;

      player.frame =
        (player.frame + 0.18) % 4;

      drawables.push({

        y: player.y,

        draw: () => {

          drawShadow(
            player.x,
            player.y,
            26
          );

          drawSprite(

            images.duck,

            Math.floor(player.frame),

            4,

            player.x,
            player.y + bounce,

            player.size

          );

        }

      });

      // SORT

      drawables.sort((a, b) => a.y - b.y);

      drawables.forEach(d => d.draw());

    }

    // CLICK INTERACTION

    function activateNearbyLink() {

      places.forEach(obj => {

        const pos =
          gridPos(obj.gx, obj.gy);

        if (isNear(player, pos)) {

          window.open(
            DESTS[obj.index].url,
            "_blank"
          );

        }

      });

    }

    canvas.addEventListener(
      "click",
      activateNearbyLink
    );

    window.addEventListener("keydown", e => {

      if (e.key === "Enter") {

        activateNearbyLink();

      }

    });

    // MOBILE MENU

    const sidebar =
      document.getElementById("sidebar");

    const menuBtn =
      document.getElementById("menu-button");

    const backBtn =
      document.getElementById("back-button");

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