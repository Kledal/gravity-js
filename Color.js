class Color {
  constructor(r, g, b) {
    this.r = Math.floor(Math.random() * 255);
    this.g = Math.floor(Math.random() * 255);
    this.b = Math.floor(Math.random() * 255);
  }

  toRGB() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
}