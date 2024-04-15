let drumSound; // For the sample-based bass sound
let synth; // For the synth-based sound
let jumper; // Object representing the player
let gravity = 0.6; // Gravity effect
let jumpForce = -15; // Force of the jump
let scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']; // Musical scale
let noteIndex = 0; // Index to track which note to play

function preload() {
  drumSound = loadSound('Sounds/Minecraft.mp3', soundLoaded, loadError);
}

function soundLoaded() {
  console.log('Sound loaded successfully');
}

function loadError(err) {
  console.error('Error loading sound:', err);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
    synth = new p5.PolySynth(); // Initialize the synth
    jumper = new Jumper();
}

function draw() {
  background(220);
  
  jumper.update();
  jumper.display();

  // Draw the ground
  stroke(0);
  line(0, 150, width, 150);
}

function keyPressed() {
  if (key == ' ' && jumper.onGround) { 
      jumper.velocity = jumpForce;
      playNote();
  }
}

function playNote() {
  let note = scale[noteIndex]; // Get the current note from the scale
  synth.play(note, 0.5, 0, 0.5); // Play the note with synth
  noteIndex = (noteIndex + 1) % scale.length; // Move to the next note in the scale, wrap around if needed
}

class Jumper {
  constructor() {
      this.x = 50;
      this.y = 150;
      this.velocity = 0;
      this.onGround = true;
  }

  update() {
      this.y += this.velocity;
      this.velocity += gravity;

      // Check for ground
      if (this.y > 150) {
          this.y = 150;
          this.velocity = 0;
          this.onGround = true;
          if (!drumSound.isPlaying()) {
              drumSound.play();
          }
      } else {
          this.onGround = false;
      }
  }

  display() {
      fill(0);
      ellipse(this.x, this.y - 10, 20, 20); // Drawing the jumper as a simple circle
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
