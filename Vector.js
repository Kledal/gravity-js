class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distanceFrom(vector) {
    let distX = this.x - vector.x;
    let distY = this.y - vector.y;
    let sqrt = distX * distX + distY * distY;
    return Math.sqrt(sqrt);
  }
}