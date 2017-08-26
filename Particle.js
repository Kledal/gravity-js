class Particle {
  constructor(position, color, mass) {
    this.position = position;
    this.mass = mass;
    this.color = color;
    this.velocity = new Vector(0, 0);
    this.absorbed = false;

    this.calculateRadius();
  }

  calculateRadius() {
    this.radius = Math.cbrt(this.mass);
  }

  absorb(particle) {
    let totalMass = this.mass + particle.mass;

    this.velocity.x = (this.velocity.x * this.mass + particle.velocity.x * particle.mass) / (totalMass);
    this.velocity.y = (this.velocity.y * this.mass + particle.velocity.y * particle.mass) / (totalMass);
    this.position.x = (this.position.x * this.mass + particle.position.x * particle.mass) / (totalMass);
    this.position.y = (this.position.y * this.mass + particle.position.y * particle.mass) / (totalMass);

    this.mass += particle.mass;
    this.calculateRadius();
    particle.absorbed = true;
  }

  applyForce(vector) {
    this.velocity.x += vector.x / this.mass;
    this.velocity.y += vector.y / this.mass;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  render(ctx, offset, zoomFactor) {
    ctx.beginPath();
    ctx.arc(this.position.x * zoomFactor + offset.x, this.position.y  * zoomFactor + offset.y, this.radius * zoomFactor, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color.toRGB();
    ctx.fill();
  }
}