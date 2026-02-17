import {SHAPES, COLORS} from './resources.js'
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("main");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

class Cell {
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
    ctx.drawImage(this.canvas, x, y);
  }
}

class Block {
  constructor(shape, color) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.shape = shape;
    this.color = color;

    /**@type {Cell}*/
    this.cell = cellCache[this.color];

    this.canvas.width = 5 * CELLSIZE;
    this.canvas.height = 5 * CELLSIZE;

    for(let {x, y} of this.shape) {
      this.cell.render(this.ctx, (x+2) * CELLSIZE, (y+2) * CELLSIZE);
    }
  }

  /** @param {CanvasRenderingContext2D} ctx*/ 
  render(ctx, x, y, w = this.canvas.width, h = this.canvas.height) {
    ctx.drawImage(this.canvas, x, y, w, h);
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


    this.array = Array(this.numberY).fill().map(() => Array(this.numberX).fill());

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
  
  checkLines() {
    let rowsToDelete = [];
    let colsToDelete = [];

    // 1. 가로줄 검사
    for (let y = 0; y < this.numberY; y++) {
      if (this.array[y].every(cell => cell !== undefined)) {
        rowsToDelete.push(y);
      }
    }

    // 2. 세로줄 검사
    for (let x = 0; x < this.numberX; x++) {
      let isColFull = true;
      for (let y = 0; y < this.numberY; y++) {
        if (this.array[y][x] === undefined) {
          isColFull = false;
          break; // 한 칸이라도 비었으면 이 열은 탈락
        }
      }
      if (isColFull) colsToDelete.push(x);
    }

    // 3. 실제 삭제 (데이터 비우기)
    // 가로줄 비우기
    rowsToDelete.forEach(y => {
      for (let x = 0; x < this.numberX; x++) {
        this.array[y][x] = undefined;
      }
    });

    // 세로줄 비우기
    colsToDelete.forEach(x => {
      for (let y = 0; y < this.numberY; y++) {
        this.array[y][x] = undefined;
      }
    });

    // 터진 줄 수를 반환 (나중에 점수 계산용)
    return rowsToDelete.length + colsToDelete.length;
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


    this.respawn();

  }
  /** @param {CanvasRenderingContext2D} ctx*/ 
  render(ctx, x, y) {
    ctx.drawImage(this.canvas, x, y);
  }

  respawn() {
    /**@type {Block[]}*/
    this.blockList = Array(3).fill().map(() => {
        return new Block(
        SHAPES[Math.floor(Math.random() * SHAPES.length)], COLORS[Math.floor(Math.random() * COLORS.length)]
      )
    });

    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

    for(let i = 0; i < this.blockList.length; i++) {
      const blockSizeRatio = 0.5;
      this.ctx.drawImage(
        this.blockList[i].canvas,
        i * this.canvas.width / this.blockList.length + this.canvas.width / this.blockList.length / 2 - this.blockList[i].canvas.width * blockSizeRatio / 2,
        this.canvas.height / 2 - this.blockList[i].canvas.height * blockSizeRatio / 2,
        this.blockList[i].canvas.width * blockSizeRatio,
        this.blockList[i].canvas.height * blockSizeRatio
      );
    }
  }
}

const CELLSIZE = 50;

class Mouse {
  constructor(offsetX, offsetY) {
    this.x = 0;
    this.y = 0;
    //this.isClick = false;
    this.isPointerInGrid = false;
    this.isInSpawner = false;
    this.isGrabbed = 0;
    this.gridPosX = 0;
    this.gridPosY = 0;

    this.pointerX = 0;
    this.pointerY = 0;

    this.offsetX = offsetX;
    this.offsetY = offsetY;

    this.grabbedBlockIdx = undefined;
    this.isGrabbed = false;
    this.canPlace = false;
  }

  isCollision(cx, cy, x, y, w, h) {
    return cx > x && cx < x + w && cy > y && cy < y + h;
  }

  /**@param {CanvasRenderingContext2D} ctx*/
  renderPointer(ctx, x, y) {
    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.stroke();
  }
}



