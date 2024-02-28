let numCellsWidth = 40;
let numCellsHeight = 40;
let cellWidth;
let cellHeight;
let noiseScale = 0.05;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  // Removed noLoop() to allow continuous redrawing

  cellWidth = width / numCellsWidth;
  cellHeight = height / numCellsHeight;
}

function draw() {
  background(0, 0, 100);
  drawGrid();
}

function drawGrid() {
  noiseDetail(2, 0.5); // Fine-tune the noise for more intricate patterns
  let pulseSpeed = 0.025; // Slower pulse speed
  let pulse = sin(frameCount * pulseSpeed) * 0.5 + 0.5; // Pulse between 0 and 1 for brightness

  for (let xIndex = 0; xIndex < numCellsWidth; xIndex++) {
    for (let yIndex = 0; yIndex < numCellsHeight; yIndex++) {
      let x = cellWidth * xIndex;
      let y = cellHeight * yIndex;
      let noiseVal = noise(x * noiseScale, y * noiseScale);
      let sizePulse = sin(frameCount * pulseSpeed + noiseVal * PI) * 0.5 + 0.5; // Pulse for size modulation

      push();
      translate(x, y);

      // Modulate the hue and brightness with noise and pulse
      let hue = map(noiseVal, 0, 1, 0, 360);
      let brightness = map(pulse, 0, 1, 50, 100);
      fill(hue, 70, brightness);
      noStroke();

      // Dynamic rounding and size for rectangles based on noise and sine function
      let rounding = map(sin(noiseVal * PI), -1, 1, 0, cellWidth / 2);
      let rectSize = cellWidth * sizePulse;
      rect(0, 0, rectSize, rectSize, rounding);

      // Varying opacity and size for ellipses based on noise and sine function
      let innerHue = (hue + 90) % 360;
      let opacity = map(cos(frameCount * pulseSpeed), -1, 1, 128, 255);
      fill(innerHue, 70, brightness, opacity / 255);
      let ellipseSize = map(cos(noiseVal * PI), -1, 1, cellWidth * 0.5, cellWidth * 0.8) * sizePulse;
      ellipse(cellWidth / 2, cellHeight / 2, ellipseSize, ellipseSize);

      // Smaller ellipse with different hue and noise-based sizing
      let smallerHue = (hue + 180) % 360;
      fill(smallerHue, 50, brightness);
      let smallerEllipseSize = map(noiseVal, 0, 1, cellWidth * 0.25, cellWidth * 0.5) * sizePulse;
      ellipse(cellWidth / 2, cellHeight / 2, smallerEllipseSize, smallerEllipseSize);
      
      pop();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cellWidth = width / numCellsWidth;
  cellHeight = height / numCellsHeight;
}

