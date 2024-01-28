let stars = [];
let numStars = 800;
let bitcoinImg;
let bitcoin;
let speed = 2; // Default speed for stars

function preload() {
    bitcoinImg = loadImage('/Users/anishkubal/Documents/GitHub/computational-art-spring-2024/Assignments/01_portrait/Bitcoin.png'); // Ensure this path is correct
}

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

    // Initialize Bitcoin object
    bitcoin = {
        x: width / 2,
        y: height / 2,
        xSpeed: 3,
        ySpeed: 2,

        move: function() {
            this.x += this.xSpeed;
            this.y += this.ySpeed;
            if (this.x > width || this.x < 0) {
                this.xSpeed *= -1;
            }
            if (this.y > height || this.y < 0) {
                this.ySpeed *= -1;
            }
        },

        display: function() {
            image(bitcoinImg, this.x, this.y, 50, 50); // Adjust the size as needed
        }
    };
}

function draw() {
    speed = map(mouseX, 0, width, 0, 50);
    background(0);
    translate(width / 2, height / 2);
    for (let star of stars) {
        star.update();
        star.show();
    }

    translate(-width / 2, -height / 2); // Reset translation to draw Bitcoin correctly
    bitcoin.move();
    bitcoin.display();
}
