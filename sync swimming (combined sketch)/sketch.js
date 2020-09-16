let state = 0;
let temploc;
let points = [
  [288, 263],
  [322, 280],
  [322, 323],
  [285, 349],
  [257, 317],
  [252, 275],
];
let num = 3; //points to track
var cnv;
var capture;
var curpyr, prevpyr, pointCount, pointStatus, prevxy, curxy;
var w = 600,
  h = 600;
var maxPoints = 1000;

let diag = 0;
let r; // map tone

// Locations
let locs = [];

// User
let user;
// Reference point
let tonic;


// ---------------------- USER ----------------------
let dists = []; // distances from rects to ellipses

// rect
let rposx, rposy; // rect position
let rr = 270; // starting rotation
let counter = 0;
let tx = [0, 0, 0]; //trackx
let ty = [0, 0, 0]; //tracky
let v, vx, vy;
let pannings = [1, 1, 1];
let angs = [0, 0, 0];

function setup() {


  capture = createVideo('swim1.mp4');
  capture.play();
  capture.hide();

  createCanvas(w, h);

  curpyr = new jsfeat.pyramid_t(3);
  prevpyr = new jsfeat.pyramid_t(3);
  curpyr.allocate(w, h, jsfeat.U8C1_t);
  prevpyr.allocate(w, h, jsfeat.U8C1_t);

  pointCount = 0;
  pointStatus = new Uint8Array(maxPoints);
  prevxy = new Float32Array(maxPoints * 2);
  curxy = new Float32Array(maxPoints * 2);


  angleMode(DEGREES);
  // textAlign(CENTER, CENTER);
  rectMode(CENTER);
  strokeCap(PROJECT);

  // Calculate diag
  diag = sqrt(sq(width) + sq(height));

  // Position the user in the center
  user = createVector(width / 2, height / 2);

  // Listen for pitch change from server
  tonic = new p5.Oscillator(base, "sine");
  tonic.amp(0.5);
  tonic.start();

  // rect
  rposx = width / 2;
  rposy = height / 2;
}

// tracking stuff
function addPoint(x, y) {
  if (pointCount < maxPoints) {
    var pointIndex = pointCount * 2;
    curxy[pointIndex] = x;
    curxy[pointIndex + 1] = y;
    pointCount++;
  }
}

function prunePoints() {
  var outputPoint = 0;
  for (var inputPoint = 0; inputPoint < pointCount; inputPoint++) {
    if (pointStatus[inputPoint] == 1) {
      if (outputPoint < inputPoint) {
        var inputIndex = inputPoint * 2;
        var outputIndex = outputPoint * 2;
        curxy[outputIndex] = curxy[inputIndex];
        curxy[outputIndex + 1] = curxy[inputIndex + 1];
      }
      outputPoint++;
    }
  }
  pointCount = outputPoint;
}


let mUser = false;

function mousePressed() {
  if (state == 0) {
    state++
  }
  repeat();
}

function keyPressed() {
  if (key === 'a') {
    num = 1;
  }
  if (key === 's') {
    num = 2;
  }
  if (key === 'd') {
    num = 3;
  }
}

function repeat() {
  // console.log(a"repeating");
  points = [
    // -----SWIM------
    // // [288, 263],
    // [322, 280],
    // // [322, 323],
    // [285, 349],
    // // [257, 317],
    // [252, 275],

    [288, 263],
    // [322, 280],
    [322, 323],
    // [285, 349],
    [257, 317],
    // [252, 275],
  ]
  pointCount = 0;
  capture.stop();
  capture.play();
  capture.speed(0.4);
  for (i = 0; i < num; i++) {
    let rando = 0;
    // let rando = round(random(7 - i));
    addPoint(points[rando][0], points[rando][1]);
    locs.push(new Location(points[rando][0], points[rando][1]));
    points.splice(rando, 1);
  }
}


// function mouseDragged() {
//   // Check user
//   if (mUser) {
//     user.x = mouseX;
//     user.y = mouseY;
//   }
//   // Check locs
//   else {
//     for (let loc of locs) {
//       if (loc.hover() || loc.moosing) {
//         loc.moose();
//         loc.moosing = true;
//       }
//     }
//   }
// }

// Zap them or Create them
function mouseReleased() {
  //     mUser = false;
  //     let removing = false;
  //     for (let l = locs.length - 1; l >= 0; l--) {
  //       let loc = locs[l];

  //       // Remove them
  //       if (loc.hover() && !loc.moosing) {
  //         loc.stop();
  //         locs.splice(l, 1);
  //         removing = true;
  //       }

  //       // Turn off moosing
  //       loc.moosing = false;
  //     }
  //     if (!removing && !onUser()) locs.push(new Location(mouseX, mouseY));
}

function onUser() {
  let mouse = createVector(mouseX, mouseY);
  let d = p5.Vector.sub(mouse, user).mag();
  return d < 25;
}

