document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 960;
  canvas.height = 720;

  // IMAGES

  function load(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  const duckImg = load("./assets/duck.png");

  const troutImg = load("./assets/trout.png");
  const willowImg = load("./assets/willow.png");
  const puffinImg = load("./assets/puffin.png");
  const campImg = load("./assets/campsite.png");

  const treeImg = load("./assets/tree.png");
  const highpeakImg = load("./assets/highpeak.png");

  const bushImg = load("./assets/bush.png");

  // DESTINATIONS

  const places = [

    {
      name: "Beaverkill",
      img: troutImg,
      url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1591163723#gid=1591163723",
      gridX: 0,
      gridY: 2,
      frameCount: 4,
      shadow: true
    },

    {
      name: "Adirondacks",
      img: highpeakImg,
      url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1346249244#gid=1346249244",
      gridX: 2,
      gridY: 2,
      frameCount: 6,
      shadow: true
    },

    {
      name: "Acadia",
      img: puffinImg,
      url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1978556881#gid=1978556881",
      gridX: 0,
      gridY: 0,
      frameCount: 4,
      shadow: true
    },

    {
      name: "Campsite",
      img: campImg,
      url: "https://calendar.google.com/calendar/u/0?cid=YmIzYjY5ZDk2OGE5MDg3NDUxMjJiOTkxZWQ3ZjRkMzdmY2JkNGJjNWQ5ZWRiNGIwOGI2NjYzYWI3NTJhYzRhNEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t",
      gridX: 1,
      gridY: 1,
      frameCount: 4,
      shadow: true
    }

  ];

  // SCENIC

  const scenery = [

    {
      img: willowImg,
      gridX: 2,
      gridY: 0,
      frameCount: 4
    },

    {
      img: treeImg,
      gridX: 1,
      gridY: 0,
      frameCount: 4
    }

  ];

  // SIDEBAR LINKS

  const tripList = document.getElementById("trip-list");

  places.forEach((place, index) => {

    const li = document.createElement("li");

    li.textContent = place.name;

    li.addEventListener("click", () => {
      window.location.href = place.url;
    });

    place.sidebarElement = li;

    tripList.appendChild(li);

  });

  // COUNTDOWN

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

    countdown.textContent =
      `Opens in ${days}d ${hours}h ${mins}m`;

  }

  updateCountdown();
  setInterval(updateCountdown, 60000);

  // GRID

  const GRID = {
    cols: 3,
    rows: 3
  };

  function getGridPos(gridX, gridY) {

    const cellWidth = canvas.width / GRID.cols;
    const cellHeight = canvas.height / GRID.rows;

    return {
      x: gridX * cellWidth + cellWidth / 2,
      y: gridY * cellHeight + cellHeight / 2
    };

  }

  // PLAYER

  const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,

    size: 78,

    speed: 4,

    frame: 0,
    idle: 0
  };

  // BUSHES

  const bushes = [];

  for (let i = 0; i < 42; i++) {

    bushes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
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

    btn.addEventListener("touchstart", e => {
      e.preventDefault();
      keys[btn.dataset.dir] = true;
    });

    btn.addEventListener("touchend", e => {
      e.preventDefault();
      keys[btn.dataset.dir] = false;
    });

  });

  // MOBILE MENU

  const menuButton = document.getElementById("menu-button");
  const backButton = document.getElementById("back-button");
  const sidebar = document.getElementById("sidebar");

  menuButton.addEventListener("click", () => {
    sidebar.classList.add("open");
  });

  backButton.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });

  // HELPERS

  function isNear(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2) < 90;
  }

  function drawSprite(
    img,
    frame,
    x,
    y,
    size,
    frameCount = 4
  ) {

    const fw = img.width / frameCount;
    const fh = img.height;

    const fx = Math.floor(frame % frameCount) * fw;

    ctx.drawImage(
      img,
      fx,
      0,
      fw,
      fh,
      x,
      y,
      size,
      size
    );

  }

  // UPDATE

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

    // wrap

    if (player.x < -20) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -20;

    if (player.y < -20) player.y = canvas.height;
    if (player.y > canvas.height) player.y = -20;

    player.idle += 0.08;
    player.frame += 0.16;

  }

  // DRAW

  function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // bushes

    ctx.globalAlpha = 0.22;

    bushes.forEach(b => {

      ctx.drawImage(
        bushImg,
        b.x,
        b.y,
        62,
        62
      );

    });

    ctx.globalAlpha = 1;

    // reset active links

    places.forEach(place => {
      place.sidebarElement.classList.remove("active");
    });

    // scenery

    scenery.forEach(item => {

      const pos = getGridPos(item.gridX, item.gridY);

      const touching = isNear(
        player.x,
        player.y,
        pos.x,
        pos.y
      );

      if (touching) {
        item.frame = (item.frame || 0) + 0.14;
      } else {
        item.frame = 0;
      }

      drawSprite(
        item.img,
        item.frame || 0,
        pos.x - 42,
        pos.y - 42,
        84,
        item.frameCount
      );

    });

    // interactive places

    places.forEach(place => {

      const pos = getGridPos(place.gridX, place.gridY);

      const touching = isNear(
        player.x,
        player.y,
        pos.x,
        pos.y
      );

      if (touching) {

        place.frame = (place.frame || 0) + 0.18;

        place.sidebarElement.classList.add("active");

      } else {

        place.frame = 0;

      }

      // shadow only on clickable items

      ctx.shadowColor = "rgba(0,0,0,0.16)";
      ctx.shadowBlur = 14;

      drawSprite(
        place.img,
        place.frame || 0,
        pos.x - 42,
        pos.y - 42,
        84,
        place.frameCount
      );

      ctx.shadowBlur = 0;

    });

    // duck

    const bounce = Math.sin(player.idle) * 2;

    drawSprite(
      duckImg,
      player.frame,
      player.x - 36,
      player.y - 36 + bounce,
      72,
      4
    );

  }

  // CLICKING

  canvas.addEventListener("click", () => {

    places.forEach(place => {

      const pos = getGridPos(place.gridX, place.gridY);

      if (
        isNear(
          player.x,
          player.y,
          pos.x,
          pos.y
        )
      ) {

        window.location.href = place.url;

      }

    });

  });

  // LOOP

  function loop() {

    update();
    draw();

    requestAnimationFrame(loop);

  }

  loop();

});