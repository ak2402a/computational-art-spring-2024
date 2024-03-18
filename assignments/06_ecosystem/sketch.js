let zebras = [];
let lion;
const zebraCount = 5;

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < zebraCount; i++) {
    zebras.push(new Zebra(random(width), random(height * 0.6, height)));
  }
  lion = new Lion(random(width), random(height * 0.6, height));
}

function draw() {
  background(255);
  drawSky();
  drawSun();
  drawGround();

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
  constructor() {
    this.position = createVector(random(width), random(height * 0.6, height));
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
    
    // Body
    fill(252, 209, 22); // Golden color for the body
    ellipse(0, 0, 30, 50);

    // Head
    fill(252, 209, 22); // Same golden color for the head
    ellipse(0, -35, 20, 20);
    
    // Mane
    stroke(252, 144, 3); // Darker color for the mane
    strokeWeight(2);
    for (let i = 0; i < TWO_PI; i += PI / 12) {
      let x = cos(i) * 25;
      let y = sin(i) * 25 - 35;
      line(0, -35, x, y);
    }
    
    // Eyes
    fill(0);
    ellipse(-5, -37, 3, 3);
    ellipse(5, -37, 3, 3);

    // Tail
    strokeWeight(2);
    line(0, 5, 5, 40);
    
    noStroke();
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
    let d = diff.mag();
    if (d < avoidDistance) {
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
    
    // Main body
    fill(255);
    ellipse(0, 0, this.size * 0.6, this.size);

    // Head
    push();
    translate(0, -this.size / 2);
    ellipse(0, 0, this.size / 4, this.size / 3);
    pop();
    
    // Legs
    stroke(0);
    line(-this.size / 4, this.size / 2, -this.size / 4, this.size / 2 + this.size / 4);
    line(this.size / 4, this.size / 2, this.size / 4, this.size / 2 + this.size / 4);
    line(-this.size / 4, -this.size / 2, -this.size / 4, -this.size / 2 - this.size / 4);
    line(this.size / 4, -this.size / 2, this.size / 4, -this.size / 2 - this.size / 4);

    // Tail
    stroke(0);
    line(0, this.size / 2, 0, this.size / 2 + this.size / 5);
    
    // Stripes
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
}

function drawSun() {
  fill(255, 204, 0);
  noStroke();
  ellipse(width * 0.1, height * 0.2, 100, 100);
}

function drawGround() {
  fill(233, 229, 220);
  noStroke();
  rect(0, height * 0.5, width, height * 0.5);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

