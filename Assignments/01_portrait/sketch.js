function setup() {
  createCanvas(800, 800);
  background(255);
}

function draw() {
  // Draw the face
  fill(205, 133, 63); // Skin color
  ellipse(200, 200, 150, 200); // Head

  // Draw the eyes
  fill(255); // White part of the eyes
  ellipse(170, 180, 40, 20); // Left eye
  ellipse(230, 180, 40, 20); // Right eye

  fill(0); // Black part of the eyes
  ellipse(170, 180, 10, 20); // Left pupil
  ellipse(230, 180, 10, 20); // Right pupil

  // Draw the nose
  line(200, 200, 200, 240); // Simple line for nose

  // Draw the mouth
  noFill();
  arc(200, 260, 50, 20, 0, PI); // Smiling mouth
}
