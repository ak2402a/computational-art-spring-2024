let angleOffset = 0;
let maxIterations = 10;
let numSegments = 12;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  frameRate(30);
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  rotate(angleOffset);

  let numSegments = 12;
  let symmetry = 6;

  drawRecursiveSegment(0, numSegments, 300, symmetry);

  angleOffset += 0.5;
}

function drawRecursiveSegment(segmentIteration, numSegments, size, symmetry) {
  if (segmentIteration >= numSegments) {
    return;
  }

  drawRecursivePattern(0, size, symmetry, segmentIteration);

  drawRecursiveSegment(segmentIteration + 1, numSegments, size, symmetry);
}

function drawRecursivePattern(patternIteration, size, symmetry, segmentIteration) {
  if (patternIteration >= maxIterations) {
    return;
  }

  let angle = map(patternIteration, 0, maxIterations, 0, 360 / symmetry) + frameCount;
  let x = size * cos(angle);
  let y = size * sin(angle);

  // Create a vibrant color palette
  let vibrantColors = [
    color(255, 105, 180), // Hot Pink
    color(255, 165, 0),   // Orange
    color(138, 43, 226),  // Blue Violet
    color(0, 255, 127),   // Spring Green
    color(255, 20, 147),  // Deep Pink
    color(72, 209, 204),  // Medium Turquoise
    color(153, 50, 204),  // Dark Orchid
    color(255, 215, 0)    // Gold
  ];

  // Select color based on the pattern iteration
  let c = vibrantColors[patternIteration % vibrantColors.length];
  stroke(c);
  strokeWeight(2);

  push();
  rotate(angleOffset + segmentIteration * (360 / numSegments));
  scale(sin(frameCount / 2) * 0.5 + 1);

  // Draw multiple shapes for complexity with vibrant colors
  for (let i = 0; i < 5; i++) {
    rotate(sin(frameCount / 2 + i / 2) * 360);
    let interShapes = map(i, 0, 5, 0, 1);
    stroke(vibrantColors[(patternIteration + i) % vibrantColors.length]);
    if (i % 2 == 0) {
      ellipse(x / i, y / i, size / (i + 1), size / (i + 1));
    } else {
      rect(x / i, y / i, size / (i + 1), size / (i + 1));
    }
  }

  pop();

  drawRecursivePattern(patternIteration + 1, size * 0.9, symmetry, segmentIteration);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
