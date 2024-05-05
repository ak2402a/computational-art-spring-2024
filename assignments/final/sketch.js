//Declare Variables
let drumSound; //Theme song
let audioContextStarted = false; //Click mouse to start song
let glenImg;
let zombieImages = [];
let glen;
let zombies = [];
let river; 
let grass = []; 
let lastSpawnTime = 0;
let houseImg;
let house;
let carImg;
let car;
let video;
let isVideoPlaying = false; //Click mouse to start video
let startTime;
let glenHealth = 100; //Inital glen health
let lastCheckTime = 0; 
let isGameOver = false; //Stops the game boolean
let lastStormTime = 0;
let stormInterval = 5000; //How often storm comes 
let lightningEffectRadius = 100; // Radius in which the lightning has an effect
let isWarningActive = false; //Makes clouds before lightning strike
let warningX, warningY;
let warningStartTime;
let warningDuration = 3000; //How early clouds appear before lightning

//Load all the images video and audio
function preload() {
  drumSound = loadSound('./Sounds/ThemeSong.mp3', soundLoaded, loadError);
  video = createVideo(['./Images/Glen.mp4']);
  glenImg = loadImage("./Images/Glen.png", () => {
    glen = new Glen(glenImg, width / 2, height / 2, 3);
  });
  houseImg = loadImage("./Images/House.jpeg");
  carImg = loadImage("./Images/Car.png");
  zombieImages.push(loadImage("./Images/zombie-2.png"));
  zombieImages.push(loadImage("./Images/zombie-3.png"));
  zombieImages.push(loadImage("./Images/zombie.png"));
}

//Debugging functions
function soundLoaded() {
  console.log('Sound loaded successfully');
}

function loadError(err) {
  console.error('Error loading sound:', err);
}

//Mouse click then audio and video
function mousePressed() {
  if (!audioContextStarted) {
    userStartAudio().then(() => {
      console.log('AudioContext started successfully');
      drumSound.loop();
      audioContextStarted = true;
    });
  }

  if (isVideoPlaying) {
    video.stop();
    isVideoPlaying = false;
  } else {
    video.play();
    isVideoPlaying = true;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  startTime = millis();
  lastStormTime = millis();
  video.size(320, 240); // Set video size
  video.position(0, 0); // Position video at top-left corner
  video.loop();

  // Initialize the river first
  river = new River();

  // Initialize the house with specified dimensions and position
  let houseWidth = 200;
  let houseHeight = 200;
  let houseX = windowWidth - houseWidth - 20; 
  let houseY = 20; 
  house = new House(houseImg, houseX, houseY, houseWidth, houseHeight);
  car = new Car(carImg, 600, 600);

  // Set up the grass, ensuring it does not overlap with the river or house
  grass = [];
  setupGrass(500); // How many blades of grass

  // Initialize zombies
  zombies = []; 
  initialZombieSetup(); 
  populateZombies(); 
}

// Function to populate zombies considering their initial distance from each other
function populateZombies() {
  while (zombies.length < 20) {
      let img = zombieImages[zombies.length % 3];
      let candidate = new Character(img, random(width), random(height), 1);

      let tooClose = zombies.some(z => dist(z.x, z.y, candidate.x, candidate.y) < z.radius + candidate.radius);
      if (!tooClose) {
          zombies.push(candidate);
      }
  }
}

// Setup and populate field with grass
function setupGrass(count) {
  let attempts = 0;
  let maxAttempts = count * 5; // More attempts than the number of grass patches to ensure proper placement
  while (grass.length < count && attempts < maxAttempts) {
      let x = random(width);
      let y = random(height);
      let grassHeight = random(10, 30);
      let swayAmount = random(1, 5);

      if (!isInExclusionZone(x, y - grassHeight)) {
          grass.push(new Grass(x, y - grassHeight, grassHeight, swayAmount));
      }
      attempts++;
  }
}

//Make sure grass is not in river or house
function isInExclusionZone(x, y) {

  if (y >= river.y && y <= river.y + river.height) {
      return true;
  }
 
  if (x >= house.x && x <= house.x + house.width && y >= house.y && y <= house.y + house.height) {
      return true;
  }
  return false;
}

class Grass {
  constructor(x, y, height, swayAmount) {
    this.x = x;
    this.baseY = y;
    this.height = height;
    this.swayAmount = swayAmount;
    this.phase = random(TWO_PI); 
  }

  display() {
    let sway = sin(this.phase + frameCount * 0.02) * this.swayAmount;
    stroke(34, 139, 34); 
    strokeWeight(2);
    line(this.x, this.baseY, this.x + sway, this.baseY - this.height);
  }

  update() {
  }
}

//Attacking and interations when space bar is clicked it kills zombies or activates the car used AI for the car activation
function keyPressed() {
  if (keyCode === 32) { // Space bar
    let distToCar = dist(glen.x, glen.y, car.x, car.y);
    if (distToCar < 50 && !car.active) { // Activate the car only if close and not already active
      car.activate();
    } else if (!car.active) { // Deactivate zombies only if the car isn't active
      zombies.forEach((zombie, index) => {
        if (dist(glen.x, glen.y, zombie.x, zombie.y) < 50) {
          zombie.markForDeletion = true; // Set the zombie to be removed
        }
      });
    }
  }
}

//Main controllable character
class Glen {
  constructor(img, x, y, speed) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.radius = 50;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.angle = 0;
    this.markForDeletion = false;
    this.targetLastX = x;
    this.targetLastY = y;
  }
  //Use arrow keys
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
    this.vx += this.ax;
    this.vy += this.ay;

    this.x += this.vx;
    this.y += this.vy;

    this.checkCanvasEdges();
  }

  display() {
    if (!this.markForDeletion) {
      push();
      translate(this.x, this.y);
      rotate(this.angle);
      imageMode(CENTER);
      image(this.img, 0, 0, this.radius * 2, this.radius * 2);
      pop();
      noFill();
    }
  }

  checkCanvasEdges() {
    if (this.x < this.radius) {
      this.x = this.radius;
    } else if (this.x > width - this.radius) {
      this.x = width - this.radius;
    }

    if (this.y < this.radius) {
      this.y = this.radius;
    } else if (this.y > height - this.radius) {
      this.y = height - this.radius;
    }
  }
}

