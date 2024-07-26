import { BootScene, WrapperScene } from './scenes';

import { AUTO, Game, Scale } from 'phaser';

const config = {
  type: AUTO,
  width: 1680,
  height: 1050,
  parent: 'newt',
  backgroundColor: '#000000',
  pixelArt: false,
  dom: {
    createContainer: true,
  },
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  title: 'NEWT BB',
  url: 'newt bb',
  scene: [BootScene, WrapperScene],
};

export default new Game(config);
