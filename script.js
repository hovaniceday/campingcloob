document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 320;
  canvas.height = 240;

  // -----------------------
  // COUNTDOWN
  // -----------------------
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

    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff / (1000*60*60)) % 24);
    const m = Math.floor((diff / (1000*60)) % 60);

    countdownEl.textContent = `Opens in ${d}d ${h}h ${m}m`;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // -----------------------
  // IMAGES
  // -----------------------
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
    loadImage("boat", "./assets/boat.png"),
    loadImage("trout", "./assets/trout.png"),
    loadImage("willow", "./assets/willow.png"),
    loadImage("tree", "./assets/tree.png"),
    loadImage("camp", "./assets/campsite.png"),
    loadImage("bush", "./assets/bush.png")
  ]).then(results => {

    results.forEach(r => images[r.name] = r.img);

    startGame();

  });

  // -----------------------
  // GAME STARTS AFTER LOAD
  // -----------------------
  function startGame() {

    const DESTS = [
      { name: "Acadia", url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1978556881" },
      { name: "Beaverkill", url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1591163723" },
      { name: "Adirondacks", url: "https://docs.google.com/spreadsheets/d/1Ou1Y6CII_Idb5882TLrGZkmHyzh2Zs7niya8VA7Ga8w/edit?gid=1346249244" },
      { name: "Campsite", url: "https://calendar.google.com" }
    ];

    const list = document.getElementById("trip-list");

    DESTS.forEach((d,i)=>{
      const li = document.createElement("li");
      li.textContent = d.name;
      li.onclick = () => {
        if (!isUnlocked) return;
        window.open(d.url);
      };
      list.appendChild(li);
    });

    const GRID = 3;

    function pos(gx,gy){
      return {
        x: (gx+0.5)*(canvas.width/GRID),
        y: (gy+0.5)*(canvas.height/GRID)
      };
    }

    function near(a,b){
      return Math.hypot(a.x-b.x,a.y-b.y)<50;
    }

    const player = {
      x:160,
      y:120,
      frame:0,
      idle:0
    };

    const places = [
      { gx:2,gy:0,img:images.boat,i:0,f:0,idle:0 },
      { gx:0,gy:2,img:images.trout,i:1,f:0,idle:0 },
      { gx:2,gy:2,img:images.willow,i:2,f:0,idle:0 },
      { gx:1,gy:1,img:images.camp,i:3,f:0,idle:0 }
    ];

    const env = [
      { gx:1,gy:0,img:images.tree,f:0 }
    ];

    // 🌿 RANDOM BUSHES (soft + clustered)
    const bushes = [];
    for (let i = 0; i < 30; i++) {
      bushes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 14 + Math.random() * 10,
        alpha: 0.4 + Math.random() * 0.3
      });
    }

    const keys = {};
    onkeydown=e=>keys[e.key]=1;
    onkeyup=e=>keys[e.key]=0;

    function sprite(img,f,x,y){
      const fw=img.width/2,fh=img.height/2;
      ctx.drawImage(img,(f%2)*fw,Math.floor(f/2)*fh,fw,fh,x-16,y-16,32,32);
    }

    function draw(){

      ctx.fillStyle="#b7e07a";
      ctx.fillRect(0,0,320,240);

      // 🌿 bushes (BACK LAYER)
      bushes.forEach(b=>{
        ctx.globalAlpha = b.alpha;
        ctx.drawImage(images.bush, b.x, b.y, b.size, b.size);
      });
      ctx.globalAlpha = 1;

      const drawables=[];

      // 🌳 tree
      env.forEach(o=>{
        const p=pos(o.gx,o.gy);
        if(near(player,p)) o.f=(o.f+0.2)%4; else o.f=0;

        drawables.push({
          y:p.y,
          d:()=>sprite(o.img,Math.floor(o.f),p.x,p.y)
        });
      });

      // 🎯 places
      places.forEach(o=>{
        const p=pos(o.gx,o.gy);
        const n=near(player,p);

        o.idle += 0.05;
        const float = Math.sin(o.idle) * 2;

        if(n) o.f=(o.f+0.2)%4; else o.f=0;

        drawables.push({
          y:p.y,
          d:()=>sprite(o.img,Math.floor(o.f),p.x,p.y + float)
        });
      });

      // 🦆 duck (FIXED animation)
      player.idle += 0.08;
      player.frame = (player.frame + 0.15) % 4;
      const bounce = Math.sin(player.idle) * 2;

      drawables.push({
        y:player.y,
        d:()=>sprite(images.duck,Math.floor(player.frame),player.x,player.y + bounce)
      });

      drawables.sort((a,b)=>a.y-b.y).forEach(o=>o.d());
    }

    function update(){
      if(keys.ArrowUp) player.y-=2;
      if(keys.ArrowDown) player.y+=2;
      if(keys.ArrowLeft) player.x-=2;
      if(keys.ArrowRight) player.x+=2;

      player.x=(player.x+320)%320;
      player.y=(player.y+240)%240;
    }

    canvas.onclick=()=>{
      places.forEach(o=>{
        const p=pos(o.gx,o.gy);
        if(near(player,p) && isUnlocked){
          window.open(DESTS[o.i].url);
        }
      });
    };

    const sidebar = document.getElementById("sidebar");
    const btn = document.getElementById("menu-button");
    const back = document.getElementById("back-button");

    btn.onclick = () => sidebar.classList.toggle("open");
    back.onclick = () => sidebar.classList.remove("open");

    function loop(){
      update();
      draw();
      requestAnimationFrame(loop);
    }

    loop();
  }

});