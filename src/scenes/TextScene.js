import { Scene } from "phaser";

import {
  BEEP_VOLUME,
  BUTTON_POSITION,
  DK_FINAL_VALUE,
  DK_INITIAL_VALUE,
  DK_TIMEOUT,
  EDITOR_SCENE_KEY,
  HUD_VOLUME,
  INPUT_STYLE,
  INPUT_TEXT_POSITION,
  TEXT_POSITION,
  TEXT_SCENE_KEY,
  TEXT_SIZE,
} from "../utils/constants";

/**
 * Scene for displaying and managing text input.
 */
export default class TextScene extends Scene {
  constructor() {
    super({ key: TEXT_SCENE_KEY });
  }

  /**
   * Creates the scene, initializing text input and buttons.
   */
  create() {
    this.removeEditorScene();
    this.initializeRegistry();
    this.playHudSound();

    this.createTextInput();
    this.createAddButton();
    this.createCancelText();
    this.setupKeyboardListeners();
  }

  /**
   * Removes the editor scene if it is active.
   */
  removeEditorScene() {
    if (this.scene.isActive(EDITOR_SCENE_KEY)) {
      this.scene.remove(EDITOR_SCENE_KEY);
    }
  }

  /**
   * Initializes registry values.
   */
  initializeRegistry() {
    this.registry.set("titles", "");
    this.registry.set("dk", DK_INITIAL_VALUE);
    setTimeout(() => this.registry.set("dk", DK_FINAL_VALUE), DK_TIMEOUT);
  }

  /**
   * Plays the HUD sound.
   */
  playHudSound() {
    const hud = this.sound.add("hud", { volume: HUD_VOLUME });
    this.beep = this.sound.add("beep", { volume: BEEP_VOLUME });
    hud.play();
  }

  /**
   * Creates the text input field.
   */
  createTextInput() {
    this.inputText = this.add.dom(
      INPUT_TEXT_POSITION.x,
      INPUT_TEXT_POSITION.y,
      "input",
      INPUT_STYLE,
    );
    this.inputText.node.id = "main";
    setTimeout(() => this.inputText.node.focus(), DK_TIMEOUT);
  }

  /**
   * Creates the add button and sets up its listener.
   */
  createAddButton() {
    this.button = this.add.dom(
      BUTTON_POSITION.x,
      BUTTON_POSITION.y,
      "button",
      INPUT_STYLE,
      "ADD",
    );
    this.button.addListener("click");
    this.button.on("click", this.handleAddButtonClick, this);
  }

  /**
   * Handles the add button click event.
   * @param {Event} event - The click event.
   */
  handleAddButtonClick(event) {
    if (event.target.innerHTML === "ADD") {
      this.registry.set("titles", this.inputText.node.value);
      this.registry.set("dk", DK_INITIAL_VALUE);
      this.beep.play();
    }
    this.scene.remove(TEXT_SCENE_KEY);
  }

  /**
   * Creates the cancel text message.
   */
  createCancelText() {
    this.add.bitmapText(
      TEXT_POSITION.x,
      TEXT_POSITION.y,
      "font",
      "PRESS [Z] TO CANCEL",
      TEXT_SIZE,
    );
  }

  /**
   * Sets up keyboard listeners for the scene.
   */
  setupKeyboardListeners() {
    this.input.keyboard.on("keydown_ENTER", this.handleEnterKey, this);
  }

  /**
   * Handles the Enter key press event.
   * @param {Event} event - The keydown event.
   */
  handleEnterKey(event) {
    this.registry.set("titles", this.inputText.node.value);
    this.registry.set("dk", DK_INITIAL_VALUE);
    this.beep.play();
    this.scene.remove(TEXT_SCENE_KEY);
  }
}
