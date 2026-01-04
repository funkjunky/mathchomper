import { loadFramesOfImage, getSprite, getFrameByElapsedTime } from './spritesUtility.js';
import muncherDefinition from './muncher.png.js';
import badguyDefinition from './badguy.png.js';
import loadSounds from './loadSounds.js';

const promiseMuncher = getSprite(muncherDefinition);
const promiseBadguy = getSprite(badguyDefinition);
const promiseSounds = loadSounds();

let isScoreScreen = false;
let startTime = Date.now();
let endTime;

const randomInt = (max, min=0) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

const numOfCellsWide = 7;
const numOfCellsHigh = 6;
let solutions = [];
const numOfSolutions = 10;

let theNumber;
const numbersGrid = [];
for(let i=0; i!=numOfCellsWide; ++i) {
  numbersGrid.push([]);
}

let muncher;
let badguy;

const initialize = () => {
  theNumber = randomInt(40, 20)
  for(let i=0; i!=numOfCellsWide; ++i) {
    numbersGrid[i] = [];
    for(let k=0; k!=numOfCellsHigh; ++k) {
      let addition;
      do {
        addition = {
          a: 1 + Math.floor(Math.random() * theNumber - 1),
          b: 1 + Math.floor(Math.random() * theNumber - 1),
        };
        //keep doing it, until we find a wrong answer.
      } while(addition.a + addition.b === theNumber)

      numbersGrid[i].push(addition);
    }
  }

  solutions = [];
  do {
    const randomSolution = { a: randomInt(theNumber) };
    randomSolution.b = theNumber - randomSolution.a;
    const randomCoord = { x: randomInt(numOfCellsWide), y: randomInt(numOfCellsHigh) };

    // only add it if the coord is good. [yes i know I shouldn't bother re-calculating the solution each time, it's insubstantial.]
    if (!solutions.find(({x, y}) => x === randomCoord.x && y === randomCoord.y)) {
      solutions.push(randomCoord);
      randomSolution.correct = true;
      numbersGrid[randomCoord.x][randomCoord.y] = randomSolution;
    }
  } while(solutions.length < numOfSolutions)

  muncher = {
    x: 1,
    y: 1,

    score: 0,
    lives: 3,
  
    isWalking: false,
    ticksTravelingBetween: 500,
    _ticksTravelingBetween: 500,
    _ticksMunching: 800,
  }

  badguy = {
    x: 4,
    y: 4,
    ticksLicking: 1000,
    ticksTravelingBetween: 1200,
    isLicking: false,

    _ticksLicking: 1000,
    _ticksTravelingBetween: 1000,
  }
  badguy.destination = chooseRandomNewCoords(badguy);
}

const isCorrect = (x, y) => numbersGrid[x][y].correct;
const hasBeenEaten = (x, y) => numbersGrid[x][y].eaten;
const solutionsRemaining = () => numOfSolutions - numbersGrid.reduce(
  (total, numbers) => total += numbers.reduce(
    (subtotal, {eaten, correct}) => subtotal += ((eaten && correct) ? 1 : 0),
  0),
0);
const numbersRemaining = () => numOfSolutions - numbersGrid.reduce(
  (total, numbers) => total += numbers.reduce(
    (subtotal, {eaten, correct}) => subtotal += (!eaten ? 1 : 0),
  0),
0);
const chooseRandomNewCoords = ({ x, y }) => {
  const isGoingUpOrDown = Math.random() < 0.5;
  if (isGoingUpOrDown) {
    const isGoingUp = Math.random() < 0.5;
    if (isGoingUp)  return { x, y: (y === 0) ? numOfCellsHigh - 1 : y - 1 };
    else            return { x, y: (y === numOfCellsHigh - 1) ? 0 : y + 1 };
  } else { //going left or right
    const isGoingLeft = Math.random() < 0.5;
    if (isGoingLeft)  return { x: (x === 0) ? numOfCellsWide - 1 : x - 1, y };
    else            return { x: (x === numOfCellsWide - 1) ? 0 : x + 1, y };
  }
}

initialize();

//////////
//////////