function render() {
  // reset window with black color
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //draw grid
  gridStartX = canvas.width / 2 - grid.canvas.width / 2;
  gridStartY = canvas.height / 2 - grid.canvas.height / 2 - 100;
  grid.render(ctx, gridStartX, gridStartY);

  // draw block spawn section
  spawnerStartX = gridStartX;
  spawnerStartY = gridStartY + grid.canvas.height + 20;
  spawner.render(ctx, spawnerStartX, spawnerStartY)


  if(mouse.isPointerInGrid && mouse.isGrabbed && mouse.canPlace) {
    for(const pos of spawner.blockList[mouse.grabbedBlockIdx].shape) {
      const tx = gridStartX + (mouse.gridPosX + pos.x) * CELLSIZE;
      const ty = gridStartY + (mouse.gridPosY + pos.y) * CELLSIZE;
      ctx.globalAlpha = 0.5;
      cellCache[spawner.blockList[mouse.grabbedBlockIdx].color].render(ctx, tx, ty);
      ctx.globalAlpha = 1;
    }
  }

  //draw grid cells
  for(let y = 0; y < grid.array.length; y++) {
    for(let x = 0; x < grid.array[y].length; x++) {
      if(grid.array[y][x]) {
        cellCache[grid.array[y][x]].render(ctx, gridStartX + x * CELLSIZE, gridStartY + y * CELLSIZE);
      }
    }
  }

  //draw mouse canvas
  if(mouse.isGrabbed) {
    spawner.blockList[mouse.grabbedBlockIdx].render(
      ctx, mouse.pointerX - spawner.blockList[mouse.grabbedBlockIdx].canvas.width / 2,
      mouse.pointerY - spawner.blockList[mouse.grabbedBlockIdx].canvas.height / 2);
  }
  mouse.renderPointer(ctx, mouse.pointerX, mouse.pointerY);
}



function update(interval) {
  //console.log(`x: ${mouse.x}, y: ${mouse.y}, isClick: ${mouse.isClick}, isPointerInGrid: ${mouse.isPointerInGrid}, isInSpawner: ${mouse.isInSpawner}, isGrabbed: ${mouse.isGrabbed}`)
  // check grid block collision

  if(mouse.isPointerInGrid) {
    mouse.gridPosX = Math.floor((mouse.pointerX - gridStartX) / CELLSIZE);
    mouse.gridPosY = Math.floor((mouse.pointerY - gridStartY) / CELLSIZE);
    if(mouse.isGrabbed){
      mouse.canPlace = spawner.blockList[mouse.grabbedBlockIdx].shape.every((pos) => {
        const tx = mouse.gridPosX + pos.x;
        const ty = mouse.gridPosY + pos.y;

        return tx >= 0 && tx < grid.numberX && ty >= 0 && ty < grid.numberY && !grid.array[ty][tx];
      })
    } else {
      mouse.canPlace = false;
    }
  }

  if(spawner.blockList.length == 0) {spawner.respawn()}

  // 가로축 검사
  for(let y = 0; y < grid.numberY; y++) {
    if(grid.array[y].every((item) => {item !== undefined})) {
      grid.array[y].push()
    }
  }

  console.log(spawner.blockList);
}
  




let firstTime = 0;
let gridStartX, gridStartY, spawnerStartX, spawnerStartY;

const cellCache = {};
COLORS.forEach((color) => {
  cellCache[color] = new Cell(color);
})

const grid = new Grid('grey', 2, 10, 10);
const spawner = new Spawner('grey', 6, grid.canvas.width, 200);
const mouse = new Mouse(-100, -150);


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
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;

  mouse.pointerX = mouse.x + mouse.offsetX;
  mouse.pointerY = mouse.y + mouse.offsetY;

  if(mouse.isCollision(mouse.pointerX, mouse.pointerY, gridStartX, gridStartY, grid.canvas.width, grid.canvas.height)) {
    mouse.isPointerInGrid = true;
  } else {
    mouse.isPointerInGrid = false;
  }

  if(mouse.isCollision(mouse.x, mouse.y, spawnerStartX, spawnerStartY, spawner.canvas.width, spawner.canvas.height)) {
    mouse.isInSpawner = true;
  } else {
    mouse.isInSpawner = false;
  }
});
canvas.addEventListener('mousedown', () => {
  //mouse.isClick = true;

  if(mouse.isInSpawner) {
    mouse.isGrabbed = true;
    mouse.grabbedBlockIdx = Math.floor((mouse.x - spawnerStartX) / spawner.canvas.width * spawner.blockList.length);
  }
});
canvas.addEventListener('mouseup', () => {
  //mouse.isClick = false;
  if(mouse.canPlace) {
    for(const pos of spawner.blockList[mouse.grabbedBlockIdx].shape) {
      grid.array[mouse.gridPosY + pos.y][mouse.gridPosX + pos.x] = spawner.blockList[mouse.grabbedBlockIdx].color;
    }
    spawner.blockList.splice(mouse.grabbedBlockIdx, 1);
    spawner.draw();
    grid.checkLines();
  }

  mouse.isGrabbed = false;
  mouse.grabbedBlockIdx = undefined;

});



// main loop
resizeCanvas();
requestAnimationFrame(main);
