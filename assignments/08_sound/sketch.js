let drumSound; // Sample-based bass sound
let synth;
let scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']; // Musical scale
let blackKeys = {1: 'C#4', 2: 'D#4', 4: 'F#4', 5: 'G#4', 6: 'A#4'};
let heldNotes = {}; // Track held notes
let audioContextStarted = false; // Track if the audio context has been started

function preload() {
  drumSound = loadSound('./Sounds/Minecraft.mp3', soundLoaded, loadError);
}

function soundLoaded() {
  console.log('Sound loaded successfully');
}

function loadError(err) {
  console.error('Error loading sound:', err);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  synth = new p5.PolySynth();
  textAlign(CENTER, CENTER);
}

function draw() {
  background(255);
  drawPianoKeys();
  drawStaff();
}

function drawPianoKeys() {
  let keyWidth = width / scale.length;
  let keyHeight = height / 4; // Adjusted key height

  // Draw white keys
  for (let i = 0; i < scale.length; i++) {
    let x = i * keyWidth;
    fill(255); // White key
    stroke(0);
    rect(x, height - keyHeight, keyWidth, keyHeight);
    fill(0);
    textAlign(CENTER, CENTER);
    text(scale[i], x + keyWidth / 2, height - keyHeight / 2);
  }

  // Draw black keys
  for (let i in blackKeys) {
    let x = i * keyWidth - keyWidth * 0.25;
    fill(0);
    rect(x, height - keyHeight, keyWidth * 0.5, keyHeight * 0.6);
  }
}

function drawStaff() {
  let staffY = height / 8;
  let staffHeight = height / 40;
  let staffSpacing = staffHeight * 2;

  stroke(0);
  strokeWeight(2);

  // Drawing 5 lines of the staff
  for (let i = 0; i < 5; i++) {
    line(0, staffY + i * staffSpacing, width, staffY + i * staffSpacing);
  }

  // Define note positions on the staff, mapping note names to y-positions
  const notePositions = {
    'C5': staffY - staffSpacing, 
    'B4': staffY,
    'A4': staffY + staffSpacing,
    'G4': staffY + 2 * staffSpacing,
    'F4': staffY + 3 * staffSpacing,
    'E4': staffY + 4 * staffSpacing,
    'D4': staffY + 5 * staffSpacing,
    'C4': staffY + 6 * staffSpacing
  };

  // Draw notes on the staff as quarter notes
  for (let note in heldNotes) {
    let xPos = heldNotes[note] * width / scale.length + width / scale.length / 2;
    let yPos = notePositions[note] || staffY; // Default to staffY if note is not in scale
    let noteHeadDiameter = 10;
    fill(0);
    ellipse(xPos, yPos, noteHeadDiameter, noteHeadDiameter); // Note head
    // Calculate the x position of the right side of the note head for the stem
    let stemBaseX = xPos + noteHeadDiameter / 2;
    line(stemBaseX, yPos, stemBaseX, yPos - 1 * staffSpacing); // Note stem, shortened to 2 staff spacings
    fill(255);
    text(note, xPos, yPos - 20); // Adjust text position to appear above the note
  }
}


function mousePressed() {
  if (!audioContextStarted) {
    userStartAudio().then(() => {
      console.log('AudioContext started successfully');
      drumSound.loop();
      audioContextStarted = true;
    });
  }

  let keyWidth = width / scale.length;
  let keyHeight = height / 4;
  let mouseXIndex = Math.floor(mouseX / keyWidth);
  let mouseYIndex = mouseY > height - keyHeight && mouseY < height;

  if (mouseYIndex && mouseXIndex >= 0 && mouseXIndex < scale.length) {
    let note = scale[mouseXIndex];
    synth.play(note, 0.5, 0, 0.5);
    heldNotes[note] = mouseXIndex; // Store index for visual feedback
    setTimeout(() => { delete heldNotes[note]; }, 1000); // Note stays on the staff for 1 second
  }
}

function keyPressed() {
  let keyMappings = {'A': 0, 'S': 1, 'D': 2, 'F': 3, 'G': 4, 'H': 5, 'J': 6, 'K': 7};
  let noteIndex = keyMappings[key.toUpperCase()];
  if (noteIndex !== undefined) {
    let note = scale[noteIndex];
    synth.play(note, 0.5, 0, 0.5);
    heldNotes[note] = noteIndex; // Store index for visual feedback
    setTimeout(() => { delete heldNotes[note]; }, 1000); // Note stays on the staff for 1 second
  }
}

function keyReleased() {
  let keyMappings = {'A': 0, 'S': 1, 'D': 2, 'F': 3, 'G': 4, 'H': 5, 'J': 6, 'K': 7};
  let noteIndex = keyMappings[key.toUpperCase()];
  if (noteIndex !== undefined) {
    let note = scale[noteIndex];
    delete heldNotes[note];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

