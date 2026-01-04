import src from 'assets/badguy.png';

const select = (arr, indices) => indices.map(i => arr[i]);

const spriteSheetSpecs = {
  src,
  width: 36,
  height: 36,
  totalFrameCount: 14,
  startTop: 0,
  startLeft: 0,
  getFrames: frames => ({
    idle: [frames[0]],
    walk: select(frames, [0,1,2,3,4,5]),
    lick: select(frames, [6,7,8,9,10,11,12,13]),
  }),
};

export default spriteSheetSpecs;
