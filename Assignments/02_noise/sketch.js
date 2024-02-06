let yoff = 0.0; 

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0, 255, 0); // Green background

  // Draw the sun
  fill(255, 204, 0); // Yellow color for the sun
  noStroke(); // No border for the sun
  ellipse(width - 50, 50, 80, 80); // Sun position and size
  
  // Sun rays got inspiration from online for the math part
  stroke(255, 204, 0); // Yellow color for the rays
  strokeWeight(2); 
  for (let i = 0; i < 360; i+=15) {
    let angle = radians(i);
    let x = (width - 50) + cos(angle) * 60;
    let y = 50 + sin(angle) * 60;
    line(width - 50, 50, x, y);
  }
  noStroke(); 
  fill(0, 102, 153); // Set Blue for waves

  // Draw the waves
  beginShape();
  let xoff = 0;
  for (let x = 0; x <= width; x += 10) {
    let y = map(noise(xoff, yoff), 0, 1, 200, 300);
    vertex(x, y);
    xoff += 0.05;
  }
  yoff += 0.01;
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }