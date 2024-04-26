let drumSound;
let audioContextStarted = false;
let glenImg, zombieImages = [];
let glen, zombies = [];

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
  glen = new Character(glenImg, width / 2, height / 2, 3);
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
  
  constructor(img, x, y, speed) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.radius = 25; // Assuming images are roughly 50x50 pixels
    this.vx = random(-1, 1) * speed; // Adding velocity in x
    this.vy = random(-1, 1) * speed; // Adding velocity in y
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
    this.x += this.vx;
    this.y += this.vy;

    // Add boundary checks to keep zombies within the canvas
    if (this.x < this.radius || this.x > width - this.radius) {
      this.vx *= -1;
    }
    if (this.y < this.radius || this.y > height - this.radius) {
      this.vy *= -1;
    }
  }

  follow(target) {
    let angle = atan2(target.y - this.y, target.x - this.x);
    this.vx = this.speed * cos(angle);
    this.vy = this.speed * sin(angle);
  }

  bounceOff(other) {
    let dx = this.x - other.x;
    let dy = this.y - other.y;
    let distance = sqrt(dx * dx + dy * dy);

    if (distance < this.radius + other.radius) {
      let angle = atan2(dy, dx);
      let minDistance = this.radius + other.radius;
      let overlap = (minDistance - distance) / 2;

      this.x += cos(angle) * overlap;
      this.y += sin(angle) * overlap;
      other.x -= cos(angle) * overlap;
      other.y -= sin(angle) * overlap;

      // Reverse velocities to simulate bounce
      this.vx *= -1;
      this.vy *= -1;
      other.vx *= -1;
      other.vy *= -1;
    }
  }

  display() {
    image(this.img, this.x, this.y, 50, 50);
  }
}


function draw() {
  background(255);
  glen.handleInput();
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