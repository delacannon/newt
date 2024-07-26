import { Pointwise } from "phaser3-autotile";

export default class Grid {
  constructor(x, y, width, height, gridData) {
    this.pointwise = new Pointwise(
      x,
      y,
      width,
      height,
      1,
      1,
      Pointwise.Adjustment.MOD,
    );

    this.grid = new Map(gridData);
    this.isSetCallback = this.pointwise.wrap((x, y) => this.has(x, y));
  }

  has(x, y) {
    return this.grid.has(`${x},${y}`);
  }

  set(x, y) {
    this.grid.set(`${x},${y}`, true);
    this.updateLocalStorage();
  }

  unset(x, y) {
    this.grid.delete(`${x},${y}`);
    this.updateLocalStorage();
  }

  updateLocalStorage() {
    localStorage.setItem("grid", JSON.stringify([...this.grid]));
  }
}
