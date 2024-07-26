import { Scene } from "phaser";
import { TEXT_SCENE_KEY } from "../utils/constants";
import MapScene from "./MapScene";
import TextScene from "./TextScene";

export default class WrapperScene extends Scene {
  constructor() {
    super({
      key: "WrapperScene",
    });
  }

  create() {
    this.scene.add("MapScene", MapScene, true);

    this.input.keyboard.on("keydown-C", this.handleKeyC.bind(this));
    this.input.keyboard.on("keydown-Z", this.handleKeyZ.bind(this));
    this.input.keyboard.on("keydown-F1", this.handleKeyS.bind(this));
  }

  handleKeyC() {
    this.scene.add(TEXT_SCENE_KEY, TextScene, true);
  }

  handleKeyZ() {
    this.registry.set("dk", false);
    this.scene.remove(TEXT_SCENE_KEY);
  }

  handleKeyS() {
    const iconTiles = JSON.parse(localStorage.getItem("icons")) || [];
    const textTiles = JSON.parse(localStorage.getItem("texts")) || [];
    const propsTiles = JSON.parse(localStorage.getItem("props")) || [];
    const gridTiles = JSON.parse(localStorage.getItem("grid")) || [];

    const data = {
      icons: iconTiles,
      texts: textTiles,
      props: propsTiles,
      grid: gridTiles,
    };

    const encodedData = encodeURIComponent(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;

    window.open(url, "_blank");
  }
}
