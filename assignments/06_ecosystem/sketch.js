let zebras = [];
let lion;
const zebraCount = 5;
let raindrops = [];
let clouds = []; // Array to store cloud positions

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize zebras
  for (let i = 0; i < zebraCount; i++) {
    zebras.push(new Zebra(random(width), random(height * 0.6, height)));
  }

  // Initialize the lion
  lion = new Lion(random(width), random(height * 0.6, height));
  
  // Specifying cloud positions more deliberately
  clouds = [
    createVector(width * 0.2, random(50, height * 0.3)),
    createVector(width * 0.5, random(50, height * 0.3)),
    createVector(width * 0.8, random(50, height * 0.3))
  ];

  // Generate raindrops for each cloud, focusing on the center
  clouds.forEach(cloudPosition => {
    for (let j = 0; j < 100; j++) { // 100 raindrops per cloud
      // Focus raindrop generation around the center of the cloud
      // Since clouds are drawn with ellipses, consider the cloud's x as its center
      let raindropX = cloudPosition.x + random(-10, 10); // Narrow the range to make it appear more centered
      let raindropY = cloudPosition.y + 10; // Adjust if your cloud drawing extends below this y position
      raindrops.push(new Raindrop(raindropX, raindropY));
    }
  });
}


function draw() {
  background(255);
  drawSky();
  drawSun();
  drawGround();
  
  // Draw and update each cloud
  clouds.forEach(cloud => {
    drawClouds(cloud.x, cloud.y);
  });

  // Batch setting drawing properties for raindrops
  strokeWeight(2);
  stroke(138, 43, 226);
  raindrops.forEach(raindrop => {
    raindrop.fall();
    raindrop.show();
  });

  lion.updateTarget(zebras);
  lion.move();
  lion.display();

  zebras.forEach(zebra => {
    zebra.avoid(lion.position);
    zebra.separate(zebras);
    zebra.cohesion(zebras);
    zebra.move();
    zebra.display();
  });
}

class Lion {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, -2);
    this.acceleration = createVector();
    this.maxSpeed = 2;
    this.maxForce = 0.05;
    this.target = null;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  updateTarget(zebras) {
    let closestDistance = Infinity;
    zebras.forEach(zebra => {
      let d = p5.Vector.dist(this.position, zebra.position);
      if (d < closestDistance) {
        closestDistance = d;
        this.target = zebra;
      }
    });
    if (this.target) {
      this.seek(this.target.position);
    }
  }

  move() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() + PI / 2);
    fill(252, 209, 22);
    ellipse(0, 0, 30, 50);
    fill(252, 209, 22);
    ellipse(0, -35, 20, 20);
    stroke(252, 144, 3);
    strokeWeight(2);
    for (let i = 0; i < TWO_PI; i += PI / 12) {
      let x = cos(i) * 25;
      let y = sin(i) * 25 - 35;
      line(0, -35, x, y);
    }
    fill(0);
    ellipse(-5, -37, 3, 3);
    ellipse(5, -37, 3, 3);
    strokeWeight(2);
    line(0, 5, 5, 40);
    pop();
  }
}

