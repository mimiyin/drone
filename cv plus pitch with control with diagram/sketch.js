// https://inspirit.github.io/jsfeat/sample_oflow_lk.html

let cnv;
let capture;
let curpyr, prevpyr, pointCount, pointStatus, prevxy, curxy;
let w = 600,
h = 600;
let maxPoints = 1000;

// Keep track of pitches
let locs = {};
let user;
let a = 0;

// Calc max distance
let diag;

// Reference point
let tonic;

// Keep track of play status of video
let play = true;

function preload() {
  capture = createVideo('walking-5-persons-sparse.mp4');
  capture.loop();
}

function setup() {
  // capture = createCapture({
  //   audio: false,
  //   video: {
  //     width: w,
  //     height: h
  //   }
  // }, function() {
  //   console.log('capture ready.')
  // });

  angleMode(DEGREES);



  capture.elt.setAttribute('playsinline', '');
  cnv = createCanvas(w, h);
  capture.size(w, h);
  capture.hide();

  curpyr = new jsfeat.pyramid_t(3);
  prevpyr = new jsfeat.pyramid_t(3);
  curpyr.allocate(w, h, jsfeat.U8C1_t);
  prevpyr.allocate(w, h, jsfeat.U8C1_t);

  pointCount = 0;
  pointStatus = new Uint8Array(maxPoints);
  prevxy = new Float32Array(maxPoints * 2);
  curxy = new Float32Array(maxPoints * 2);

  // Hard-code user for now
  user = new User(width / 2, height / 2, 25);
  diag = sqrt(sq(width) + sq(height));

  // Listen for pitch change from server
  tonic = new p5.Oscillator(base, "sine");
  tonic.amp(0.5);
  tonic.start();
}

// Move user
let mUser = false;
// Orient user
let oUser = false;


// Play / pause video
function keyPressed() {
  if (key == ' ') {
    play = !play;
    if (play) capture.play();
    else capture.pause();
  }
}

// Reset moosing status on mousedown
function mousePressed() {
  mUser = user.onHead(mouseX, mouseY);
  oUser = user.onNose(mouseX, mouseY);
}

function mouseDragged() {
  // Check user
  if (mUser) {
    user.update(mouseX, mouseY)
  } else if (oUser) {
    // Orient user towards mouse
    user.orient(mouseX, mouseY);
  }
}


function mouseReleased() {
  let removing = false;
  // Loop through all the locations
  for (let l in locs) {
    let loc = locs[l];
    // Remove them
    if (loc.hover()) {
      console.log("REMOVING POINT ", l);
      loc.stop();
      delete locs[l];
      removing = true;
    }
  }

  // Only add if not deleting
  if (!removing && !mUser && !oUser) addPoint(mouseX, mouseY);

  // Reset user status
  mUser = false;
  oUser = false;
}


// ------------- CV -------------

// Add point to track
// Return its index
function addPoint(x, y) {
  console.log("ADDING POINT ", pointCount);
  if (pointCount < maxPoints) {
    var pointIndex = pointCount * 2;
    curxy[pointIndex] = x;
    curxy[pointIndex + 1] = y;
    locs[pointCount] = new Location(x, y);
    pointCount++;
  }
}

// Get rid of points that have disappeared
function prunePoints() {
  var outputPoint = 0;

  for (var inputPoint = 0; inputPoint < pointCount; inputPoint++) {
    var outputIndex = outputPoint * 2;

    if (pointStatus[inputPoint] == 1) {
      // Only if pruning is needed
      if (outputPoint < inputPoint) {
        var inputIndex = inputPoint * 2;
        curxy[outputIndex] = curxy[inputIndex];
        curxy[outputIndex + 1] = curxy[inputIndex + 1];
      }
      if (locs[outputPoint]) locs[outputPoint].moose(curxy[outputIndex], curxy[outputIndex + 1]);
      outputPoint++;
    }
  }
  pointCount = outputPoint;
}

// ------------- DRAW -------------

function draw() {
  image(capture, 0, 0, w, h);

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

      // Go through every other location
      for (let l in locs) {
        let loc = locs[l];
        if (loc) loc.run(user);
      }
    }

    // Draw the user
    user.display();


  }