//Zombie code
class Character {
  constructor(img, x, y, speed, following = true) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.speed = speed * 0.1;
    this.following = following;
    this.radius = 50;
    this.vx = random(-1, 1) * speed;
    this.vy = random(-1, 1) * speed;
    this.ax = 0;
    this.ay = 0;
    this.angle = 0;
    this.markForDeletion = false;
    this.stunned = false;
  }

  follow(targetX, targetY) {
    let angle = atan2(targetY - this.y, targetX - this.x);
    this.ax = cos(angle) * 0.05;
    this.ay = sin(angle) * 0.05;
  }

  wander() {
    this.ax = random(-0.05, 0.05);
    this.ay = random(-0.05, 0.05);
  }

  update() {
    if (this.stunned) {
      // If the character is stunned, don't update its position
      return;
    }

    let targetX = car.active ? car.x : glen.x;
    let targetY = car.active ? car.y : glen.y;
  
    if (!house.containsPoint(glen.x, glen.y)) {
      this.follow(targetX, targetY);
    } else {
      this.wander();
    }
  
    this.vx += this.ax;
    this.vy += this.ay;
  
    let slowFactor = 3; 
    let maxSpeed = this.speed * slowFactor * (river.isInRiver({ x: this.x, y: this.y }) ? 0.5 : 1);
    this.vx = constrain(this.vx, -maxSpeed, maxSpeed);
    this.vy = constrain(this.vy, -maxSpeed, maxSpeed);
  
    let proposedX = this.x + this.vx;
    let proposedY = this.y + this.vy;
  
    if (!house.containsPoint(proposedX, proposedY)) {
      this.x = proposedX;
      this.y = proposedY;
    } else {
      this.vx *= -0.5;
      this.vy *= -0.5;
    }
  
    this.checkCanvasEdges();
    //AI code to make sure the zombies slow down in river and make ripples
    if (river.isInRiver({ x: this.x, y: this.y })) {
      this.vx *= 0.5;
      this.vy *= 0.5;
      river.createRipple(this.x, this.y);
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

  display() {
    if (!this.markForDeletion) {
      push();
      translate(this.x, this.y);
      rotate(this.angle);
      imageMode(CENTER);
      image(this.img, 0, 0, this.radius * 2, this.radius * 2);
      pop();
    }
  }
}

//River code used noise code from another assignment
class River {
  constructor() {
    this.x = 0;
    this.y = height * 0.5;
    this.width = width;
    this.height = height * 0.1;
    this.ripples = [];
  }

  display() {
    noStroke();
    fill(64, 164, 223, 150); 
    beginShape();
    for (let x = this.x; x <= this.x + this.width; x++) {
      let y = this.y + sin(frameCount * 0.02 + x * 0.01) * 5;
      vertex(x, y);
    }
    vertex(this.x + this.width, this.y + this.height);
    vertex(this.x, this.y + this.height);
    endShape(CLOSE);

    this.ripples.forEach((ripple, index) => {
      fill(255, ripple.alpha);
      noStroke();
      ellipse(ripple.x, ripple.y, ripple.size, ripple.size);
      ripple.size += 0.2;
      ripple.alpha -= 5;
      if (ripple.alpha <= 0) {
        this.ripples.splice(index, 1);
      }
    });
  }

  createRipple(x, y) {
    this.ripples.push({ x, y, size: 20, alpha: 150 }); // Adjust size and alpha as needed
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

//Safehouse main character can't get chased while in house
class House {
  constructor(img, x, y, width, height) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  display() {
    // Ensure the image mode is correct and reset any transformations
    push();
    imageMode(CORNER); // Make sure the image anchors correctly
    image(this.img, this.x, this.y, this.width, this.height);
    pop();
  }

  containsPoint(px, py) {
    return px >= this.x && px <= this.x + this.width && py >= this.y && py <= this.y + this.height;
  }
}

//Car is used as a distraction used AI for this
class Car {
  constructor(img, x, y) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.active = false;
    this.startTime = 0; // To track when the car was activated
    this.activeDuration = 10000; // Car is active for 5000 milliseconds (5 seconds)
    this.radius = 300; // Radius of the circle for car's movement
    this.angle = 0; // Starting angle
    this.speed = 0.05; // Speed of rotation (angle increment)
  }

  display() {
    imageMode(CENTER);
    image(this.img, this.x, this.y, 300, 150); //Car image size
  }

  activate() {
    this.active = true;
    this.startTime = millis(); // Record the time when the car was activated
  }

  deactivate() {
    this.active = false;
  }

  move() {
    if (this.active) {
      this.x = width / 2 + this.radius * cos(this.angle);
      this.y = height / 2 + this.radius * sin(this.angle);
      this.angle += this.speed;
      if (this.angle > TWO_PI) {
        this.angle -= TWO_PI;
      }

      // Check if the active duration has elapsed
      if (millis() - this.startTime > this.activeDuration) {
        this.deactivate();
      }
    }
  }
}

//Set up these zombies
function initialZombieSetup() {
  while (zombies.length < 20) {
    spawnZombie(true); // Assume we want all zombies to follow Glen
  }
}

function spawnZombie(following = true) {
  let img = zombieImages[zombies.length % 3];
  let maxAttempts = 100;
  let buffer = 50;

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
      let candidateX = random(buffer, width - buffer);
      let candidateY = random(buffer, height - buffer);
      let candidate = new Character(img, candidateX, candidateY, 1, following);

      let tooClose = zombies.some(z => dist(z.x, z.y, candidate.x, candidate.y) < (z.radius + candidate.radius + buffer));
      if (!tooClose) {
          zombies.push(candidate);
          return;
      }
  }
  console.log("Failed to place a new zombie after " + maxAttempts + " attempts.");
}

function updateZombies() {
  zombies.forEach((zombie, index) => {
    
    zombie.vx += zombie.ax;
    zombie.vy += zombie.ay;
    let slowFactor = 0.75; 
    let maxSpeed = zombie.speed * slowFactor * (river.isInRiver({ x: zombie.x, y: zombie.y }) ? 0.5 : 1);
    zombie.vx = constrain(zombie.vx, -maxSpeed, maxSpeed);
    zombie.vy = constrain(zombie.vy, -maxSpeed, maxSpeed);
    let newX = zombie.x + zombie.vx;
    let newY = zombie.y + zombie.vy;

    zombies.forEach((other, otherIndex) => {
      if (index !== otherIndex && dist(newX, newY, other.x, other.y) < zombie.radius + other.radius) {
        zombie.bounceOff(other);
      }
    });
    
    zombie.x = newX;
    zombie.y = newY;
   
    zombie.checkCanvasEdges();

    if (zombie.following) {
      zombie.follow(glen);
    }
  });
}

function displayHUD() {
  fill(255); 
  noStroke();
  textSize(16); 
  textAlign(CENTER, TOP); 
  // Display game time
  let gameTime = (millis() - startTime) / 1000; 
  text('Time: ' + gameTime.toFixed(2) + 's', windowWidth / 2, 10);
  // Display number of zombies
  text('Zombies: ' + zombies.length, windowWidth / 2, 30);
  // Display Glen's health
  text('Glen\'s Health: ' + glenHealth, windowWidth / 2, 50);
}

function reduceHealth(amount) {
  glenHealth -= amount;
  glenHealth = max(0, glenHealth);  //No negative health
  if (glenHealth === 0 && !isGameOver) {
    console.log("Glen has been overrun by zombies!");  
    isGameOver = true;  // Setup the game over screen
  }
}

function checkZombieProximity() {
  let currentTime = millis();
  if (currentTime - lastCheckTime > 2000) {  
    zombies.forEach(zombie => {
      let distance = dist(glen.x, glen.y, zombie.x, zombie.y);
      if (distance < 50) {  
        reduceHealth(15);  
      }
    });
    lastCheckTime = currentTime;  
  }
}

//Used AI for the lightining and clouds appearing
function triggerLightning() {
  // Set the warning position to be within the visible area
  warningX = random(width * 0.2, width * 0.8); // Ensure it's within the central 60% of the screen horizontally
  warningY = height * 0.2; // Position the warning at 20% of the screen height

  // Prepare the warning with cloud and potential impact indication
  isWarningActive = true; // Set the warning as active
  warningStartTime = millis(); // Store the start time of the warning
  displayWarning(warningX, warningY);
}

function drawClouds(x) {
  const cloudY = 50; // Fixed y-coordinate for the clouds

  // Different shades of dark grey for the clouds
  let colors = [220, 200, 180]; // Lighter to darker shades of grey

  noStroke();
  fill(colors[0]); // Lightest grey
  ellipse(x, cloudY, 120, 60);
  ellipse(x + 20, cloudY - 10, 100, 50);

  fill(colors[1]); // Medium grey
  ellipse(x + 40, cloudY + 10, 140, 70);
  ellipse(x - 20, cloudY - 5, 100, 50);

  fill(colors[2]); // Darkest grey
  ellipse(x - 40, cloudY - 20, 160, 60);
  ellipse(x - 60, cloudY + 10, 130, 70);
}

function displayWarning(x, y) {
  drawClouds(x); // Pass only the x-coordinate
}

function createLightningEffect(x, y) {
  stroke(255, 255, 0);
  strokeWeight(3);
  line(x, y, x, height); // Draw a vertical line representing the lightning
}

function stunCharacters(x, y) {
  // Apply effects to Glen based on their x-position
  if (abs(glen.x - x) < lightningEffectRadius) {
    console.log("Glen is stunned by the lightning!");
    // Implement stun effect on Glen
  }

  // Stun all zombies on the same x-axis as the lightning
  zombies.forEach(zombie => {
    if (abs(zombie.x - x) < lightningEffectRadius) {
      console.log("Zombie stunned by the lightning!");
      zombie.stunned = true;
      setTimeout(() => {
        zombie.stunned = false;
      }, 5000); // Stun duration 5 seconds
    }
  });
}


function draw() {
  if (isGameOver) {
    // Display the Game Over screen
    background(0);
    fill(255, 0, 0);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2); 
  } else {
    background(123, 182, 97); //Green Field

    // Update and display the river
    river.display();

    // Update and display the grass
    grass.forEach(grassBlade => {
      grassBlade.update();
      grassBlade.display();
    });

    // Check if it's time to spawn a new zombie
    if (millis() - lastSpawnTime > 5000) {
      spawnZombie();
      lastSpawnTime = millis();
    }

    if (isWarningActive) {
      displayWarning(warningX, warningY);
      let currentTime = millis();
      if (currentTime - warningStartTime >= warningDuration) {
        createLightningEffect(warningX, warningY); // Pass warningX and warningY
        stunCharacters(warningX, warningY); // Pass warningX and warningY
        isWarningActive = false; // Reset the warning state
      }
    } else if (millis() - lastStormTime > stormInterval) {
      triggerLightning();
      lastStormTime = millis(); // Reset the timer for the next storm
    }

    // Display and update the house
    house.display();

    // Update and display Glen
    glen.update();
    glen.display();

    // Move and display the car if active
    if (car.active) {
      car.move();
    }
    car.display();

    //Check if Glen is getting attacked and update the HUD
    checkZombieProximity();
    displayHUD();

    // Update and display zombies
    zombies.forEach(zombie => {
      zombie.update();
      zombie.display();
    });

    // Remove deleted zombies
    zombies = zombies.filter(zombie => !zombie.markForDeletion);
  }
}

//Make the code work on more platforms
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Re-setup the house
  let houseWidth = 200;
  let houseHeight = 200;
  let houseX = windowWidth - houseWidth - 20; 
  let houseY = 20; 
  house = new House(houseImg, houseX, houseY, houseWidth, houseHeight);

  // Reset the size and position of the video
  video.size(320, 240);
  video.position(0, 0);

  // Update the river's width to match the new canvas width
  river.width = windowWidth;
  warningX = windowWidth / 2;  // Center horizontally
  warningY = windowHeight / 4;

  // Clear and re-setup the grass to adjust to the new window size
  grass = [];
  setupGrass(100);

  // Clear and reinitialize the zombies
  zombies = [];
  initialZombieSetup();

  // Reset the position of the car relative to the new canvas center
  car.x = windowWidth / 2;
  car.y = windowHeight / 2;
}