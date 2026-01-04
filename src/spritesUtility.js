// NOTE: This is essentially a sprites library. Definitions format: { src, width, height, startTop?, startLeft?, columns?, getFrames }
// get frames via 'getSprite(definition)'
// access a frame via 'getFrameByElapsedTime(elapsedTimeRunning, frames.running, durationOfAnimationLoop)'
// DEPENDENCIES: file-loader

export const getFrameByElapsedTime = (elapsedTime, frames, animationRunTime = 500) => {
    const index = Math.floor(elapsedTime * frames.length / animationRunTime) % frames.length;
    return frames[index];
};

export const getSprite = async definition => {
  const placeholderImage = new Image();
  placeholderImage.src = definition.src;

  const frames = (definition.frameLocations)
    ? await loadFramesByJSON(placeholderImage, definition)
    : await loadFramesOfImage(placeholderImage, definition);

  const sprites = definition.getFrames(frames);

  return sprites;
};

export const loadFramesOfImage = (placeholderImage, { totalFrameCount, width, height, numOfColumns = totalFrameCount, startTop = 0, startLeft = 0 }) =>
  new Promise(resolve =>
    placeholderImage.onload = async () =>
      resolve(await Promise.all([...Array(totalFrameCount).keys()].map(i =>
        createImageBitmap(
          placeholderImage,
          startLeft + (width * (i % numOfColumns)),
          startTop + Math.floor(i / numOfColumns) * height,
          width,
          height))))
);

export const loadFramesByJSON = (placeholderImage, { frameLocations }) =>
  new Promise(resolve =>
    placeholderImage.onload = async () =>
      resolve(await Promise.all(frameLocations.map(({ frame: { x, y, w, h }}) =>
        createImageBitmap(placeholderImage, x, y, w, h))))
  );


export const drawImageHorizontalFlip = (ctx, frame, x, y) =>  {
  ctx.save();
  ctx.translate(frame, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(frame, -x, y);
  ctx.restore();
};

//EXAMPLE DEFINITION:
/*
import src from 'assets/hero.png';

const select = (arr, indices) => indices.map(i => arr[i]);

const spriteSheetSpecs = {
  src,
  width: 16,
  height: 16,
  totalFrameCount: 27,
  startTop: 16,
  startLeft: 16,
  numOfColumns: 6,
  getFrames: frames => ({
    idle: select(frames, [0,1,2,3]),
    blink: select(frames, [0,3]),
    shock: [frames[4]],
    running: select(frames, [6,7,8,9,10,11]),
    jump: {
      rising: [frames[12]],
      falling: [frames[13]],
      landing: [frames[14]],
    },
    kick: [frames[15]],
    victory: [frames[17]],
    swimming: select(frames, [18,19,20,21,22,23]),
    punching: select(frames, [24,25,26]),
  }),
};

export default spriteSheetSpecs;
*/

// Note: not used anymore... using json file definitions instead
// Advanced requires sections
export const advancedLoadFramesOfImage = (placeholderImage, { sections, width, height }) =>
  new Promise(resolve =>
    placeholderImage.onload = async () => {
      return resolve(await Promise.all(Object.entries(sections).map(([name, specifications]) => {
        const { startLeft, startTop, width = width, height = height, marginLeft = 0, marginTop = 0, } = specifications;
        const { totalFrameCount, numOfColumns } = specifications;
        return [...Array(totalFrameCount).keys()].map(i =>
          createImageBitmap(
            placeholderImage,
            startLeft + ((width + marginLeft) * (i % numOfColumns)),
            startTop + Math.floor(i / numOfColumns) * (height + marginTop),
            width,
            height))
      }).flat()))
    }
);