class Zebra {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 3));
    this.acceleration = createVector();
    this.maxForce = 0.1;
    this.maxSpeed = 3;
    this.size = random(30, 50);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  avoid(predator) {
    let avoidDistance = this.size * 5;
    let steer = createVector();
    let diff = p5.Vector.sub(this.position, predator);
    if (diff.magSq() < avoidDistance * avoidDistance) {
      diff.normalize();
      diff.mult(this.maxSpeed);
      steer = p5.Vector.sub(diff, this.velocity);
      steer.limit(this.maxForce);
      this.applyForce(steer);
    }
  }

  separate(zebras) {
    let desiredSeparation = this.size;
    let steer = createVector();
    let count = 0;
    zebras.forEach(other => {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d); // Weight by distance
        steer.add(diff);
        count++;
      }
    });
    if (count > 0) {
      steer.div(count);
      steer.setMag(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce * 2); // Apply a stronger force to ensure separation
      this.applyForce(steer);
    }
  }

  cohesion(zebras) {
    let sum = createVector();
    let count = 0;
    zebras.forEach(zebra => {
      let d = p5.Vector.dist(this.position, zebra.position);
      if (d > 0 && d < 100) { // Only consider zebras within a certain radius
        sum.add(zebra.position);
        count++;
      }
    });
    if (count > 0) {
      sum.div(count);
      this.seek(sum); // Seek towards the average position with normal strength
    }
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  move() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.position.x = (this.position.x + width) % width;
    this.position.y = constrain(this.position.y, height * 0.6, height);
  }

  display() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() + PI / 2);
    fill(255);
    ellipse(0, 0, this.size * 0.6, this.size);
    push();
    translate(0, -this.size / 2);
    ellipse(0, 0, this.size / 4, this.size / 3);
    pop();
    stroke(0);
    line(-this.size / 4, this.size / 2, -this.size / 4, this.size / 2 + this.size / 4);
    line(this.size / 4, this.size / 2, this.size / 4, this.size / 2 + this.size / 4);
    line(-this.size / 4, -this.size / 2, -this.size / 4, -this.size / 2 - this.size / 4);
    line(this.size / 4, -this.size / 2, this.size / 4, -this.size / 2 - this.size / 4);
    stroke(0);
    line(0, this.size / 2, 0, this.size / 2 + this.size / 5);
    fill(0);
    for (let i = -this.size / 2; i < this.size / 2; i += this.size / 10) {
      ellipse(i, 0, this.size / 20, this.size / 2);
    }
    pop();
  }
}

function drawSky() {
  let skyTop = color(135, 206, 235);
  let skyBottom = color(250, 215, 160);
  for (let y = 0; y < height; y++) {
    let n = map(y, 0, height, 0, 1);
    let newColor = lerpColor(skyTop, skyBottom, n);
    stroke(newColor);
    line(0, y, width, y);
  }
  drawClouds();
}

function drawSun() {
  fill(255, 204, 0);
  noStroke();
  ellipse(width * 0.1, height * 0.2, 100, 100);
}

function drawClouds(x, y) {
  fill(240); // Light gray for clouds
  noStroke();
  // Drawing a cloud at position (x, y)
  ellipse(x, y, 120, 60);
  ellipse(x + 60, y, 140, 70);
  ellipse(x - 40, y - 20, 160, 60);
}


function drawGround() {
  let groundY = height * 0.5; // Starting point of the ground

  // Draw the ground
  fill(233, 229, 220);
  noStroke();
  rect(0, groundY, width, height * 0.5);

  // Add grass
  stroke(34, 139, 34); // Set grass color
  strokeWeight(2); // Set grass blade thickness

  // Determine grass density
  let grassDensity = 5; // Lower number means more dense
  for (let x = 0; x < width; x += grassDensity) {
    // Each blade of grass is a line with slight random variations
    let grassHeight = random(10, 20); // Randomize grass height
    line(x, groundY, x + random(-5, 5), groundY - grassHeight);
  }
}


class Raindrop {
  constructor(cloudX, cloudY) {
    this.cloudX = cloudX;
    this.cloudY = cloudY; // Save cloud's X position
    this.x = cloudX + random(-10, 20); // Initial X based on cloud position
    this.y = cloudY + 10; // Initial Y slightly below the cloud
    this.z = random(0, 20);
    this.len = map(this.z, 0, 20, 10, 20);
    this.yspeed = map(this.z, 0, 20, 1, 20);
  }

  fall() {
    this.y += this.yspeed;
    const grav = map(this.z, 0, 20, 0, 0.2);
    this.yspeed += grav;
  
    if (this.y > height) {
      // Log for debugging - check if reset positions are as expected
      console.log(`Resetting raindrop. CloudX: ${this.cloudX}, CloudY: ${this.cloudY}`);
  
      this.x = this.cloudX + random(-10, 10);
      this.y = this.cloudY + 10; // Ensure this value is correctly placing raindrops
      this.yspeed = map(this.z, 0, 20, 4, 10);
  }
  

    // When the raindrop goes below the canvas, reset it back to its originating cloud's position
    if (this.y > height) {
      this.x = this.cloudX + random(-10, 10); // Reset X near the cloud's center
      this.y = this.cloudY + 10; // Reset Y slightly below the cloud
      this.yspeed = map(this.z, 0, 20, 4, 10);
    }
  }

  show() {
    stroke(173, 216, 230); // Light blue color for the raindrops
    let thick = map(this.z, 0, 20, 1, 3);
    strokeWeight(thick);
    line(this.x, this.y, this.x, this.y + this.len);
  }
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}