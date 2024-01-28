/* 
In this code a small space ship is travelling through space animation is inspired 
by Star Wars hyperspeed additionally moving the mouse left to right changes the speed of the background
*/

// Setup Varibles 
let stars = [];
let numStars = 800;
let spaceshipX = 80;
let spaceshipSpeed = 2;

class Star {
    constructor() {
        this.x = random(-width, width);
        this.y = random(-height, height);
        this.z = random(width);
    }

    update() {
        this.z = this.z - speed;
        if (this.z < 1) {
            this.z = width;
            this.x = random(-width, width);
            this.y = random(-height, height);
        }
    }

    show() {
        fill(255);
        noStroke();

        let sx = map(this.x / this.z, 0, 1, 0, width);
        let sy = map(this.y / this.z, 0, 1, 0, height);

        let r = map(this.z, 0, width, 16, 0);
        ellipse(sx, sy, r, r);
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < numStars; i++) {
        stars[i] = new Star();
    }
    spaceshipX = 0;
}

function draw() {
    speed = map(mouseX, 0, width, 0, 50);
    background(0);
    translate(width / 2, height / 2);
    for (let star of stars) {
        star.update();
        star.show();
    }
    translate(-width / 2, -height / 2);

    fill(255);
    triangle(spaceshipX, height / 2, spaceshipX - 20, height / 2 + 10, spaceshipX - 20, height / 2 - 10);

    // Animated Flames
    for (let i = 0; i < 5; i++) {
        let flameSize = random(5, 15);
        let flameYOffset = random(-5, 5);
        fill(255, random(100, 255), 0); // Random orange-red color
        triangle(spaceshipX - 20, height / 2 + flameYOffset, spaceshipX - 20 - flameSize, height / 2 + flameYOffset + flameSize / 2, spaceshipX - 20 - flameSize, height / 2 + flameYOffset - flameSize / 2);
    }

    spaceshipX += spaceshipSpeed;
    if (spaceshipX > width) {
        spaceshipX = 0;
    }
}



