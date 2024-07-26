import { GameObjects, Scene } from "phaser";

import {
  ALPHA_CONTROL_POSITION,
  DEFAULT_FONT_SIZE,
  FONT_HOVER_COLOR,
  FONT_OPTIONS,
  FONT_SCALES,
  FONT_SELECT_LABEL_TEXT,
  FONT_SIZE_LABEL_POSITION,
  FONT_SIZE_LABEL_TEXT,
  FONT_SIZE_POSITION,
  INPUT_STYLE,
  INPUT_STYLE_RANGE,
  TEXT_SELECT_FONT_POSITION,
} from "../utils/constants";

/**
 * Scene for editing text properties like font, alpha, and size.
 */
export default class TextEditor extends Scene {
  constructor() {
    super({ key: "editor" });
  }

  /**
   * Initializes the scene with data.
   * @param {Object} data - The data object containing text element.
   * @param {GameObjects.BitmapText} data.txt - The text element to edit.
   */
  init(data) {
    this.textElement = data.txt;
  }

  /**
   * Creates the scene with font selection, alpha control, and font size buttons.
   */
  create() {
    this.createFontSelection();
    this.createAlphaControl();
    this.createFontSizeButtons();
  }

  /**
   * Creates the font selection options.
   */
  createFontSelection() {
    this.add.bitmapText(
      TEXT_SELECT_FONT_POSITION.x,
      TEXT_SELECT_FONT_POSITION.y,
      "font",
      FONT_SELECT_LABEL_TEXT,
      DEFAULT_FONT_SIZE,
    );

    FONT_OPTIONS.forEach((option) => {
      const fontOption = this.add
        .bitmapText(
          option.x,
          option.y,
          option.key,
          option.label,
          DEFAULT_FONT_SIZE,
        )
        .setInteractive()
        .setName(option.key);

      if (this.textElement.font === option.key) {
        fontOption.setTint(FONT_HOVER_COLOR);
      }

      fontOption.on("pointerdown", () => this.setFont(option.key));
      fontOption.on("pointerover", () => fontOption.setTint(FONT_HOVER_COLOR));
      fontOption.on("pointerout", () => this.updateFontTint());
    });
  }

  /**
   * Updates the tint of font options based on the current font.
   */
  updateFontTint() {
    FONT_OPTIONS.forEach((option) => {
      const fontOption = this.children.getByName(option.key);
      if (fontOption) {
        if (this.textElement.font === option.key) {
          fontOption.setTint(FONT_HOVER_COLOR);
        } else {
          fontOption.clearTint();
        }
      }
    });
  }

  /**
   * Sets the font of the text element and updates the font tint.
   * @param {string} font - The font to set.
   */
  setFont(font) {
    this.textElement.setFont(font);
    this.updateFontTint();
  }

  /**
   * Creates the alpha control slider.
   */
  createAlphaControl() {
    this.add.bitmapText(
      ALPHA_CONTROL_POSITION.textX,
      ALPHA_CONTROL_POSITION.textY,
      "font",
      `ALPHA ${this.textElement.alpha}`,
      DEFAULT_FONT_SIZE,
    );

    const alphaRange = this.add.dom(
      ALPHA_CONTROL_POSITION.rangeX,
      ALPHA_CONTROL_POSITION.rangeY,
      "input",
      INPUT_STYLE_RANGE,
    );
    alphaRange.node.type = "range";
    alphaRange.node.min = 0.1;
    alphaRange.node.max = 1.0;
    alphaRange.node.step = 0.1;
    alphaRange.node.defaultValue = this.textElement.alpha;

    alphaRange.addListener("change");
    alphaRange.on("change", (event) => {
      const alpha = event.target.value;
      this.textElement.setAlpha(alpha);
      this.updateAlphaText(alpha);
    });
  }

  /**
   * Updates the alpha text display.
   * @param {number} alpha - The new alpha value.
   */
  updateAlphaText(alpha) {
    const alphaText = this.add.bitmapText(
      ALPHA_CONTROL_POSITION.textX,
      ALPHA_CONTROL_POSITION.textY,
      "font",
      `ALPHA ${alpha}`,
      DEFAULT_FONT_SIZE,
    );
    alphaText.setText(`ALPHA ${alpha}`);
  }

  /**
   * Creates the font size buttons.
   */
  createFontSizeButtons() {
    this.add.bitmapText(
      FONT_SIZE_LABEL_POSITION.x,
      FONT_SIZE_LABEL_POSITION.y,
      "font",
      FONT_SIZE_LABEL_TEXT,
      DEFAULT_FONT_SIZE,
    );

    FONT_SCALES.forEach((scale, index) => {
      const buttonX =
        FONT_SIZE_POSITION.buttonXStart +
        index * FONT_SIZE_POSITION.buttonOffset;
      const button = this.add.dom(
        buttonX,
        FONT_SIZE_POSITION.buttonY,
        "button",
        INPUT_STYLE,
        `x${index + 1}`,
      );

      button.addListener("click");
      button.on("click", () => this.setFontSize(scale));
    });
  }

  /**
   * Sets the font size of the text element.
   * @param {number} scale - The scale factor to set.
   */
  setFontSize(scale) {
    this.textElement.setScale(scale);
    this.textElement.getTextBounds();
  }
}
