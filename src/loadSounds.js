import loadSound from './loadSound.js';

import badguyLick from 'assets/badguy-lick.mp3';
import badguyLickedMuncher from 'assets/badguy-licked-muncher.wav';
import badguyStep from 'assets/badguy-step.wav';
import muncherMunch from 'assets/muncher-munch.wav';
import muncherStep from 'assets/muncher-step.wav';
import victory from 'assets/youwin.mp3';
import gameover from 'assets/gameover.wav';

const audioContext = new AudioContext();

const loadSounds  = async () => ({
  badguy: {
    lick: await loadSound(audioContext, badguyLick),
    lickedMuncher: await loadSound(audioContext, badguyLickedMuncher),
    step: await loadSound(audioContext, badguyStep),
  },
  muncher: {
    munch: await loadSound(audioContext, muncherMunch),
    step: await loadSound(audioContext, muncherStep),
  },
  victory: await loadSound(audioContext, victory),
  gameover: await loadSound(audioContext, gameover),
});

export default loadSounds;
