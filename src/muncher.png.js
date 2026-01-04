import src from 'assets/number-eater.png';

const select = (arr, indices) => indices.map(i => arr[i]);

const spriteSheetSpecs = {
  src,
  width: 36,
  height: 36,
  totalFrameCount: 11,
  startTop: 0,
  startLeft: 0,
  getFrames: frames => ({
    idle: [frames[0]],
    chomp: select(frames, [0,1,2,3,4,5,6]),
    walking: select(frames, [7,8,9]),
    licked: [frames[10]],
  }),
};

export default spriteSheetSpecs;
