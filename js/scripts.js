// STop Game Reset High Scores

const canvas = document.getElementById('teetros');
const context = canvas.getContext('2d');

context.scale(20,20);
context.fillStyle= '#000';
context.fillRect(0, 0, canvas.width, canvas.height);

let isRunning;
let reset;
let startButton = document.querySelector('.top__start');
let hBoard = document.querySelector('.hboard');
let nextPiece;

// Update the game board
function arenaSweep(){
  let oldScore = player.score;
  let rowCount = 1;
  outer: for(let y = arena.length -1; y > 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y,1)[0].fill(0);
    arena.unshift(row);
    ++y;
    
    player.score += rowCount*10;
    rowCount *= 2;
  }  
}

// Are pieces hitting each other?
function collide(arena, player) {
  const[m, o] = [player.matrix, player.pos];
  for (let y=0; y<m.length; y++) {
    for (let x=0; x<m[y].length; x++) {
      if (m[y][x] !== 0 && 
          (arena[y + o.y] && 
           arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
} 

// Where are things
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// All the pieces
function createPiece(type) {
  if (type === "T") {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ];
  } else if (type === "O") {
    return [
      [2, 2],
      [2, 2]
    ];
  } else if (type === "I") {
    return [
      [0, 3, 0, 0],
      [0, 3, 0, 0],
      [0, 3, 0, 0],
      [0, 3, 0, 0]
    ];
  } else if (type === "J") {
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0]
    ];
  } else if (type === "L") {
    return [
      [0, 5, 0],
      [0, 5, 0],
      [0, 5, 5]
    ];
  } else if (type === "S") {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0]
    ];
  } else if (type === "Z") {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]
    ];
  }
}

// Draw the pieces
function draw () {
  context.fillStyle= '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

// things moving in the matrix
function drawMatrix (matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

// Update the position
function merge(arena,player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
}

// Piece drops one square down
function playerDrop() {
  player.pos.y++;
  if (collide(arena,player)) {
    player.pos.y--;
    merge(arena,player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

// Move each piece around
function playerMove(dir) {
  
  player.pos.x += dir;
  if(collide(arena, player)) { // no going off screen
    player.pos.x -= dir;
  }
}

// Reset Game
function playerReset() {
  const pieces = "ILJOTSZ";
  let whichPiece = pieces[pieces.length * Math.random() | 0];
  if (!nextPiece) {
    nextPiece = createPiece(whichPiece);
    whichPiece = pieces[pieces.length * Math.random() | 0];
  }
  player.matrix = nextPiece;
  nextPiece = createPiece(whichPiece);
  updateNext(whichPiece);
  player.pos.y = 0;
  player.pos.x = (arena[0].length /2 | 0) - (player.matrix[0].length /2 | 0);
  
  if (collide(arena, player) || reset == true) {
    if (reset !== true) {
      hBoard.classList.add('on'); 
      startButton.innerText = "Start Game"; 
      if(startButton.classList.contains('on')) startButton.classList.remove('on');   
    }
    isRunning = false;
    reset = false;
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

// Update the Next Piece Icon
function updateNext(next) {
  const classNames = document.querySelectorAll('.next__each');
  const thisClassName = `.${next.toLowerCase()}`;
  const thisClass = document.querySelector(thisClassName);
  console.log(thisClass);
  classNames.forEach(name => { if(name.classList.contains('on')) name.classList.remove('on') });
  if(!thisClass.classList.contains('on')) thisClass.classList.add('on'); 
}

// Rotate piece and deal with collisions
function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while(collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

// Keeping track of the rotation
function rotate(matrix, dir) {
  for (let y = 0; y<matrix.length; y++) {
    for(let x = 0; x < y; x++) {
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
        matrix[y][x],
        matrix[x][y],
      ];
    }
  }
  if(dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}



let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Set dropping speed
function update(time = 0) {
  const speedReadout = document.querySelector('.speed');
  
  if (isRunning) {
    if (player.score >= 2500) {
      dropInterval = 75;
    } else if (player.score >= 2000) {
      dropInterval = 100;
    } else if (player.score >= 1500) {
      dropInterval = 300;
    } else if (player.score >= 1000) {
      dropInterval = 600;
    } else if (player.score >= 500) {
      dropInterval = 800;
    } else if (player.score >= 250) {
      dropInterval = 900;
    } else {
      dropInterval = 1000;
    }
    speedReadout.innerText = dropInterval;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if(dropCounter > dropInterval) {
      playerDrop();
    }
    draw();
    requestAnimationFrame(update);
  }
}

// Scoring
function updateScore() {
  let topScore = localStorage.getItem('highscore');
  document.querySelector('.score').innerText = player.score;
  if (player.score > topScore) {
    localStorage.setItem('highscore', player.score);
    topScore = player.score;
    document.querySelector('.topscore').innerText = topScore;
  }
}

// Piece Colors
const colors = [
  null,
  '#FF0DFF', // Pink T
  '#E82C0C', // Red Square
  '#424BFF', // Blue Line
  '#FFC70D', // Yellow J
  '#32FF64', // Green L
  '#32EBFF', // Blue S
  '#945D3C', // Brown Z
];

const arena = createMatrix(12,20);

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
}

// Event Listeners to move the pieces

document.addEventListener ('keydown', event => {
  if (event.keyCode === 39 || event.keyCode === 68) {
    playerMove(+1);
  } else if (event.keyCode === 37 || event.keyCode === 65) {
    playerMove(-1);
  } else if (event.keyCode === 40 || event.keyCode === 83) {
    playerDrop();
  } else if (event.keyCode === 81) {
    playerRotate(+1);
  } else if (event.keyCode === 69) {
    playerRotate(-1);
  }
})

document.getElementById('left').addEventListener('click', () => playerMove(-1));
document.getElementById('right').addEventListener('click', () => playerMove(+1));
document.getElementById('rotate-right').addEventListener('click', () => playerRotate(+1));
document.getElementById('rotate-left').addEventListener('click', () => playerRotate(-1));
document.getElementById('down').addEventListener('click', playerDrop);

startButton.addEventListener('click', () => {
  if(hBoard.classList.contains('on')) hBoard.classList.remove('on');
  if(!startButton.classList.contains('on')) startButton.classList.add('on');
  reset = true;
  startButton.innerText = "Reset Game";
  playerReset();
  isRunning = true;
  update();
});


document.querySelector('.topscore').innerText = localStorage.getItem('highscore');
playerReset();
updateScore();
