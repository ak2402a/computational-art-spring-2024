let drumSound;
let audioContextStarted = false;
let glenImg, zombieImages = [];
let glen, zombies = [];
let river; // Declare river globally

function preload() {
  drumSound = loadSound('./Sounds/ThemeSong.mp3', soundLoaded, loadError);
  glenImg = loadImage("./Images/Glen.png");
  zombieImages.push(loadImage("./Images/zombie-2.jpeg"));
  zombieImages.push(loadImage("./Images/zombie-3.jpg"));
  zombieImages.push(loadImage("./Images/zombie.jpeg"));
}

function soundLoaded() {
  console.log('Sound loaded successfully');
}

function loadError(err) {
  console.error('Error loading sound:', err);
}

function mousePressed() {
  if (!audioContextStarted) {
    userStartAudio().then(() => {
      console.log('AudioContext started successfully');
      drumSound.loop();
      audioContextStarted = true;
    });
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  river = new River(); 
  glen = new Character(glenImg, width / 2, height / 2, 3, false); // Glen does not follow
  zombies = [];

  while (zombies.length < 20) {
    let img = zombieImages[zombies.length % 3];
    let candidate = new Character(img, random(width), random(height), 1);

    let tooClose = zombies.some(z => dist(z.x, z.y, candidate.x, candidate.y) < z.radius + candidate.radius);
    if (!tooClose) {
      zombies.push(candidate);
    }
  }
}


class Character {
  constructor(img, x, y, speed, following = false) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.following = following; 
    this.radius = 25; // Assuming images are roughly 50x50 pixels
    this.vx = random(-1, 1) * speed;
    this.vy = random(-1, 1) * speed;
    this.ax = 0;
    this.ay = 0;
    this.targetLastX = x;
    this.targetLastY = y;
  }

  handleInput() {
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += this.speed;
    }
    if (keyIsDown(UP_ARROW)) {
      this.y -= this.speed;
    }
    if (keyIsDown(DOWN_ARROW)) {
      this.y += this.speed;
    }
  }

  update() {
    this.handleInput();
    this.applyRiverEffect();
   // Only call follow if this character should follow another (e.g., zombies following Glen)
   if (this.following) {
    this.follow(glen); // Make sure 'glen' is defined in the scope
  }
    this.checkCanvasEdges();

    // Apply the current acceleration to update the velocity
    this.vx += this.ax;
    this.vy += this.ay;

    // Limit the velocity to the maximum speed
    let maxSpeed = this.speed * (river.isInRiver({ x: this.x, y: this.y }) ? 0.5 : 1);
    this.vx = constrain(this.vx, -maxSpeed, maxSpeed);
    this.vy = constrain(this.vy, -maxSpeed, maxSpeed);

    // Update the position
    this.x += this.vx;
    this.y += this.vy;
  }

  applyRiverEffect() {
    // Check if the character is in the river
    if (river.isInRiver({ x: this.x, y: this.y })) {
      // Apply a less severe slowdown when in the river
      const slowdownFactor = 0.8; // Change this value to adjust the slowdown effect (closer to 1 is less slowdown)
      this.vx *= slowdownFactor;
      this.vy *= slowdownFactor;
      river.createRipple(this.x, this.y); // Create ripples
    }
  }

  checkCanvasEdges() {
    if (this.x < this.radius || this.x > width - this.radius) {
      this.vx *= -1;
    }
    if (this.y < this.radius || this.y > height - this.radius) {
      this.vy *= -1;
    }
  }

  follow(target) {
    // Zombies update their target position less frequently
    if (frameCount % 60 == 0) {
      this.targetLastX = target.x;
      this.targetLastY = target.y;
    }

    let angle = atan2(this.targetLastY - this.y, this.targetLastX - this.x);
    this.ax = cos(angle) * 0.05;
    this.ay = sin(angle) * 0.05;

    // Random factor for organic movement
    this.ax += random(-0.02, 0.02);
    this.ay += random(-0.02, 0.02);
  }

  bounceOff(other) {
    let dx = this.x - other.x;
    let dy = this.y - other.y;
    let distance = dist(this.x, this.y, other.x, other.y);

    if (distance < this.radius + other.radius) {
      let angle = atan2(dy, dx);
      let minDistance = this.radius + other.radius;
      let overlap = (minDistance - distance) / 2;

      this.x += cos(angle) * overlap;
      this.y += sin(angle) * overlap;
      other.x -= cos(angle) * overlap;
      other.y -= sin(angle) * overlap;

      [this.vx, other.vx] = [other.vx, this.vx];
      [this.vy, other.vy] = [other.vy, this.vy];
    }
  }

  display() {
    imageMode(CENTER);
    image(this.img, this.x, this.y, 50, 50);
  }
}



class River {
  constructor() {
    this.x = 0;
    this.y = height * 0.5;
    this.width = width;
    this.height = height * 0.1;
    this.ripples = [];
  }

  display() {
    // Drawing the river with its ripples
    noStroke();
    fill(64, 164, 223, 150); // Water color with transparency
    beginShape();
    for (let x = this.x; x < this.x + this.width; x++) {
      let y = this.y + sin(frameCount * 0.02 + x * 0.01) * 5;
      vertex(x, y);
    }
    vertex(this.x + this.width, this.y + this.height);
    vertex(this.x, this.y + this.height);
    endShape(CLOSE);
    
    // Drawing and updating ripples
    this.ripples.forEach((ripple, i) => {
      fill(255, ripple.alpha);
      noStroke();
      ellipse(ripple.x, ripple.y, ripple.size, ripple.size);
      ripple.size += 0.2; // Gradual increase
      ripple.alpha -= 5; // Increase this value for faster fade out
      if (ripple.alpha <= 0) {
        this.ripples.splice(i, 1);
      }
    });
  }

  createRipple(x, y) {
    this.ripples.push({x: x, y: y, size: 2, alpha: 255}); // Start smaller
  }

  isInRiver(entityPosition) {
    return (
      entityPosition.x >= this.x &&
      entityPosition.x <= (this.x + this.width) &&
      entityPosition.y >= this.y &&
      entityPosition.y <= (this.y + this.height)
    );
  }
}

function draw() {
  background(255);
  river.display(); // Display the river
  glen.handleInput();
  glen.update();
  glen.display();

  // Update and display each zombie, check for collisions, and make them follow Glen
  for (let i = 0; i < zombies.length; i++) {
    zombies[i].follow(glen);  // Make each zombie follow Glen
    zombies[i].update();      // Update position based on velocity

    for (let j = i + 1; j < zombies.length; j++) {
      zombies[i].bounceOff(zombies[j]);
    }

    zombies[i].display();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}