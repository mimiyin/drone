class Location {
  constructor(x, y) {
    this.loc = createVector(x, y);
    this.diam = 10;
    // this.note = loadSound(
    //   "https://cdn.glitch.com/af5d47e4-f2de-4786-b7f9-54bc5f643171%2Ffoghorn.wav?v=1596813716243"
    // );
    this.note = loadSound(
      "bell.wav"
    );

    this.play = true;
    this.update();
  }

  run(ua) {
    this.update(ua);
    this.display();
  }
  // Pass angle from the user
  update(ua) {
    let diff = p5.Vector.sub(this.loc, user);
    let d = diff.mag();
    let amp = map(d, 0, diag / 4, 1, 0, true);
    // Amplify amplitude
    this.note.setVolume(sq(amp));
    let t = map(amp, 0, 1, 600, 10, true);
    t = floor(sqrt(t));

    // Calculate the angle of this location
    // Use angleBetween userAngle and thisLocationAngle to calculate a
    let a = diff.heading() - ua;
    console.log(a);
    // Map pitch
      let p
    if (p< 0) { // in front triangle
        p = map(abs(a), -180, 0, -1, 1);
    } else { // behind triangle
        p = map(abs(a), 180, 0, -1, 1);
    }

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
    // Set pan
    // console.log(p);
    if (p) this.note.pan(p);

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
    return d < this.diam / 2;
  }

  moose(x, y) {
    this.loc.x = x;
    this.loc.y = y;
  }

  display() {
    fill('red');
    ellipse(this.loc.x, this.loc.y, this.diam, this.diam);
  }
}