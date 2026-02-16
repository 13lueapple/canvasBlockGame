/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("main");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

class Block {
  constructor(color) {
    this.color = color;

    this.canvas = document.createElement('canvas');
    this.canvas.width = CELLSIZE;
    this.canvas.height = CELLSIZE;

    this.ctx = this.canvas.getContext('2d');

    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(0, 0, CELLSIZE, CELLSIZE);
  }

  /** @param {CanvasRenderingContext2D} ctx*/ 
  render(ctx, x, y) {
    ctx.drawImage(this.canvas, x, y)
  }
}

class Grid {
  constructor(color, lineWidth, numberX, numberY) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.color = color;
    this.lineWidth = lineWidth;
    this.numberX = numberX;
    this.numberY = numberY;

    this.canvas.width = CELLSIZE * this.numberX;
    this.canvas.height = CELLSIZE * this.numberY;

    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;

    this.ctx.beginPath();
    for(let x = 0; x < this.numberX + 1; x++) {
      this.ctx.moveTo(x * CELLSIZE, 0);
      this.ctx.lineTo(x * CELLSIZE, this.canvas.height);
      }

    for(let y = 0; y < this.numberY + 1; y++) {
      this.ctx.moveTo(0, y * CELLSIZE);
      this.ctx.lineTo(this.canvas.width, y * CELLSIZE);
      }
    this.ctx.stroke();
  }
  
  
  /** @param {CanvasRenderingContext2D} ctx*/ 
  render(ctx, x, y) {
    ctx.drawImage(this.canvas, x, y);
  }
}

class Spawner {
  constructor(color, lineWidth, width, height) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.color = color;
    this.lineWidth = lineWidth;

    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;

    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** @param {CanvasRenderingContext2D} ctx*/ 
  render(ctx, x, y) {
    ctx.drawImage(this.canvas, x, y);
  }
}

class MouseGrid {
  constructor(offsetX, offsetY, size) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.size = size;

    this.canvas.width = this.size * CELLSIZE;
    this.canvas.height = this.size * CELLSIZE;

    this.ctx.strokeStyle = 'grey';
    this.ctx.lineWidth = 2;

    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }
  /** @type {CanvasRenderingContext2D} */
  render(ctx, x, y) {
    ctx.drawImage(this.canvas, x, y);
  }
}

const CELLSIZE = 50;

const SHAPE = [
  [
    {x:0, y:0},
    {x:1, y:1},
  ]
]

/** @type {{[key: string]: Block}}*/
const BLOCKS = {
  '1': new Block('red'),
  '2': new Block('orange'),
  '3': new Block('yellow'),
  '4': new Block('green'),
  '5': new Block('blue'),
  '6': new Block('navy'),
  '7': new Block('purple'),
  '8': new Block('pink'),
  '9': new Block('cyan')
};


const MOUSE = {
  x: 0,
  y: 0,
  isClick: false,
  isInGrid: false,
  isInSpawner: false
};



function render() {
  // reset window with black color
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //draw grid
  const gridStartX = canvas.width / 2 - grid.canvas.width / 2;
  const gridStartY = canvas.height / 2 - grid.canvas.height / 2 - 100;
  grid.render(ctx, gridStartX, gridStartY);

  // draw block spawn section
  const spawnerStartX = gridStartX;
  const spawnerStartY = gridStartY + grid.canvas.height + 20;
  spawner.render(ctx, spawnerStartX, spawnerStartY)

  //draw mouseGrid
  if(MOUSE.isClick) {
    mouseGrid.render(ctx, MOUSE.x + mouseGrid.offsetX - mouseGrid.canvas.width / 2, MOUSE.y + mouseGrid.offsetY - mouseGrid.canvas.height / 2)
  }


  // fill block color
  for(let y = 0; y < gridArray.length; y++) {
    for(let x = 0; x < gridArray[y].length; x++) {
      if(gridArray[y][x]) {
       //BLOCKS[gridArray[y][x]].render(ctx, gridStartX + x * CELLSIZE, gridStartY + y * CELLSIZE);
      }
    }
  }
}



function update(interval) {
  //console.log(`x: ${MOUSE.x}, y: ${MOUSE.y}, isClick: ${MOUSE.isClick}, isInGrid: ${MOUSE.isInGrid}, isInSpawner: ${MOUSE.isInSpawner}`)
}


let firstTime = 0;

const grid = new Grid('grey', 2, 10, 10);
const spawner = new Spawner('grey', 6, grid.canvas.width, 200);
const mouseGrid = new MouseGrid(-150, -300, 5);

const gridArray = Array(grid.numberY).fill().map(
  () => Array(10).fill().map(() => Math.floor(Math.random()*8))
);



function main(timeStamp) {
  const interval = (timeStamp - firstTime) / 1000;
  firstTime = timeStamp;
  
  update(interval);
  render();
  requestAnimationFrame(main);
}


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);

canvas.addEventListener('mousemove', (e) => {
  MOUSE.x = e.offsetX;
  MOUSE.y = e.offsetY;
});
canvas.addEventListener('mousedown', () => {
  MOUSE.isClick = true;
});
canvas.addEventListener('mouseup', () => {
  MOUSE.isClick = false;
});
grid.canvas.addEventListener('mouseenter', () => {
  MOUSE.isInGrid = true;
});
grid.canvas.addEventListener('mouseleave', () => {
  MOUSE.isInGrid = false;
});



// main loop
resizeCanvas();
requestAnimationFrame(main);
