let damping = 0.99;
let cols, rows;
let current;
let previous;
let rocks = []; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); 
  initializeArrays();
}

function draw() {
  background(0);

  // Water ripple simulation
  for (let i = 1; i < cols - 1; i++) {
    for (let j = 1; j < rows - 1; j++) {
      current[i][j] = (
        previous[i - 1][j] +
        previous[i + 1][j] +
        previous[i][j - 1] +
        previous[i][j + 1]) / 2 - current[i][j];
      current[i][j] = current[i][j] * damping;
    }
  }

  loadPixels();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let index = (i + j * cols) * 4;
      pixels[index] = 0; // R
      pixels[index + 1] = 0; // G
      pixels[index + 2] = 255 - abs(current[i][j]); // B
      pixels[index + 3] = 255; // Alpha
    }
  }
  updatePixels();

  // Draw and update rocks
  for (let rock of rocks) {
    rock.update();
    rock.show();
    if (rock.hitWater && !rock.createdRipple) {
      disturb(rock.x, Math.round(rock.y));
      rock.createdRipple = true;
    }
  }

  // Remove rocks that have fallen off the screen
  rocks = rocks.filter(rock => rock.y < height + 50);

  // Swap buffers
  let temp = previous;
  previous = current;
  current = temp;
}

function mousePressed() {
  rocks.push(new Rock(mouseX, mouseY - 20)); // Adjust rock starting position to be slightly above the mouse mimic tossing rock
}

function disturb(x, y) {
  if (x > 0 && x < cols && y > 0 && y < rows) {
    for (let i = -15; i < 15; i++) {
      for (let j = -15; j < 15; j++) {
        if (i * i + j * j < 225 && x + i > 0 && x + i < cols && y + j > 0 && y + j < rows) {
          previous[x + i][y + j] = 500;
        }
      }
    }
  }
}

class Rock {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.gravity = 0.1;
    this.hitWater = false;
    this.createdRipple = false;
  }

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    // Check if the rock hits the water surface
    if (this.y >= height - 10 && !this.hitWater) { // Adjusted to trigger just before hitting the bottom
      this.y = height - 20; // Prevents the rock from going below the canvas
      this.hitWater = true;
      this.velocity = 0; // Stops the rock
    }
  }

  show() {
    fill(139, 69, 19); // Rock color
    noStroke();
    ellipse(this.x, this.y, 20, 20); // Rock
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeArrays(); // Reinitialize arrays to match new canvas size
}

function initializeArrays() {
  cols = width;
  rows = height;
  current = new Array(cols).fill(0).map(() => new Array(rows).fill(0));
  previous = new Array(cols).fill(0).map(() => new Array(rows).fill(0));
}
