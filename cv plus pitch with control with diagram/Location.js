class Location {
  constructor(x, y) {
    this.loc = createVector(x, y);
    this.d = 10;
    this.r = this.d / 2;
    this.note = loadSound(
      "https://cdn.glitch.com/af5d47e4-f2de-4786-b7f9-54bc5f643171%2Ffoghorn.wav?v=1596813716243"
    );
    this.noteText; // for display
    this.panText; // for display

    // this.note = loadSound(
    //   "bell.wav"
    // );

    this.play = true;
  }

  run(other) {
    this.update(other);
    this.display(other);
  }
  // Pass angle from the user
  update(other) {
    let diff = p5.Vector.sub(this.loc, other.loc);
    let d = diff.mag();
    let amp = map(d, 0, diag / 4, 1, 0, true);
    // Amplify amplitude
    this.note.setVolume(sq(amp));
    let t = map(amp, 0, 1, 600, 10, true);
    t = floor(sqrt(t));

    // Calculate the angle of this location
    // Use angleBetween userAngle and thisLocationAngle to calculate a
    let a = diff.heading() - other.a;
    // Map pitch
    let p = map(abs(a%180), 180, 0, -1, 1);

    // Rotate angle 90-degrees clockwise
    a -= 90;
    if (a < -180) a = map(a, -180, -270, 180, 90);
    // Map pitch
    let r = map(a, -180, 180, 1, 2);


    // Snap to closest diatonic note
    let closest = 10;
    let nr = r;
    for (let ratio of ratios) {
      let _r = ratio.num / ratio.den;
      let dr = abs(r - _r);
      if (dr < closest) {
        nr = _r;
        closest = dr;
      }
    }
    // console.log("tempo", t);
    r = nr;
    // Set frequency
    this.note.rate(r);
    this.noteText = r;
    // Set pan
    // console.log(p);
    if (p) this.note.pan(p);
    if (p) this.panText = p;
    // Framecount
    if (frameCount % t == 0) {
      this.play = !this.play;
      if (this.play) this.note.play();
      else this.note.stop();
    }
  }

  stop() {
    this.note.stop();
  }

  hover() {
    let mouse = createVector(mouseX, mouseY);
    let d = p5.Vector.sub(mouse, this.loc).mag();
    return d < this.r;
  }

  moose(x, y) {
    this.loc.x = x;
    this.loc.y = y;
  }

  display(other) {
    noStroke();
    fill(0,0,255);
    stroke(0,0,255);
    strokeWeight(1);
    ellipse(this.loc.x, this.loc.y, this.d, this.d);
    line(this.loc.x, this.loc.y, other.loc.x, other.loc.y);

    // texts
    let ts = 10; // text size
    textSize(ts);
    stroke(0,0,255);
    strokeWeight(0.5);
    textAlign (LEFT,BOTTOM);
    text("x:" + round(this.loc.x) + " y:" + round(this.loc.y), this.loc.x + ts, this.loc.y);
    text("note: " + round3 (this.noteText) , this.loc.x + ts, this.loc.y + ts);
    text("pan: " + round3 (this.panText), this.loc.x + ts, this.loc.y + ts*2);

  }
}

function round3(n) {
  return Number.parseFloat(n).toFixed(3);
}
