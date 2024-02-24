let particles = [];
let gravity;

function setup() {
  createCanvas(windowWidth, windowHeight);
  gravity = createVector(0, -0.05); // Light upward force for smoke
}

function draw() {
  background('#ADD8E6');

  // Draw the road
  drawRoad();

  // Position for the main car
  let carX = width / 2 - 50; 
  let carY = height - 100;

  // Draw the main car and emit exhaust from its pipe
  let exhaustPipePosition = drawCar(carX, carY, 'darkblue', 'black');
  emitExhaust(exhaustPipePosition.x, exhaustPipePosition.y);

  // Add and manage other cars on the road
  let otherCar1Exhaust = drawCar(width / 2 - 250, height - 100, 'red', 'black');
  emitExhaust(otherCar1Exhaust.x, otherCar1Exhaust.y);

  let otherCar2Exhaust = drawCar(width / 2 + 150, height - 100, 'yellow', 'black');
  emitExhaust(otherCar2Exhaust.x, otherCar2Exhaust.y);

  // Update and show particles for smoke
  updateAndShowParticles();
}

function emitExhaust(x, y) {
  for (let i = 0; i < 10; i++) { // Increased emission rate for more pronounced smoke
    particles.push(new Particle(x, y));
  }
}

function drawRoad() {
  fill(50);
  rect(0, height - 60, width, 60); // Simple road
}

function drawCar(x, y, bodyColor, windowColor) {
  fill(bodyColor);
  rect(x, y, 100, 50); // Car body
  fill(0);
  ellipse(x + 20, y + 50, 20, 20); // Front wheel
  ellipse(x + 80, y + 50, 20, 20); // Rear wheel
  fill(windowColor);
  rect(x + 10, y + 10, 30, 20); // Front window
  rect(x + 60, y + 10, 30, 20); // Rear window

  // Draw exhaust pipe
  fill(120); // Grey color for the exhaust pipe
  let exhaustPipe = { x: x + 95, y: y + 45, width: 10, height: 5 }; // Position and size of the exhaust pipe
  rect(exhaustPipe.x, exhaustPipe.y, exhaustPipe.width, exhaustPipe.height);

  // Return the position from which the exhaust should be emitted
  return createVector(exhaustPipe.x + 5, exhaustPipe.y + 2.5); // Adjusted for the center of the pipe
}

function updateAndShowParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].destroy) {
      particles.splice(i, 1);
    }
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    // Adjust initial velocity to have a rightward component
    this.vel = createVector(random(0, 1), random(-2, 0)); // Now also moves right
    this.acc = createVector(0, 0);
    this.radius = random(5, 10);
    this.lifetime = random(60, 120);
  }

  update() {
    this.lifetime--;
    if (this.lifetime < 0) {
      this.destroy = true;
    }

    // Apply a constant rightward force (like wind)
    let wind = createVector(0.01, 0); // Small, constant force to the right
    this.applyForce(wind);

    // Apply a random force to simulate varying air currents
    let airCurrents = createVector(random(-0.05, 0.05), random(-0.02, 0.02));
    this.applyForce(airCurrents);

    this.vel.add(this.acc);
    this.vel.limit(1.5); // Keep movement gentle
    this.pos.add(this.vel);
    this.acc.mult(0); // Reset acceleration after applying it to velocity
    this.applyForce(gravity);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  show() {
    push();
    noStroke();
    fill(180, this.lifetime / 4); // More transparent smoke
    translate(this.pos.x, this.pos.y);
    ellipse(0, 0, this.radius * 2);
    pop();
  }
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeArrays(); // Reinitialize arrays to match new canvas size
}

