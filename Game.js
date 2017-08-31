class Game {
  constructor() {
    this.canvas = null;

    this.particles = [];

    this.now = null
    this.dt = 0
    this.last = this.timestamp();
    this.step = 1 / 60;
    this.fps = 0;

    this.gravityConstant = 1;

    this.mousePosition = new Vector(0, 0);
    this.offset = new Vector(0, 0);
    this.zoomFactor = 1;
    this.panning = false;
    this.dragging = false;
    this.focusLargest = false;
    this.createMass = 20;

    this.spawnerMass = 20;

    this.tree = new BHTree(0, 0, 1000, 1000);
  }

  init() {
    this.canvas = document.getElementById('game');
    this.context = this.canvas.getContext('2d');

    window.onresize = () => this.resizeCanvas();

    this.canvas.addEventListener('touchstart', (event) => {
      this.onMouseMove(event);
      this.onMouseDown(event);
    }, false);
    this.canvas.addEventListener('touchmove', this.onMouseMove.bind(this), false);
    this.canvas.addEventListener('touchend', this.onClick.bind(this), false);

    this.canvas.onmouseup = (event) => this.onClick(event);
    this.canvas.onmousedown = (event) => this.onMouseDown(event);
    this.canvas.onmousemove = (event) => this.onMouseMove(event);
    document.getElementsByTagName('body')[0].addEventListener("keyup", (event) => this.onKeyUp(event));

    this.resizeCanvas();

    requestAnimationFrame(this.generateFrame.bind(this));

    //var particle = this.createParticle(new Vector(700, 500), 200000, new Color())
    //particle.velocity = new Vector(0, 0);

    //var particle = this.createParticle(new Vector(600, 500), 2000, new Color())
    //particle.velocity = new Vector(0, 1.0);

    //var particle = this.createParticle(new Vector(500, 500), 2000, new Color())
    //particle.velocity = new Vector(0, 0.7);

  }

  timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
  }

  onKeyUp(event) {
    const { key } = event;

    switch (key) {
      case 'd':
        this.particles.length = 0;
        break;

      case 'c':
        if (this.spawnInterval === undefined) {
          this.spawnInterval = setInterval(() => {
            var par = this.createParticle(new Vector(0, 0), this.spawnerMass, new Color());
            par.velocity = new Vector(3, 3);
          }, 25);
        } else {
          clearInterval(this.spawnInterval);
          this.spawnInterval = undefined;
        }
        break;

      case 'k':
        for (var i = 0; i < 2000; i++) {
          var par = this.createParticle(new Vector(Math.random() * this.width, Math.random() * this.height), 2, new Color());
          par.velocity = new Vector(i / 2000 - 0.5, i / 2000 - 0.5);
        }
        break;
      case ' ':
        var centerX = this.mousePosition.x;
        var centerY = this.mousePosition.y;

        this.createParticle(new Vector(centerX, centerY), 2000, new Color());
        for (var i = 0; i < 1000; i++) {
          var angle = Math.random() * 2 * Math.PI;
          var dist = Math.pow(Math.random() * 9 + 9, 2);
          var x = centerX + dist * Math.cos(angle);
          var y = centerY + dist * Math.sin(angle);
          var vx = 0.3* dist * Math.sin(angle) / 30;
          var vy = 0.3* -dist * Math.cos(angle) / 30;

          var par = this.createParticle(new Vector(x, y), 1, new Color());
          par.velocity = new Vector(vx, vy);
        }
        break;
    }
  }

  onMouseDown(event) {
    this.mouseDownInitial = new Vector(this.mousePosition.x, this.mousePosition.y);

    this.dragging = true;

    if (event.which === 2 || (event.touches && event.touches.length > 1)) {
      this.panning = true;
      this.panningStart = new Vector(this.mousePosition.x, this.mousePosition.y);
      this.oldOffset = new Vector(this.offset.x, this.offset.y);
    }
  }

  onMouseMove(event) {
    this.mousePosition.x = (event.touches && event.touches[0].clientX) || event.clientX;
    this.mousePosition.y = (event.touches && event.touches[0].clientY) || event.clientY;
    this.fps = this.mousePosition.x;

    if (this.panning) {
      var newOffsetX = this.oldOffset.x + this.mousePosition.x - this.panningStart.x;
      var newOffsetY = this.oldOffset.y + this.mousePosition.y - this.panningStart.y;
      this.offset = new Vector(newOffsetX, newOffsetY);

      this.dragging = false;
    }
  }

  onClick(event) {
    if (!this.panning) {
      var position = this.mouseDownInitial;
      var particle = this.createParticle(position, this.createMass, new Color());
      const vX = (this.mousePosition.x - this.mouseDownInitial.x) / 100;
      const vY = (this.mousePosition.y - this.mouseDownInitial.y) / 100;
      particle.velocity = new Vector(vX, vY);
    }

    this.panning = false;
    this.dragging = false;
  }

  createParticle(vector, mass, color) {
    vector = new Vector((vector.x - this.offset.x) / this.zoomFactor, (vector.y - this.offset.y) / this.zoomFactor)
    var particle = new Particle(vector, color, mass);
    particle.velocity = new Vector(0, 0);
    this.addParticle(particle);

    return particle;
  }

  addParticle(particle) {
    this.particles.push(particle);
    this.tree.addBody(particle);
    console.log(this.tree);
  }

  generateFrame() {
    this.now = this.timestamp();
    this.dt = this.dt + Math.min(1, (this.now - this.last) / 1000);
    /* while (this.dt > this.step) {
      this.dt = this.dt - this.step;
      this.update(this.step);
    } */
    this.update(this.dt);

    this.render(this.dt);

    this.last = this.now;
    requestAnimationFrame(this.generateFrame.bind(this));
  }

  update(dt) {
    var len = this.particles.length;

    for (var i = 0; i < len; i++) {
      var particle = this.particles[i];

      if (particle.absorbed) continue;

      var forceSum = new Vector(0, 0);

      for (var j = 0; j < len; j++) {
        if (i === j) continue;
        var particleJ = this.particles[j];

        if (particleJ.absorbed) continue;

        const distance = particle.position.distanceFrom(particleJ.position);
        const totalRadius = particle.radius + particleJ.radius;

        if (distance < totalRadius) {
          if (particle.mass < particleJ.mass) {
            particleJ.absorb(particle);
          } else {
            particle.absorb(particleJ);
          }
        } else {
          var forceMag = (this.gravityConstant * (particleJ.mass)) / (distance * distance);

          var nextStep = forceMag / particle.mass + forceMag / particleJ.mass;
          if (distance < nextStep) {
            particle.absorb(particleJ);
          } else {
            var xDist = particle.position.x - particleJ.position.x;
            var yDist = particle.position.y - particleJ.position.y;
            forceSum.x -= forceMag * (xDist / distance);
            forceSum.y -= forceMag * (yDist / distance);
          }
        }
      }

      if (!particle.absorbed) particle.applyForce(forceSum);
    }

    this.particles = this.particles.filter((particle) => !particle.absorbed);
  }

  render(dt) {
    var particles = this.particles.length;

    this.context.fillStyle = "#000";
    this.context.fillRect(0, 0, this.width, this.height);

    for (var i = 0; i < particles; i++) {
      this.particles[i].render(this.context, this.offset, this.zoomFactor);
    }

    //var fps = Math.round(1 / dt);
    this.context.font = "12px Arial";
    this.context.fillStyle = "#fff";
    this.context.fillText("Particles: " + this.particles.length.toString(), this.width - 80, this.height - 40);
    //this.context.fillText("FPS: " + this.fps, this.width - 80, this.height - 20);

    if (this.dragging) {
      this.context.beginPath();
      this.context.moveTo(this.mouseDownInitial.x, this.mouseDownInitial.y);
      this.context.lineTo(this.mousePosition.x, this.mousePosition.y);
      this.context.strokeStyle = "white";
      this.context.stroke();

      const vX = Math.round((this.mousePosition.x - this.mouseDownInitial.x) / 100, 2);
      const vY =  Math.round((this.mousePosition.y - this.mouseDownInitial.y) / 100, 2);
      this.context.fillText("vX:" + vX + ', vY:' + vY, this.mousePosition.x - 50, this.mousePosition.y - 40);
    }
  }

  resizeCanvas() {
    this.canvas.width = document.body.clientWidth; //document.width is obsolete
    this.canvas.height = document.body.clientHeight; //document.height is obsolete
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
}
