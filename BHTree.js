class BHTree {
  // x is starting point
  // y is starting point
  constructor(x, y, width, height) {
    this.width = width;
    this.height = height;

    this.tree = {
      quads: {},
      type: 'EMPTY',
      body: null,
      bodies: 0,
      width: width,
      height: height
    };
  }

  addBody(particle) {
    this._addBody(particle, this.tree);
  }

  removeBody(particle) {
  }

  _addBody(particle, node) {
    if (node.type === 'EMPTY') {
      node.type = 'PARTICLE';
      node.body = particle;
    } else if(node.type === 'PARTICLE') {
      node.type = 'NODE';

      var quad = this._findQuad(node.body, node);
      var childNode = node.quads[quad];
      if (childNode === undefined) {
        node.quads[quad] = {
          quads: {},
          bodies: 0,
          body: null,
          type: 'EMPTY'
        };
      }

      this._addBody(node.body, node.quads[quad]);
      node.body = null;
    }

    if (node.type === 'NODE') {
      var quad = this._findQuad(particle, node);
      var childNode = node.quads[quad];
      if (childNode === undefined) {
        node.quads[quad] = {
          quads: {},
          bodies: 0,
          body: null,
          type: 'EMPTY'
        };
      }
      this._addBody(particle, node.quads[quad]);
    }
  }

  _findQuad(particle, node) {
    var topOrBottom = particle.position.y > node.height/2 ? 'bottom': 'top';
    var leftOrRight = particle.position.x > node.width/2 ? 'right' : 'left';

    return [topOrBottom, leftOrRight].join('-');
  }
}