let isPaused = false;
document.addEventListener('keyup', e => {
  if(isScoreScreen || e.code === 'KeyR') {
    isScoreScreen = false;
    initialize();
    return;
  }
  if(e.code === 'KeyP') return isPaused = !isPaused;

  if(muncher.isEating || muncher.isWalking) return;
  switch(e.code) {
    case 'ArrowUp':
    case 'KeyW':
      console.log('sounds: ', sounds);
      playSound(sounds.muncher.step);
      muncher.isWalking = 'up';
      break;
    case 'ArrowDown':
    case 'KeyS':
      playSound(sounds.muncher.step);
      muncher.isWalking = 'down';
      break;
    case 'ArrowLeft':
    case 'KeyA':
      playSound(sounds.muncher.step);
      muncher.isWalking = 'left';
      break;
    case 'ArrowRight':
    case 'KeyD':
      playSound(sounds.muncher.step);
      muncher.isWalking = 'right';
      break;
    case 'Space':
      playSound(sounds.muncher.munch);
      muncher.isEating = true;
      muncher.ticksMunching = muncher._ticksMunching;
    default:
      console.log('sophie: not a recognized key.');
  }
});

console.log('badguy: ', badguy);
console.log('muncher: ', muncher);
const loop = dt => {
  if (isScoreScreen || isPaused) return;
  duration += dt;

  if (muncher.isWalking) {
    if ((muncher.ticksTravelingBetween -= dt) < 0) {
      playSound(sounds.muncher.step);
      if (muncher.isWalking === 'up') {
        muncher.y -= 1;
        if (muncher.y < 0) muncher.y = numOfCellsHigh - 1;
      } else if (muncher.isWalking === 'down') {
        muncher.y += 1;
        if (muncher.y > numOfCellsHigh - 1) muncher.y = 0;
      } else if (muncher.isWalking === 'left') {
        muncher.x -= 1;
        if (muncher.x < 0) muncher.x = numOfCellsWide;
      } else if (muncher.isWalking === 'right') {
        muncher.x += 1;
        if (muncher.x > numOfCellsWide - 1) muncher.x = 0;
      }

      muncher.ticksTravelingBetween = muncher._ticksTravelingBetween;
      muncher.isWalking = false;
    }
  } else if (muncher.isEating) {
    if ((muncher.ticksMunching -= dt) < 0) {
      //eat the number...
      numbersGrid[muncher.x][muncher.y].eaten = true;
      muncher.isEating = false;
      if(numbersGrid[muncher.x][muncher.y].correct) {
        muncher.score += 300 + (numOfSolutions - solutionsRemaining()) * 50 - (numbersRemaining() * 10) - Math.floor(Math.min((Date.now() - startTime) / 100, 200));
        if(solutionsRemaining() === 0) {
          playSound(sounds.victory);
          isScoreScreen = true;
          const timeToCompletion = duration
          if (timeToCompletion <= 60000) {
            muncher.timeBonusScore = 10000;
          } else if (timeToCompletion <= 90000) {
            muncher.timeBonusScore = 5000;
          } else if (timeToCompletion <= 180000) {
            muncher.timeBonusScore = 2000;
          } else {
            muncher.timeBonusScore = 0;
          }
        }
      }
    }
  }

  if (badguy.isLicking) {
    // reset
    if((badguy.ticksLicking -= dt) < 0) {
      badguy.ticksLicking = badguy._ticksLicking;
      badguy.isLicking = false;
      if (muncher.x === badguy.x && muncher.y === badguy.y) {
        playSound(sounds.badguy.lickedMuncher);
        if((muncher.lives -= 1) < 0) {
          console.log('GAME OVER');
          isScoreScreen = true;
          playSound(sounds.gameover);
        } else {
          // move muncher away...
          muncher.x = (badguy.x + 4) % numOfCellsWide;
          muncher.y = (badguy.y + 4) % numOfCellsHigh;
        }
      }
    }
  } else if((badguy.ticksTravelingBetween -= dt) < 0) {
    //reset
    badguy.ticksTravelingBetween = badguy._ticksTravelingBetween;
    badguy.x = badguy.destination.x;
    badguy.y = badguy.destination.y;
    //chose new destination
    badguy.destination = chooseRandomNewCoords(badguy);
    //set isLicking
    badguy.isLicking = true;
    playSound(sounds.badguy.lick);
  }
}

let timestamp = Date.now();
let duration = 0;
setInterval(function() {
  const dt = Date.now() - timestamp;
  timestamp = Date.now();

  loop(dt);
}, 1);

