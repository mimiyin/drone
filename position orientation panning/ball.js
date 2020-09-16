class Ball {
  constructor(x, y, xspeed, yspeed) {
    this.x = x;
    this.y = y;
    this.xspeed = xspeed;
    this.yspeed = yspeed;
    this.r = 10;
  }

  run() {
    this.update();
    this.bounce();
    this.render();
  }

  render() {
    //Draw the ball
    ellipse(this.x, this.y, this.r*2, this.r*2);
  }

  update() {
    // Move the ball
    this.x += this.xspeed;
    this.y += this.yspeed;
  }

  isNear(x, y) {
    return dist(x, y, this.x, this.y) < this.r;
  }

  bounce() {
    // Turn around when you cross a border
    if (this.x > width || this.x < 0) this.xspeed *= -1;
    if (this.y > height || this.y < 0) this.yspeed *= -1;
  }
}