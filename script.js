console.log("JS LOADED");

document.addEventListener("DOMContentLoaded", () => {

  console.log("DOM READY");

  const DESTINATIONS = [
    {
      name: "Adirondacks",
      icon: "🏕",
      url: "https://example.com"
    },
    {
      name: "Catskills",
      icon: "🐱",
      url: "https://example.com"
    }
  ];

  const list = document.getElementById("trip-list");

  if (!list) {
    console.error("trip-list not found");
    return;
  }

  DESTINATIONS.forEach(dest => {
    const li = document.createElement("li");
    li.textContent = dest.icon + " " + dest.name;
    li.onclick = () => window.open(dest.url, "_blank");
    list.appendChild(li);
  });

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 320;
  canvas.height = 240;

  const player = {
    x: 160,
    y: 120,
    size: 10,
    speed: 2
  };

  const keys = {};

  window.addEventListener("keydown", e => keys[e.key] = true);
  window.addEventListener("keyup", e => keys[e.key] = false);

  function update() {
    if (keys["ArrowUp"] || keys["w"]) player.y -= player.speed;
    if (keys["ArrowDown"] || keys["s"]) player.y += player.speed;
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;
  }

  function draw() {
    ctx.fillStyle = "#1c2b22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#c8ff78";
    ctx.fillRect(player.x, player.y, player.size, player.size);
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();

});