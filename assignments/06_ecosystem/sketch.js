let zebras = [];
let lion;
const zebraCount = 5;
let raindrops = [];
let clouds = []; 
let river;
let elephant;

class Elephant {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector();
    this.acceleration = createVector();
    this.maxSpeed = 2;
    this.maxForce = 0.1;
    this.size = 100; // Adjust the size of the elephant
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

  update() {
    if (river.isInRiver(this.position)) {
      this.maxSpeed = 1; // Slower max speed in the river
    } else {
      this.maxSpeed = 2; // Normal max speed outside the river
    }
    
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() + radians(90));
    noStroke(); // Remove the stroke for a more natural look
    
    // Body color and shape
    fill(100); // A darker gray color for the elephant
    ellipse(0, 0, this.size * 0.7, this.size); // Body
    
    // Head shape
    ellipse(0, -this.size / 3, this.size * 0.6, this.size * 0.5); // Head
  
    // Trunk with a realistic curve
    beginShape();
    vertex(-this.size / 2.5, -this.size / 1.5);
    bezierVertex(-this.size / 5, -this.size / 1.2, 
                 -this.size / 6, -this.size / 2.5, 
                 -this.size / 10, -this.size / 1.2);
    endShape();
    
    // Tail with a realistic droop
    stroke(100); // Same color as the body
    strokeWeight(3);
    line(this.size * 0.35, this.size * 0.1, this.size * 0.4, this.size / 2);
    noStroke(); // Stop drawing the stroke
    
    // Ears
    fill(120); // Slightly lighter gray for the ears
    ellipse(-this.size / 3, -this.size / 2.2, this.size * 0.4, this.size * 0.6); // Left ear
    ellipse(this.size / 3, -this.size / 2.2, this.size * 0.4, this.size * 0.6); // Right ear
  
    // Eyes
    fill(0); // Black for the eyes
    ellipse(-this.size / 4, -this.size / 3, this.size * 0.05, this.size * 0.1); // Left eye
    ellipse(this.size / 4, -this.size / 3, this.size * 0.05, this.size * 0.1); // Right eye
  
    pop();
  }
  

  eat(tree) {
    let d = p5.Vector.dist(this.position, tree.position);
    if (d < 5) {
      return true;
    } else {
      return false;
    }
  }
}


let tree = {
  position: null,

  display: function() {
    // Trunk
    fill('#8B4513'); // brown color for the trunk
    rect(this.position.x, this.position.y, 20, 100);

    // Leaves with a more natural shape
    fill('#228B22'); // dark green color for the leaves
    ellipse(this.position.x + 10, this.position.y - 30, 150, 150); // large ellipse for bulk of leaves
    ellipse(this.position.x + 70, this.position.y - 50, 100, 100);

    // Branches
    stroke('#8B4513'); // brown color for the branches
    strokeWeight(5); // thicker stroke for branches
    
    noStroke(); // reset stroke
  },

  regenerate: function() {
    this.position = createVector(random(width), random(height * 0.6, height * 0.8));
  }
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  river = new River();
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

  // Initialize the elephant
  elephant = new Elephant(random(width), random(height * 0.6, height));

  // Initialize the first tree
  tree.regenerate();
}

