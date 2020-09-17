// https://inspirit.github.io/jsfeat/sample_oflow_lk.html

var cnv;
var capture;
var curpyr, prevpyr, pointCount, pointStatus, prevxy, curxy;
var w = 640,
  h = 480;
var maxPoints = 1000;

// Keep track of pitches
let locs = [];
let user;

// Calc max distance
let diag;


function setup() {
  capture = createCapture({
    audio: false,
    video: {
      width: w,
      height: h
    }
  }, function() {
    console.log('capture ready.')
  });

  angleMode(DEGREES);

  // capture = createVideo('drone0.mp4');
  // capture.loop();

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
  user = createVector(width / 2, height / 2);
  diag = sqrt(sq(width) + sq(height));
}

function mouseReleased() {
  let removing = false;
  // Loop through all the locations
  for (let l = locs.length - 1; l >= 0; l -= 2) {
    let loc = locs[l];

    // Remove them
    if (loc.hover()) {
      loc.stop();
      locs.splice(l, 1);
      removing = true;
    }
  }

  // Only add if not deleting
  if (!removing) addPoint(mouseX, mouseY);
}

// Add point to track
// Return its index
function addPoint(x, y) {
  console.log(x, y);
  if (pointCount < maxPoints) {
    var pointIndex = pointCount * 2;
    curxy[pointIndex] = x;
    curxy[pointIndex + 1] = y;
    pointCount++;
    locs[pointIndex] = new Location(x, y);
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
      // Update locs array
      locs[outputIndex].moose(curxy[outputIndex], curxy[outputIndex + 1]);
      outputPoint++;
    }
  }
  pointCount = outputPoint;
}

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

    for (var i = 0; i < pointCount; i++) {
      var pointOffset = i * 2;
      // var speed = Math.abs(prevxy[pointOffset] - curxy[pointOffset]);
      var r = 8;
      ellipse(curxy[pointOffset], curxy[pointOffset + 1], r, r);
    }

    // Go through every other location
    for (let l = 0; l < locs.length; l += 2) {
      let loc = locs[l];
      loc.run();
    }
  }
}
