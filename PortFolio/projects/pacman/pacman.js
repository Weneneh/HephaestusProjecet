const canvas = document.getElementById('pacman');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('gameover');

const grid = 20;
let score = 0;
let gameOver = false;

// Laberinto (15x20) - 1 = muro, 0 = espacio libre
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1,0,0,1],
  [1,0,1,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Pac-Man
const pac = { x: 1*grid + grid/2, y:1*grid + grid/2, r: grid/2, dx:0, dy:0, mouth:0.25, mouthOpen:true, dir:'right' };

// Dots
let dots = [];
for(let row=0; row<map.length; row++){
  for(let col=0; col<map[row].length; col++){
    if(map[row][col]===0){
      dots.push({x: col*grid+grid/2, y: row*grid+grid/2, eaten:false, power:false});
    }
  }
}
// Random power-ups
for(let i=0;i<5;i++){
  const idx = Math.floor(Math.random()*dots.length);
  dots[idx].power=true;
}

// Fantasmas centrados en celdas libres
let ghosts = [
  {x: 18*grid + grid/2, y: 1*grid + grid/2, dx:0.5, dy:0, color:'#FF0000'},   // rojo
  {x: 18*grid + grid/2, y: 13*grid + grid/2, dx:0.5, dy:0, color:'#00FFFF'},  // cian
  {x: 1*grid + grid/2, y: 13*grid + grid/2, dx:0.5, dy:0, color:'#FF00FF'},   // magenta
];

// Funciones
function drawWalls(){
  ctx.fillStyle="#222";
  for(let row=0; row<map.length; row++){
    for(let col=0; col<map[row].length; col++){
      if(map[row][col]===1){
        ctx.fillRect(col*grid, row*grid, grid, grid);
      }
    }
  }
}

function drawDots(){
  dots.forEach(dot=>{
    if(!dot.eaten){
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.power?5:3,0,Math.PI*2);
      ctx.fillStyle=dot.power?"#FF4500":"#FFFFFF";
      ctx.fill();
      ctx.closePath();

      // Comer dot
      const dist = Math.hypot(pac.x-dot.x, pac.y-dot.y);
      if(dist<pac.r){
        dot.eaten=true;
        score += dot.power?5:1;
        scoreDisplay.textContent=`Score: ${score}`;
      }
    }
  });
}

function drawPacman(){
  let start=0,end=0;
  switch(pac.dir){
    case 'right': start=pac.mouth*Math.PI; end=(2-pac.mouth)*Math.PI; break;
    case 'left': start=(1+pac.mouth)*Math.PI; end=(1-pac.mouth)*Math.PI; break;
    case 'up': start=(1.5+pac.mouth)*Math.PI; end=(1.5-pac.mouth)*Math.PI; break;
    case 'down': start=(0.5+pac.mouth)*Math.PI; end=(0.5-pac.mouth)*Math.PI; break;
  }
  ctx.beginPath();
  ctx.moveTo(pac.x,pac.y);
  ctx.arc(pac.x,pac.y,pac.r,start,end);
  ctx.lineTo(pac.x,pac.y);
  ctx.fillStyle="#FFD700";
  ctx.fill();
  ctx.closePath();

  pac.mouthOpen?pac.mouth+=0.05:pac.mouth-=0.05;
  if(pac.mouth>0.3 || pac.mouth<0.05) pac.mouthOpen=!pac.mouthOpen;
}

function collides(x,y){
  const col = Math.floor(x/grid);
  const row = Math.floor(y/grid);
  if(row<0 || row>=map.length || col<0 || col>=map[0].length) return true;
  return map[row][col]===1;
}

// Movimiento fantasmas simple evitando muros
function moveGhosts(){
  ghosts.forEach(g=>{
    if(gameOver) return;
    const dx = pac.x - g.x;
    const dy = pac.y - g.y;
    let stepX = dx!==0?Math.sign(dx)*0.5:0;
    let stepY = dy!==0?Math.sign(dy)*0.5:0;

    if(!collides(g.x+stepX, g.y)) g.x += stepX;
    if(!collides(g.x, g.y+stepY)) g.y += stepY;

    // Colisión con Pac-Man
    if(Math.hypot(g.x-pac.x, g.y-pac.y) < pac.r){
      gameOver=true;
      gameOverDisplay.style.display='block';
      pac.dx=0; pac.dy=0;
    }
  });
}

// Update
function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawWalls();
  drawDots();
  drawPacman();
  moveGhosts();

  // Mover Pac-Man con colisión
  let nextX = pac.x + pac.dx;
  let nextY = pac.y + pac.dy;
  if(!collides(nextX, pac.y)) pac.x=nextX;
  if(!collides(pac.x, nextY)) pac.y=nextY;

  requestAnimationFrame(update);
}

update();

// Reinicio con R
function resetGame(){
  pac.x=1*grid + grid/2; pac.y=1*grid + grid/2; pac.dx=0; pac.dy=0; pac.dir='right'; pac.mouth=0.25; pac.mouthOpen=true;
  ghosts = [
    {x: 18*grid + grid/2, y: 1*grid + grid/2, dx:0.5, dy:0, color:'#FF0000'},
    {x: 18*grid + grid/2, y: 13*grid + grid/2, dx:0.5, dy:0, color:'#00FFFF'},
    {x: 1*grid + grid/2, y: 13*grid + grid/2, dx:0.5, dy:0, color:'#FF00FF'},
  ];
  dots.forEach(dot=>dot.eaten=false);
  for(let i=0;i<5;i++){dots[Math.floor(Math.random()*dots.length)].power=true;}
  score=0; scoreDisplay.textContent=`Score: ${score}`;
  gameOver=false; gameOverDisplay.style.display='none';
}

// Controles
document.addEventListener('keydown', e=>{
  if(e.key.toLowerCase()==='r'){resetGame(); return;}
  if(gameOver) return;
  switch(e.key){
    case 'ArrowUp': pac.dx=0; pac.dy=-2; pac.dir='up'; break;
    case 'ArrowDown': pac.dx=0; pac.dy=2; pac.dir='down'; break;
    case 'ArrowLeft': pac.dx=-2; pac.dy=0; pac.dir='left'; break;
    case 'ArrowRight': pac.dx=2; pac.dy=0; pac.dir='right'; break;
  }
});