const Header = {
  height: 100,
};

const Grid = {
  marginLeft: 10,
  marginTop: Header.height + 10,

  cellWidth: 64,
  cellHeight: 64,

  cellMargin: 8,
}
const lineWidth = 4;
const convertCoordXToDrawX = x => -10 + Grid.marginLeft + Grid.cellMargin + x * (Grid.cellWidth + Grid.cellMargin + lineWidth * 2);
const convertCoordYToDrawY = y => Grid.marginTop + Grid.cellMargin + y * (Grid.cellHeight + Grid.cellMargin + lineWidth * 2);

const graphics = (sprites, dt) => {
  const ctx = document.querySelector('canvas').getContext('2d');
  ctx.clearRect(0,0,700,720);

  ctx.font = "18px sans-serif";
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'white';

  //draw grid border
  const borderTop = Grid.marginTop;
  const borderRight = Grid.cellMargin + numOfCellsWide * (Grid.cellWidth + Grid.cellMargin + lineWidth * 2);
  const borderBottom = Grid.marginTop + numOfCellsHigh * (Grid.cellHeight + Grid.cellMargin + lineWidth * 2);
  drawLine(ctx, Grid.marginLeft, borderTop, borderRight, borderTop);  // top
  drawLine(ctx, Grid.marginLeft, borderTop, Grid.marginLeft, borderBottom); // left
  drawLine(ctx, Grid.marginLeft, borderBottom, borderRight, borderBottom);  // bottom
  drawLine(ctx, borderRight, borderTop, borderRight, borderBottom); // right
  //
  // draw grid of numbers
  numbersGrid.forEach((additions, x) => {
    additions.forEach((addition, y) => {
      const xx = Grid.marginLeft + Grid.cellMargin + (x * (Grid.cellWidth + Grid.cellMargin + lineWidth * 2));
      const yy = borderTop + Grid.cellMargin + (y * (Grid.cellHeight + Grid.cellMargin + lineWidth * 2));
      if (badguy.x === x && badguy.y === y) {
        ctx.strokeStyle = 'red';
      } else if (addition.eaten && addition.correct) {
        ctx.strokeStyle = 'lightgreen';
      } else if (addition.eaten && !addition.correct) {
        ctx.strokeStyle = 'orange';
      } else if (muncher.x === x && muncher.y === y) {
        ctx.strokeStyle = 'green';
      } else {
        ctx.strokeStyle = 'white';
      }
      ctx.strokeRect(xx, yy, Grid.cellWidth, Grid.cellHeight);
      if(addition.eaten) {
        if (addition.correct) {
          ctx.fillStyle = 'darkgreen';
        } else {
          ctx.fillStyle = 'grey';
        }
      }
      ctx.fillText(addition.a + '+' + addition.b, xx + 10, yy - 8 + Grid.cellHeight / 2);
      ctx.fillStyle = 'white';
    });
  });
  //

  //draw muncher
  let muncherFrame;
  if (muncher.isEating) {
    muncherFrame = getFrameByElapsedTime(muncher._ticksMunching - muncher.ticksMunching, sprites.muncher.chomp, muncher._ticksMunching);
  } else if (muncher.isWalking) {
    muncherFrame = getFrameByElapsedTime(muncher.ticksTravelingBetween, sprites.muncher.walking, muncher._ticksTravelingBetween);
  } else if (badguy.isLicking && badguy.x === muncher.x && badguy.y === muncher.y) {
    muncherFrame = getFrameByElapsedTime(0, sprites.muncher.licked);
  } else {
    muncherFrame = getFrameByElapsedTime(0, sprites.muncher.idle);
  }
  if (muncher.isWalking) {
    let x = convertCoordXToDrawX(muncher.x);
    let y = convertCoordYToDrawY(muncher.y);
    if (muncher.isWalking === 'up') {
      y -= Grid.cellHeight * (1 - muncher.ticksTravelingBetween / muncher._ticksTravelingBetween);
    } else if (muncher.isWalking === 'down') {
      y += Grid.cellHeight * (1 - muncher.ticksTravelingBetween / muncher._ticksTravelingBetween);
    } else if (muncher.isWalking === 'left') {
      x -= Grid.cellWidth * (1 - muncher.ticksTravelingBetween / muncher._ticksTravelingBetween);
    } else if (muncher.isWalking === 'right') {
      x += Grid.cellWidth * (1 - muncher.ticksTravelingBetween / muncher._ticksTravelingBetween);
    }
    ctx.drawImage(muncherFrame, 0, 0, 36, 36, x, y, 80, 80);
  } else {
    ctx.drawImage(muncherFrame, 0, 0, 36, 36, convertCoordXToDrawX(muncher.x), convertCoordYToDrawY(muncher.y), 80, 80);
  }
  //

  //draw badguy
  let badguyFrame;
  if (badguy.ticksTravelingBetween < badguy._ticksTravelingBetween) { // TODO: use a state instead for simplicity.
    badguyFrame = getFrameByElapsedTime(badguy.ticksLicking, sprites.badguy.walk, 50);
  } else if (badguy.isLicking) {
    badguyFrame = getFrameByElapsedTime(badguy.ticksLicking, sprites.badguy.lick, badguy._ticksLicking);
  } else {
    badguyFrame = getFrameByElapsedTime(0, sprites.badguy.idle);
  }
  ctx.drawImage(badguyFrame, 0, 0, 36, 36, convertCoordXToDrawX(badguy.x), convertCoordYToDrawY(badguy.y), 84, 84);
  //
  
  //Draw header
  ctx.textAlign = 'right';
  ctx.font = "18px sans-serif";
  ctx.fillText('Score: ' + muncher.score, borderRight, 18);
  ctx.font = "36px sans-serif";
  ctx.fillText(solutionsRemaining() + ' Remaining', borderRight, 36);
  ctx.font = "18px sans-serif";
  ctx.fillText('Time: ' + (''+Math.floor(duration / 1000)).padStart(3, '0'), borderRight, 72);
  ctx.textAlign = 'left';
  ctx.font = "36px sans-serif";
  for(let i = 0; i<muncher.lives; ++i) {
    ctx.fillText('♡', 18 + 36 * i, 36);
  }
  ctx.font = "48px sans-serif";
  ctx.fillStyle = 'green';
  ctx.fillText(theNumber, 256, 36);

  if (isPaused) {
    ctx.fillStyle = '#000000CC';
    ctx.fillRect(0,0,700,720);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = "64px sans-serif";
    ctx.fillText('Paused!', 280, 200);
  } else if (isScoreScreen) {
    ctx.fillStyle = '#000000CC';
    ctx.fillRect(0,0,700,720);
    if (solutionsRemaining() === 0) {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.font = "64px sans-serif";
      ctx.fillText('YOU WIN!', 280, 200);
      ctx.font = "24px sans-serif";
      ctx.fillText('Time: ' + Math.floor((endTime - startTime) / 1000) + ' seconds (Speed Bonus: ' + muncher.timeBonusScore + ')', 280, 200 + 64);
    } else {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.font = "64px sans-serif";
      ctx.fillText('😵', 280, 200);
      ctx.fillText('Game Over', 280, 200 + 64);
    }
    ctx.font = "48px sans-serif";
    ctx.fillText('- score -', 280, 200 + 24 + 64 + 64);
    ctx.fillText(muncher.score, 280, 200 + 24 + 64 + 64 + 48);
    ctx.fillText('Press Any Button', 280, 450);
    ctx.fillText('To Restart', 280, 450 + 48);
  } else {
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    ctx.font = "24px sans-serif";
    ctx.fillText('- AWSD or arrow keys to move AND Space to choose -', 4, 620);
    ctx.fillText('(Press P to Pause, R to Restart)', 8, 644);
  }
}
const step = sprites => dt => {
  graphics(sprites, dt);
  window.requestAnimationFrame(step(sprites));
};
let sounds;
document.addEventListener("DOMContentLoaded", (event) =>  {
  Promise.all([promiseMuncher, promiseBadguy, promiseSounds]).then(([muncher, badguy, _sounds]) => {
    console.log('promise resolves', muncher, badguy, _sounds);
    sounds = _sounds;
    window.requestAnimationFrame(step({ muncher, badguy }));
  });
});

const audioCtx = new AudioContext();
const playSound = sound => {
  const source = audioCtx.createBufferSource();
  source.buffer = sound;
  source.connect(audioCtx.destination);
  source.loop = false;
  source.start()
};

const drawLine = (ctx, x1, y1, x2, y2) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.stroke();
}
