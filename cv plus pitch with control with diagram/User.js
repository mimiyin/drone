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

    // Draw diagram
    push();

    translate(this.loc.x, this.loc.y);
    rotate(this.a);
    stroke(0, 32);
    for (let r = 0; r < ratios.length; r++) {
      let ratio = ratios[r];
      let dir = map(ratio.num / ratio.den, 1, 2, -90, 270);
      let h = 25 - (ratio.num + ratio.den);
      //strokeWeight(25 - (ratio.num + ratio.den));
      push();
      rotate(dir);
      //line(0, 0, diag / 2, 0);
      // stroke(200);
      noStroke();
      fill(255,80);
      rect(0, -h/2, diag, h);
      pop();
    }

    // Go around again to draw labels for the notes
    for (let r = 0; r < ratios.length; r++) {
      let ratio = ratios[r];
      let dir = map(ratio.num / ratio.den, 1, 2, -90, 270);
      push();
      rotate(dir);
      translate(diag/4, 0);
      rotate(r + 90);
      noStroke();
      fill(255,200);
      textSize(24);
      textAlign(CENTER,CENTER);
      text(solfege[r], 0, 0);
      pop();
    }
    pop();

    // Draw user in the center
    fill('white');
    stroke('red');
    strokeWeight(1.5);
    ellipse(this.loc.x, this.loc.y, this.d, this.d);
    // Text
    let displayAngle;
    if (this.a<0) {
      displayAngle = round(map(this.a,-90,0,270,360));
    }else {
      displayAngle = round(this.a);
    }
    textAlign (CENTER,CENTER);
    noStroke();
    fill('red');
    textSize(10);
    text(displayAngle + "°", this.loc.x, this.loc.y);
    // Triangle
    push();
    translate(this.loc.x, this.loc.y);
    rotate(this.a);
    fill('red');
    triangle(-this.off, -this.r, this.off, -this.r, 0, -(this.r + this.off));
    pop();




  }
}
