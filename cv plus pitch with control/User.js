class User {

  constructor(x, y, d) {
    this.loc = createVector(x, y);
    this.d = d;
    this.r = this.d / 2;
    this.off = this.d / 2.5;
    this.a = 0;
  }


  onHead(x, y) {
    let other = createVector(x, y);
    let d = p5.Vector.sub(other, this.loc).mag();
    return d < this.r;
  }

  onNose(x, y) {
    let other = createVector(x, y);
    let d = p5.Vector.sub(other, this.loc).mag();
    return d > this.r && d < this.r + this.off;
  }

  orient(x, y) {
    console.log("ORIENT");
    let other = createVector(x, y);
    let diff = p5.Vector.sub(other, this.loc);
    this.a = diff.heading() + 90;
  }

  update(x, y) {
    this.loc.x = x;
    this.loc.y = y;
  }

  display() {
    // Draw user in the center
    fill('white');
    stroke(255, 0, 0);
    ellipse(this.loc.x, this.loc.y, this.d, this.d);
    push();
    translate(this.loc.x, this.loc.y);
    rotate(this.a);
    fill(255, 0, 0);
    triangle(-this.off, -this.r, this.off, -this.r, 0, -(this.r + this.off));
    pop();
  }
}
