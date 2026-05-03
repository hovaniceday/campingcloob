document.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 320;
  canvas.height = 240;

  // COUNTDOWN
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

  // IMAGES
  const duck = new Image(); duck.src = "./assets/duck.png";
  const boat = new Image(); boat.src = "./assets/boat.png";
  const trout = new Image(); trout.src = "./assets/trout.png";
  const willow = new Image(); willow.src = "./assets/willow.png";
  const tree = new Image(); tree.src = "./assets/tree.png";
  const camp = new Image(); camp.src = "./assets/campsite.png";
  const bush = new Image(); bush.src = "./assets/bush.png";

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

  const player = { x:160, y:120, f:0 };

  const places = [
    { gx:2,gy:0,img:boat,i:0,f:0 },
    { gx:0,gy:2,img:trout,i:1,f:0 },
    { gx:2,gy:2,img:willow,i:2,f:0 },
    { gx:1,gy:1,img:camp,i:3,f:0 }
  ];

  const env = [
    { gx:1,gy:0,img:tree,f:0 }
  ];

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

    const drawables=[];

    env.forEach(o=>{
      const p=pos(o.gx,o.gy);
      if(near(player,p)) o.f=(o.f+0.2)%4; else o.f=0;

      drawables.push({
        y:p.y,
        d:()=>sprite(o.img,Math.floor(o.f),p.x,p.y)
      });
    });

    places.forEach(o=>{
      const p=pos(o.gx,o.gy);
      const n=near(player,p);

      if(n) o.f=(o.f+0.2)%4; else o.f=0;

      drawables.push({
        y:p.y,
        d:()=>sprite(o.img,Math.floor(o.f),p.x,p.y)
      });
    });

    drawables.push({
      y:player.y,
      d:()=>sprite(duck,player.f=(player.f+0.1)%4,player.x,player.y)
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

});