function draw() {

  // Draw Scale
  background(0);
  image(capture, 0, 0);

  // tracking stuff
  capture.loadPixels();
  if (capture.pixels.length > 0) { // don't forget this!
    var xyswap = prevxy;
    prevxy = curxy;
    curxy = xyswap;
    var pyrswap = prevpyr;
    prevpyr = curpyr;
    curpyr = pyrswap;

    // these are options worth breaking out and exploring
    var winSize = 20;
    var maxIterations = 30;
    var epsilon = 0.01;
    var minEigen = 0.001;

    jsfeat.imgproc.grayscale(capture.pixels, w, h, curpyr.data[0]);
    curpyr.build(curpyr.data[0], true);
    jsfeat.optical_flow_lk.track(
      prevpyr, curpyr,
      prevxy, curxy,
      pointCount,
      winSize, maxIterations,
      pointStatus,
      epsilon, minEigen);
    prunePoints();

    for (var i = 0; i < pointCount; i++) {
      var pointOffset = i * 2;
      // var speed = Math.abs(prevxy[pointOffset] - curxy[pointOffset]);
      var r = 8;
      fill('red');
      ellipse(curxy[pointOffset], curxy[pointOffset + 1], r, r);
    }
  }



  // Draw user in the center
  fill("white");
  // ellipse(rposx, rposy, 50, 50);

  user.x = rposx;
  user.y = rposy;

  for (let l = locs.length - 1; l >= 0; l--) {
    let loc = locs[l];
    temploc = l;
    loc.run();
    loc.moose();
  }

  // rect
  if (keyIsDown(LEFT_ARROW)) {
    rr -= 2;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    rr += 2;
  }
  if (keyIsDown(UP_ARROW)) {
    rposx += cos(rr);
    rposy += sin(rr);
  }
  if (keyIsDown(DOWN_ARROW)) {
    rposx = rposx - cos(rr);
    rposy = rposy - sin(rr);
  }


  push();
  translate(rposx, rposy);
  angleMode(DEGREES);
  rotate(rr);

  // body
  noFill();
  rectMode(CENTER);
  stroke(0);
  rect(0, 0, 20, 20);
  if (rposx > width) {
    rposx = width;
  }
  if (rposx < 0) {
    rposx = 0;
  }

  if (rposy > height) {
    rposy = height;
  }
  if (rposy < 0) {
    rposy = 0;
  }

  // hat
  stroke(255, 0, 0);
  line(10, -10, 10, 10);
  pop();

  // get angle
  rr = rr % 360;
  if (rr < 0) {
    rr = map(rr, 0, -360, 360, 0);
  }

  let myDegrees = rr;
  // Display that variable in an onscreen text.
  let readout = 'angle = ' + nfc(myDegrees, 1) + '\xB0';
  noStroke();
  fill(0);
  text(readout, 5, 15);

  // Create a p5.Vector using the fromAngle function,
  // and extract its x and y components.
  v = p5.Vector.fromAngle(radians(myDegrees), 30);
  vx = v.x;
  vy = v.y;

  push();
  translate(rposx, rposy);
  noFill();
  stroke(0);
  line(0, 0, vx, vy);
  pop();
  // console.log(tx, ty);

  for (let i = 0; i < num; i++) {

    angleMode(RADIANS);
    let v0 = createVector(rposx, rposy); // orgin
    let v1 = createVector(vx, vy); // point 1
    drawArrow(v0, v1, 'red');
    // let v2 = createVector(tx[i] - rposx, ty[i] - rposy); // point 2
    let v2 = createVector(tx[i] - rposx, ty[i] - rposy); // point 2
    drawArrow(v0, v2, 'blue');

    let angleBetween = v1.angleBetween(v2);

    let a0 = createVector(vx, vy, 0);
    let a1 = createVector(tx[i] - rposx, ty[i] - rposy, 0);
    let ang = degrees(a0.angleBetween(a1)); // use for pitching
    angs[i] = ang;
    angleBetween = degrees(angleBetween);
    angleBetween = round(angleBetween, 2);
    fill(0, 0, 255);
    // text(angleBetween + '\xB0', balls[0].x - 5, balls[0].y + 10);
    angleMode(DEGREES);


    let panning;
    let vola, vold; // volume based on angle and disntance

    if (angleBetween > -90 && angleBetween < 90) {
      panning = map(angleBetween, 90, -90, 0.9, -0.9);
    } else if (angleBetween <= -90) {
      panning = map(angleBetween, -90, -180, -0.9, 0);
    } else if (angleBetween >= 90) {
      panning = map(angleBetween, 90, 180, 0.9, 0);
    }
    // oscs[i].pan(panning);
    pannings[i] = panning;
    if (angleBetween < 0) {
      angleBetween = angleBetween * -1;
    }
    vola = map(angleBetween, 0, 180, 1, 0, true);
    vold = map(dists[i], 0, dist(0, 0, width, height) / 2, 1, 0, true); // distance
    let vol = (vola + vold) / 2;
    // console.log(round(vola, 2), round(vold, 2), round(vol, 2));
    noStroke();
    fill(0);
    // text("freq: " + round(frqs[i], 2), balls[i].x - 5, balls[i].y - 15);
    text("panning:" + round(panning, 2), tx[i] + 10, ty[i] + 12);
    text("ang:" + round(ang), tx[i] + 10, ty[i] + 24);
    // oscs[i].amp(vol, 0.1);
  }

}

// draw an arrow for a vector at a given base position
function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(1);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
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