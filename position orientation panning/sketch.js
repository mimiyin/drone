// CLICK ON SKETCH
// USE ARROWS TO MOVE AROUND

//NUMBER OF OSCS
let num = 2; // max 8

// Array of oscillators
let oscs = [];
// Note ratios
let notes = [1, 1.125, 1.25, 1.334, 1.5, 1.667, 1.875, 2];
let frqs = [];
// Base frequency
let BASE = 261.63;

// let sounds = [];
let dists = []; // distances from rects to ellipses

// ellipse
let balls = [];

// rect
let rposx, rposy; // rect position
let r = 270; // starting rotation

function preload() {
  // for (let i = 0; i < num; i++) {
  //   sounds.push(loadSound(i + ".mp3"));
  // }
  for (let i = 0; i < num; i++) {
    let osc = new p5.Oscillator();
    osc.setType('sine');

    f = random(notes);


    for (let n = 0; n < notes.length; n++) {
      if (f == notes[n]) {
        notes.splice(n, 1);
      }
    }
    f = BASE * f;
    frqs.push(f);
    osc.freq(f);
    osc.start();
    osc.amp(0);
    // Fade it in over 5 seconds
    osc.amp(1, random(5, 10));
    // Add it to the array of oscillators
    oscs.push(osc);
  }
}

function setup() {
  createCanvas(600, 600);
  // sound
  // for (let i = 0; i < num; i++) {
  //   sounds[i].play();
  // }

  //ellipse
  for (let i = 0; i < num; i++) {
    // Create a new ball
    // Store it in the array
    balls.push(new Ball(random(width), random(height), random(0.2), random(0.2)));
     // balls.push(new Ball(random(width), random(height), random(10), random(10)));
  }
  // rect
  rposx = width / 2;
  rposy = height / 2;
}

function draw() {
  background(220);

  // ellipse
  for (let i = 0; i < num; i++) {
    noFill();
    stroke(0);
    balls[i].run();
    dists[i] = dist(balls[i].x, balls[i].y, rposx, rposy);
  }


  // rect
  if (keyIsDown(LEFT_ARROW)) {
    r -= 2;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    r += 2;
  }
  if (keyIsDown(UP_ARROW)) {
    rposx += cos(r);
    rposy += sin(r);
  }
  if (keyIsDown(DOWN_ARROW)) {
    rposx = rposx - cos(r);
    rposy = rposy - sin(r);
  }

  push();
  translate(rposx, rposy);
  angleMode(DEGREES);
  rotate(r);

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
  r = r % 360;
  if (r < 0) {
    r = map(r, 0, -360, 360, 0);
  }

  let myDegrees = r;
  // Display that variable in an onscreen text.
  let readout = 'angle = ' + nfc(myDegrees, 1) + '\xB0';
  noStroke();
  fill(0);
  text(readout, 5, 15);

  // Create a p5.Vector using the fromAngle function,
  // and extract its x and y components.
  let v = p5.Vector.fromAngle(radians(myDegrees), 30);
  let vx = v.x;
  let vy = v.y;

  push();
  translate(rposx, rposy);
  noFill();
  stroke(0);
  line(0, 0, vx, vy);
  pop();

  for (let i = 0; i < num; i++) {

    angleMode(RADIANS);
    let v0 = createVector(rposx, rposy); // orgin
    let v1 = createVector(vx, vy); // point 1
    drawArrow(v0, v1, 'red');
    let v2 = createVector(balls[i].x - rposx, balls[i].y - rposy); // point 2
    drawArrow(v0, v2, 'blue');

    let angleBetween = v1.angleBetween(v2);
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
    oscs[i].pan(panning);
    if (angleBetween < 0) {
      angleBetween = angleBetween * -1;
    }
    vola = map(angleBetween, 0, 180, 1, 0, true);
    vold = map(dists[i], 0, dist(0, 0, width, height)/2, 1, 0, true); // distance
    let vol = (vola + vold) / 2;
    // console.log(round(vola, 2), round(vold, 2), round(vol, 2));
    noStroke();
    fill(0);
    text("freq: " + round(frqs[i], 2), balls[i].x - 5, balls[i].y - 15);
    text("panv: " + round(panning, 2), balls[i].x - 5, balls[i].y - 5);
    text("vol: " + round(vol, 2), balls[i].x - 5, balls[i].y + 5);
    oscs[i].amp(vol, 0.1);
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