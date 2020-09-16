// Length of diag of screen
let diag = 0;

// Locations
let locs = [];

// User
let user;
// Reference point
let tonic;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  strokeCap(PROJECT);

  // Calculate diag
  diag = sqrt(sq(width) + sq(height));

  // Position the user in the center
  user = createVector(width / 2, height / 2);

  // Listen for pitch change from server
  tonic = new p5.Oscillator(base, "sine");
  tonic.amp(1);
  tonic.start();
}

let mUser = false;

// Reset moosing status on mousedown
function mousePressed() {
  if (onUser()) {
    // if exists
    mUser = true;
  } else {
    // if doesn't exist
    for (let loc of locs) {
      if (loc.hover()) {
        loc.moosing = false;
      }
    }
  }
}

function mouseDragged() {
  // Check user
  if (mUser) {
    user.x = mouseX;
    user.y = mouseY;
  }
  // Check locs
  else {
    for (let loc of locs) {
      if (loc.hover() || loc.moosing) {
        loc.moose();
        loc.moosing = true;
      }
    }
  }
}

// Zap them or Create them
function mouseReleased() {
  mUser = false;
  let removing = false;
  for (let l = locs.length - 1; l >= 0; l--) {
    let loc = locs[l];

    // Remove them
    if (loc.hover() && !loc.moosing) {
      loc.stop();
      locs.splice(l, 1);
      removing = true;
    }

    // Turn off moosing
    loc.moosing = false;
  }
  if (!removing && !onUser()) locs.push(new Location(mouseX, mouseY));
}

function onUser() {
  let mouse = createVector(mouseX, mouseY);
  let d = p5.Vector.sub(mouse, user).mag();
  return d < 25;
}

function draw() {
  // Draw Scale
  background(0);
  // Draw user in the center
  fill("white");
  ellipse(user.x, user.y, 50, 50);

  for (let l = locs.length - 1; l >= 0; l--) {
    let loc = locs[l];
    loc.run();
    
  }
  // console.log(locs[0]);
}

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
    // this.note.pan(p);

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
    this.loc.x = mouseX;
    this.loc.y = mouseY;
  }

  display() {
    fill("red");
    ellipse(this.loc.x, this.loc.y, this.diam, this.diam);
  }
}