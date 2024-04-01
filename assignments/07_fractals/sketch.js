let angleOffset = 0;
let maxIterations = 10;
let numShapes = 12;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  frameRate(30);
}

function draw() {
  background(0, 0, 0, 20);
  translate(width / 2, height / 2);

  rotate(angleOffset);

  let numShapes = 12;
  let symmetry = 6;

  drawShapes(0, numShapes, 300, symmetry);

  angleOffset += 0.1; //Speed of rotation
}
//Recursive Function draws the various shapes 
function drawShapes(ShapesIteration, numShapes, size, symmetry) {
  if (ShapesIteration >= numShapes) {
    return;
  }

  drawPattern(0, size, symmetry, ShapesIteration);
  //Call its sell and increment
  drawShapes(ShapesIteration + 1, numShapes, size, symmetry);
}
//recursive function to make the shapes smaller and smaller
function drawPattern(patternIteration, size, symmetry, ShapesIteration) {
  if (patternIteration >= maxIterations) {
    return;
  }

  let angle = map(patternIteration, 0, maxIterations, 0, 360 / symmetry) + frameCount;
  let x = size * cos(angle);
  let y = size * sin(angle);

  // Complete random colors
  let vibrantColors = [
    color(255, 105, 180), 
    color(255, 165, 0),   
    color(138, 43, 226),  
    color(0, 255, 127),   
    color(255, 20, 147),  
    color(72, 209, 204),  
    color(153, 50, 204),  
    color(255, 215, 0)    
  ];

  // Color based on the pattern iteration
  let c = vibrantColors[patternIteration % vibrantColors.length];
  stroke(c);
  strokeWeight(2);

  push();
  rotate(angleOffset + ShapesIteration * (360 / numShapes));
  scale(sin(frameCount / 2) * 0.5 + 1);

  // Draw multiple shapes
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

  drawPattern(patternIteration + 1, size * 0.9, symmetry, ShapesIteration);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
