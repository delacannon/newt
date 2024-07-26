import { Scene } from "phaser";
import { Tiles } from "../utils";
import {
  BACKGROUND_COLOR,
  GAME_HEIGHT,
  GAME_WIDTH,
  LOADING_BAR_COLOR,
  LOADING_BAR_HEIGHT,
  PROPS_FRAME_SIZE,
  SPRITE_SIZE,
} from "../utils/constants";

export default class BootScene extends Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.createLoadingBar();
    this.loadAssets();
    this.loadTileIcons();
  }

  createLoadingBar() {
    const backgroundBar = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      LOADING_BAR_HEIGHT,
      BACKGROUND_COLOR,
    );
    const progressBar = this.add
      .rectangle(
        backgroundBar.x,
        backgroundBar.y,
        backgroundBar.width,
        backgroundBar.height,
        LOADING_BAR_COLOR,
      )
      .setScale(0, 1);

    this.load.on("progress", (progress) => {
      progressBar.setScale(progress, 1);
    });
  }

  loadAssets() {
    this.load.setPath("assets");

    this.load.bitmapFont("neuro", "neuro.png", "neuro.xml");
    this.load.bitmapFont("font", "AlienFont.png", "AlienFont.xml");

    this.load.spritesheet("rawblob", "rawblob.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
    this.load.spritesheet("rawblock", "rawblob_bloc.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });
    this.load.spritesheet("rawcorner", "corner.png", {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE,
    });

    this.load.audio("hud", ["hud.mp3"]);
    this.load.audio("beep", ["bleep.mp3"]);

    this.load.image("rocks", "rocks.png");

    this.load.spritesheet("props", "props.png", {
      frameWidth: PROPS_FRAME_SIZE,
      frameHeight: PROPS_FRAME_SIZE,
    });
  }

  loadTileIcons() {
    Tiles.forEach(({ icon }) => {
      this.load.image(icon, `${icon}.png`);
    });
  }

  create() {
    this.scene.start("WrapperScene");
  }
}
