class Location {
  constructor(x, y) {
    this.loc = createVector(x, y);
    this.diam = 10;
    this.note = loadSound(
      "https://cdn.glitch.com/af5d47e4-f2de-4786-b7f9-54bc5f643171%2Ffoghorn.wav?v=1596813716243"
    );
    this.play = true;
    this.update();
  }

  run() {
    this.update();
    this.display();

  }

  update() {
    let diff = p5.Vector.sub(this.loc, user);
    let d = diff.mag();
    let amp = map(d, 0, diag / 4, 1, 0, true);
    // Amplify amplitude
    this.note.setVolume(sq(amp));
    let t = map(amp, 0, 1, 600, 10, true);
    t = floor(sqrt(t));

    let a = diff.heading();
    // Map pitch
    let p = map(abs(a), 180, 0, -1, 1);

    // Rotate angle 90-degrees clockwise
    a -= 90;
    if (a < -180) a = map(a, -180, -270, 180, 90);
    // Map pitch
    //original -180,180
    // let newAng = angs[counter] + 180;
    // console.log(newAng);
    if (angs[counter] < 0) {
      r = map(angs[counter], -180, 0, 1.5, 2); // map new pitch
    } else {
      r = map(angs[counter], 0, 180, 1, 1.5); // map new pitch
    }


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
    this.note.pan(pannings[counter]);

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

  moose() {
    var pointOffset = temploc * 2;
    this.loc.x = curxy[pointOffset]; // here
    this.loc.y = curxy[pointOffset + 1]; // here

    tx[counter] = this.loc.x;
    ty[counter] = this.loc.y;

    counter = counter + 1;
    if (counter >= num) {
      counter = 0;
    }

    // display texts
    fill(0);
    text("x:" + str(round(this.loc.x)) + ", y:" + str(round(this.loc.y)), this.loc.x + 10, this.loc.y);

  }


  display() {
    fill("blue");
    ellipse(this.loc.x, this.loc.y, this.diam, this.diam);
  }
}