function draw() {
  background(255);
  drawSky();
  drawSun();
  drawGround();
  river.display();
  
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

  // Move and display the elephant
  elephant.seek(tree.position);
  elephant.update();
  elephant.display();

  // Display the tree
  tree.display();

  // Check if the elephant has reached the tree
  if (elephant.eat(tree)) {
    tree.regenerate(); // Regenerate the tree at a new location
  }
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
    // Check if the zebra is in the river and slow down if it is
    if (river.isInRiver(this.position)) {
      this.maxSpeed = 1.5; // Slower max speed in the river
    } else {
      this.maxSpeed = 3; // Normal max speed outside the river
    }
    
    // Apply the forces to the velocity and position
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    
    // Reset acceleration for the next frame
    this.acceleration.mult(0);
    
    // Wrap around the edges of the canvas
    this.position.x = (this.position.x + width) % width;
    this.position.y = constrain(this.position.y, height * 0.6, height);
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
    // Check if the zebra is in the river and slow down if it is
    if (river.isInRiver(this.position)) {
      this.maxSpeed = 1.5; // Slower max speed in the river
    } else {
      this.maxSpeed = 3; // Normal max speed outside the river
    }
    
    // Apply the forces to the velocity and position
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    
    // Reset acceleration for the next frame
    this.acceleration.mult(0);
    
    // Wrap around the edges of the canvas
    this.position.x = (this.position.x + width) % width;
    this.position.y = constrain(this.position.y, height * 0.6, height);
  }

  display() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() + PI / 2);
    
    // Draw the body of the zebra as an ellipse with a white fill
    fill(255);
    noStroke();
    ellipse(0, 0, this.size * 1.2, this.size);
  
    // Draw the head of the zebra with a smaller ellipse at the top of the body
    ellipse(0, -this.size * 0.6, this.size * 0.5, this.size * 0.4);
  
    // Draw the legs as thin rectangles
    fill(0);
    rect(-this.size * 0.5, this.size * 0.2, this.size * 0.1, this.size * 0.4);
    rect(this.size * 0.4, this.size * 0.2, this.size * 0.1, this.size * 0.4);
    rect(-this.size * 0.5, -this.size * 0.6, this.size * 0.1, this.size * 0.4);
    rect(this.size * 0.4, -this.size * 0.6, this.size * 0.1, this.size * 0.4);
  
    // Draw the ears with small triangles
    triangle(-this.size * 0.2, -this.size * 0.9, -this.size * 0.3, -this.size * 0.7, -this.size * 0.1, -this.size * 0.7);
    triangle(this.size * 0.2, -this.size * 0.9, this.size * 0.3, -this.size * 0.7, this.size * 0.1, -this.size * 0.7);
  
    // Add stripes to the body of the zebra
    stroke(0);
    strokeWeight(2);
    for (let i = -this.size * 0.5; i < this.size * 0.5; i += this.size / 10) {
      let h = this.size / random(2, 5); // Varying height for a more natural look
      line(i, -this.size * 0.1, i, -this.size * 0.1 + h);
    }
  
    // Add the eye
    fill(0);
  ellipse(-this.size * 0.1, -this.size * 0.6, this.size / 15, this.size / 15); // Left eye
  ellipse(this.size * 0.1, -this.size * 0.6, this.size / 15, this.size / 15); // Right eye

    pop();
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
    this.hitRiver = false;
  }

  fall() {
    if (!this.hitRiver) {
    this.y += this.yspeed;
    const grav = map(this.z, 0, 20, 0, 0.2);
    this.yspeed += grav;
  
    if (this.y > height) {
      this.x = this.cloudX + random(-10, 20);
      this.y = this.cloudY + 10; // Ensure this value is correctly placing raindrops
      this.yspeed = map(this.z, 0, 20, 4, 10);
  }
  

    // When the raindrop goes below the canvas, reset it back to its originating cloud's position
    if (this.y > height) {
      this.x = this.cloudX + random(-10, 10); // Reset X near the cloud's center
      this.y = this.cloudY + 10; // Reset Y slightly below the cloud
      this.yspeed = map(this.z, 0, 20, 4, 10);
    }
    if (river.isInRiver(createVector(this.x, this.y))) {
      this.hitRiver = true;
      river.createRipple(this.x, this.y); // Create a ripple in the river
    }
  }
}

  show() {
    if (!this.hitRiver) {
    stroke(173, 216, 230); // Light blue color for the raindrops
    let thick = map(this.z, 0, 20, 1, 3);
    strokeWeight(thick);
    line(this.x, this.y, this.x, this.y + this.len);
  }
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

class River {
  constructor() {
    // Define the river's dimensions and position
    this.x = 0;
    this.y = height * 0.7;
    this.width = width;
    this.height = height * 0.1;
    this.ripples = [];
  }

  display() {
    noStroke();
    fill(64, 164, 223, 150); // Water color with some transparency
    beginShape();
    for (let x = this.x; x < this.x + this.width; x++) {
      // Use a sine wave for simplicity or noise for more natural look
      let y = this.y + sin(frameCount * 0.02 + x * 0.02) * 10; 
      vertex(x, y);
    }
    vertex(this.x + this.width, this.y + this.height);
    vertex(this.x, this.y + this.height);
    endShape(CLOSE);
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      let ripple = this.ripples[i];
      fill(255, ripple.alpha);
      noStroke();
      ellipse(ripple.x, ripple.y, ripple.size, ripple.size);
      
      // Update the ripple's size and alpha
      ripple.size += .5; // Determines how fast the ripple expands
      ripple.alpha -= 2; // Determines how fast the ripple fades out

      // Remove the ripple from the array if it's no longer visible
      if (ripple.alpha <= 0) {
        this.ripples.splice(i, 1);
      }
    }
  }

  createRipple(x, y) {
    // Add a new ripple to the array with a starting size and alpha
    this.ripples.push({
      x: x,
      y: y,
      size: 0,
      alpha: 255 // Fully opaque to start with
    });
  }
  // Add the isInRiver method
  isInRiver(entityPosition) {
    return (
      entityPosition.x >= this.x &&
      entityPosition.x <= (this.x + this.width) &&
      entityPosition.y >= this.y &&
      entityPosition.y <= (this.y + this.height)
    );
  
  }
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}