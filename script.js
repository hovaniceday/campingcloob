cat << 'EOF' > script.js
const DESTINATIONS = [
  {
    name: "Adirondacks",
    icon: "🏕",
    url: "https://partiful.com/your-link-1"
  },
  {
    name: "Catskills",
    icon: "🐱",
    url: "https://partiful.com/your-link-2"
  },
  {
    name: "Fly Fishing",
    icon: "🎣",
    url: "https://partiful.com/your-link-3"
  },
  {
    name: "Logistics",
    icon: "🍄",
    url: "https://docs.google.com/your-sheet"
  }
];

const list = document.getElementById("trip-list");

DESTINATIONS.forEach(dest => {
  const li = document.createElement("li");
  li.textContent = dest.icon + " " + dest.name;
  li.onclick = () => window.open(dest.url, "_blank");
  list.appendChild(li);
});

const menuBtn = document.getElementById("menu-button");
const sidebar = document.getElementById("sidebar");

menuBtn.onclick = () => {
  sidebar.classList.toggle("open");
};

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
EOF