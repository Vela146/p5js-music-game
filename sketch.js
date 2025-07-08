// Move all global variable declarations to the very top
let balls = [];
let bouncerR;
let bouncerL;
let notes = ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5', 'Eb5', 'F5', 'G5', 'Bb5'];
let soundstuff;
let reverbEffect;
let lastSoundTime = 0;
let soundCooldown = 100;
let wallT, wallB, wallL, wallR;
let synthWallT, synthWallB, synthWallL, synthWallR;
let synthBouncerL, synthBouncerR;
let synthsInitialized = false;
let globalReverb;
let isDragging = false;
let isDraggingFar = false;
let dragStartX = 0;
let dragStartY = 0;
let currentDragX = 0;
let currentDragY = 0;
let shootMode = 'random';
let currentLevel = 1;
let obstacles = [];
let movingObstacles = [];
let buttons = [];
let smol = [];
// Rhythm groups (do NOT reference rhythms inside its own declaration)
let rhythms = {
	T: { balls: [], interval: 1700, end: 0 },
	B: { balls: [], interval: 3200, end: 0 },
	L: { balls: [], interval: 800, end: 0 },
	R: { balls: [], interval: 1200, end: 0 },
	F: { balls: [], interval: 1000, end: 0 }
};


// Button system


// Button class for musical mode selection
class Button {
	constructor(x, y, width, height, text, level) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.text = text;
		this.level = level;
		this.isHovered = false;
	}
	
	display() {
		// Button background
		if (this.level === currentLevel) {
			fill(100, 150, 255, 200); // Active mode - blue
		} else if (this.isHovered) {
			fill(150, 150, 150, 200); // Hovered - gray
		} else {
			fill(80, 80, 80, 150); // Normal - dark gray
		}
		
		stroke(255, 255, 255, 100);
		strokeWeight(2);
		rect(this.x, this.y, this.width, this.height, 8); // Rounded corners
		
		// Button text
		fill(255, 255, 255, 255);
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(16);
		text(this.text, this.x + this.width/2, this.y + this.height/2);
	}
	
	checkHover() {
		this.isHovered = mouseX > this.x && mouseX < this.x + this.width &&
						 mouseY > this.y && mouseY < this.y + this.height;
	}
	
	isClicked() {
		return this.isHovered && mouseIsPressed;
	}
}

// Obstacle class for level 2 and 3
class Obstacle {
	constructor(x, y, width, height, color) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.speed = 0; // For moving obstacles
		this.direction = 1; // 1 for down, -1 for up
	}
	
	update() {
		if (this.speed > 0) {
			this.y += this.speed * this.direction;
			
			// Bounce off top and bottom walls (within safe bounds)
			let topBound = 20 + this.height/2;  // Top wall is at y=0, height=10, so safe area starts at y=20
			let bottomBound = 380 - this.height/2; // Bottom wall is at y=400, height=10, so safe area ends at y=380
			
			if (this.y <= topBound || this.y >= bottomBound) {
				this.direction *= -1;
				// Ensure obstacle stays within bounds
				this.y = constrain(this.y, topBound, bottomBound);
			}
		}
	}
	
	display() {
		// Create animated gradient for obstacles with unique patterns for each
		let t = millis() * 0.002;
		let gradientColor1, gradientColor2;
		let uniqueOffset = (this.x + this.y) * 0.1;
		let t1 = t + uniqueOffset;
		let t2 = t * 0.8 + uniqueOffset * 2;
		if (this.color.toString().includes('255, 182, 193')) {
			gradientColor1 = color(255 + 25 * sin(t1), 182 + 15 * cos(t2), 193 + 20 * sin(t1 * 1.3));
			gradientColor2 = color(255 + 20 * cos(t2), 182 + 25 * sin(t1 * 0.7), 193 + 15 * cos(t1));
		} else if (this.color.toString().includes('173, 216, 230')) {
			gradientColor1 = color(173 + 20 * sin(t1 * 0.6), 216 + 25 * cos(t2), 230 + 15 * sin(t1 * 1.4));
			gradientColor2 = color(173 + 15 * cos(t1 * 1.3), 216 + 20 * sin(t2 * 0.7), 230 + 25 * cos(t1 * 0.5));
		} else if (this.color.toString().includes('255, 218, 185')) {
			gradientColor1 = color(255 + 15 * sin(t1 * 0.8), 218 + 20 * cos(t2 * 1.2), 185 + 25 * sin(t1 * 0.6));
			gradientColor2 = color(255 + 25 * cos(t1 * 0.7), 218 + 15 * sin(t2), 185 + 20 * cos(t1 * 1.3));
		} else if (this.color.toString().includes('221, 160, 221')) {
			gradientColor1 = color(221 + 20 * sin(t1 * 1.3), 160 + 25 * cos(t2 * 0.5), 221 + 15 * sin(t1 * 0.8));
			gradientColor2 = color(221 + 15 * cos(t1), 160 + 20 * sin(t2 * 1.2), 221 + 25 * cos(t1 * 0.7));
		} else if (this.color.toString().includes('176, 224, 230')) {
			gradientColor1 = color(176 + 25 * sin(t1 * 0.7), 224 + 15 * cos(t2 * 1.3), 230 + 20 * sin(t1 * 0.6));
			gradientColor2 = color(176 + 20 * cos(t1 * 1.2), 224 + 25 * sin(t2 * 0.5), 230 + 15 * cos(t1 * 0.8));
		} else if (this.color.toString().includes('255, 192, 203')) {
			gradientColor1 = color(255 + 15 * cos(t1 * 1.4), 192 + 20 * sin(t2 * 0.6), 203 + 25 * cos(t1 * 0.9));
			gradientColor2 = color(255 + 25 * sin(t1 * 0.5), 192 + 15 * cos(t2 * 1.3), 203 + 20 * sin(t1 * 0.7));
		} else {
			gradientColor1 = color(200 + 20 * sin(t1), 200 + 20 * cos(t2), 200 + 20 * sin(t1 * 0.7));
			gradientColor2 = color(220 + 15 * cos(t1 * 1.2), 220 + 15 * sin(t2 * 0.8), 220 + 15 * cos(t1));
		}
		noStroke();
		if (this.angle) {
			push();
			translate(this.x, this.y);
			rotate(radians(this.angle));
			for (let i = 0; i < this.height; i++) {
				let inter = map(i, 0, this.height, 0, 1);
				let c = lerpColor(gradientColor1, gradientColor2, inter);
				fill(c);
				rect(-this.width/2, -this.height/2 + i, this.width, 1);
			}
			pop();
		} else {
			for (let i = 0; i < this.height; i++) {
				let inter = map(i, 0, this.height, 0, 1);
				let c = lerpColor(gradientColor1, gradientColor2, inter);
				fill(c);
				rect(this.x - this.width/2, this.y - this.height/2 + i, this.width, 1);
			}
		}
	}
	
	collidesWith(ball) {
		if (this.angle) {
			// Convert ball position to obstacle's local (rotated) space
			let angleRad = radians(this.angle);
			let cosA = Math.cos(-angleRad);
			let sinA = Math.sin(-angleRad);
			let dx = ball.x - this.x;
			let dy = ball.y - this.y;
			// Rotate the ball's center into the obstacle's local space
			let localX = dx * cosA - dy * sinA;
			let localY = dx * sinA + dy * cosA;
			// Find closest point on the rectangle to the ball center
			let closestX = Math.max(-this.width/2, Math.min(localX, this.width/2));
			let closestY = Math.max(-this.height/2, Math.min(localY, this.height/2));
			// Calculate distance from ball center to closest point
			let distX = localX - closestX;
			let distY = localY - closestY;
			let distanceSq = distX * distX + distY * distY;
			let radius = ball.size / 2;
			return distanceSq <= radius * radius;
		} else {
			// Axis-aligned check (AABB vs circle)
			let closestX = Math.max(this.x - this.width/2, Math.min(ball.x, this.x + this.width/2));
			let closestY = Math.max(this.y - this.height/2, Math.min(ball.y, this.y + this.height/2));
			let distX = ball.x - closestX;
			let distY = ball.y - closestY;
			let distanceSq = distX * distX + distY * distY;
			let radius = ball.size / 2;
			return distanceSq <= radius * radius;
		}
	}
}

// Ball class for basic physics
class Ball {
	constructor(x, y, size) {
		this.x = x
		this.y = y
		this.size = size
		this.vx = random(-3, 3)
		this.vy = random(-3, 3)
		this.color = color(random(150, 225))
		this.note = null
		this.isGlued = false
		this.gluedTo = null
		this.lifetime = 1200 // 20 seconds at 60fps (doubled from 600)
		this.age = 0
		this.opacity = 255
	}
	
	update() {
		this.age++
		
		// Calculate fade based on age - start fading earlier and slower
		if (this.age > this.lifetime * 0.5) { // Start fading after 50% of lifetime (10 seconds)
			let fadeProgress = (this.age - this.lifetime * 0.5) / (this.lifetime * 0.5)
			this.opacity = 255 * (1 - fadeProgress)
		}
		
		if (!this.isGlued) {
			this.x += this.vx
			this.y += this.vy
			
			// Bounce off walls with energy conservation
			if (this.x <= 10 || this.x >= width - 10) {
				this.vx *= -1
				this.x = constrain(this.x, 10, width - 10)
			}
			if (this.y <= 10 || this.y >= height - 10) {
				this.vy *= -1
				this.y = constrain(this.y, 10, height - 10)
			}
		}
	}
	
	display() {
		let originalColor = this.color
		let r = red(originalColor)
		let g = green(originalColor)
		let b = blue(originalColor)
		fill(r, g, b, this.opacity)
		noStroke()
		ellipse(this.x, this.y, this.size)
	}
	
	collidesWith(other) {
		let d = dist(this.x, this.y, other.x, other.y)
		return d < (this.size/2 + other.size/2)
	}
	
	isDead() {
		return this.age >= this.lifetime
	}
	
	// Get fade multiplier for sound and effects (0.0 to 1.0)
	getFadeMultiplier() {
		return this.opacity / 255
	}
}

function setup() {
	// Initialize walls and bouncers FIRST
	createCanvas(windowWidth, windowHeight);
	background(0);
	noStroke();
	wallT = {x: width/2, y: 0, width: width, height: 10};
	wallB = {x: width/2, y: height, width: width, height: 10};
	wallL = {x: 0, y: height/2, width: 10, height: height};
	wallR = {x: width, y: height/2, width: 10, height: height};
	bouncerR = {x: 50, y: height/2, width: 8, height: 80};
	bouncerL = {x: width-50, y: height/2, width: 8, height: 80};

	// Initialize mode 1 (Pure Harmony - no obstacles)
	setupLevel(1);
	
	// Create musical mode selection buttons
	createButtons();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	// Recalculate wall and bouncer positions
	wallT = {x: width/2, y: 0, width: width, height: 10};
	wallB = {x: width/2, y: height, width: width, height: 10};
	wallL = {x: 0, y: height/2, width: 10, height: height};
	wallR = {x: width, y: height/2, width: 10, height: height};
	bouncerR.x = 50;
	bouncerR.y = height/2;
	bouncerL.x = width-50;
	bouncerL.y = height/2;
	// Reposition buttons in top right corner
	createButtons();
}

function draw() {
	// Guard: return if any wall or bouncer is undefined
	if (!wallT || !wallB || !wallL || !wallR || !bouncerL || !bouncerR) return;

	// 1. Draw animated gradient background (every frame)
	let t = millis() * 0.0005;
	let [bgBase1, bgBase2, bgBase3] = getBackgroundColorsForLevel(currentLevel);
	let bgColorA = lerpColor(bgBase1, bgBase2, 0.5 + 0.5 * sin(t));
	let bgColorB = lerpColor(bgBase2, bgBase3, 0.5 + 0.5 * cos(t * 1.2));
	for (let i = 0; i < height; i++) {
		let inter = map(i, 0, height, 0, 1);
		let c = lerpColor(bgColorA, bgColorB, inter);
		stroke(c);
		line(0, i, width, i);
	}
	noStroke();

	// 2. Draw a semi-transparent overlay for trails
	fill(0, 0, 0, 30); // RGBA, low alpha for long trails
	rect(0, 0, width, height);

	// --- Animated colorful wall gradients ---
	let tWall = millis() * 0.001; // Use a different timer for wall animation
	let wallColor1 = color(
		255 + 50 * sin(tWall * 0.5),
		240 + 30 * sin(tWall * 0.7),
		205 + 40 * sin(tWall * 0.3)
	);
	let wallColor2 = color(
		235 + 40 * sin(tWall * 0.6),
		220 + 35 * sin(tWall * 0.4),
		185 + 45 * sin(tWall * 0.8)
	);

	// Top wall animated gradient
	for (let y = 0; y < wallT.height; y++) {
		for (let x = 0; x < width; x++) {
			let interX = map(x, 0, width, 0, 1);
			let c = lerpColor(wallColor1, wallColor2, interX);
			stroke(c);
			point(x, y);
		}
	}
	// Bottom wall animated gradient
	for (let y = height - wallB.height; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let interX = map(x, 0, width, 0, 1);
			let c = lerpColor(wallColor2, wallColor1, interX);
			stroke(c);
			point(x, y);
		}
	}
	// Left wall animated gradient
	for (let x = 0; x < wallL.width; x++) {
		for (let y = 0; y < height; y++) {
			let interY = map(y, 0, height, 0, 1);
			let c = lerpColor(wallColor1, wallColor2, interY);
			stroke(c);
			point(x, y);
		}
	}
	// Right wall animated gradient
	for (let x = width - wallR.width; x < width; x++) {
		for (let y = 0; y < height; y++) {
			let interY = map(y, 0, height, 0, 1);
			let c = lerpColor(wallColor2, wallColor1, interY);
			stroke(c);
			point(x, y);
		}
	}
	noStroke();

	// --- Animated pastel bouncer gradients ---
	let tB = millis() * 0.0015;
	if (currentLevel !== 10) {
		// Right bouncer: animated between pastel cyan, yellow, and pink
		let bouncerRColor1 = lerpColor(color(0 + 80 * sin(tB), 255, 255 * abs(sin(tB * 0.7))), color(255,255,255), 0.6);
		let bouncerRColor2 = lerpColor(color(255, 255 * abs(cos(tB * 0.8)), 0 + 80 * cos(tB)), color(255,255,255), 0.6);
		for (let i = 0; i < bouncerR.height; i++) {
			let inter = map(i, 0, bouncerR.height, 0, 1);
			let c = lerpColor(bouncerRColor1, bouncerRColor2, inter);
			fill(c);
			rect(bouncerR.x - bouncerR.width/2, bouncerR.y - bouncerR.height/2 + i, bouncerR.width, 1);
		}
		// Left bouncer: animated between pastel magenta, green, and blue
		let bouncerLColor1 = lerpColor(color(255, 0 + 120 * abs(sin(tB * 0.9)), 255), color(255,255,255), 0.6);
		let bouncerLColor2 = lerpColor(color(0 + 120 * abs(cos(tB * 0.6)), 255, 100 + 155 * abs(sin(tB * 1.2))), color(255,255,255), 0.6);
		for (let i = 0; i < bouncerL.height; i++) {
			let inter = map(i, 0, bouncerL.height, 0, 1);
			let c = lerpColor(bouncerLColor1, bouncerLColor2, inter);
			fill(c);
			rect(bouncerL.x - bouncerL.width/2, bouncerL.y - bouncerL.height/2 + i, bouncerL.width, 1);
		}
	}

	// Draw gradient arrow for drag
	if (isDragging) {
		let x0 = dragStartX;
		let y0 = dragStartY;
		let x1 = currentDragX;
		let y1 = currentDragY;
		stroke(255, 180);
		strokeWeight(3);
		noFill();
		line(x0, y0, x1, y1);
		// Draw arrowhead
		let angle = atan2(y1 - y0, x1 - x0);
		let ah = 18;
		let aw = 10;
		fill(255);
		noStroke();
		push();
		translate(x1, y1);
		rotate(angle);
		beginShape();
		vertex(0, 0);
		vertex(-ah, -aw);
		vertex(-ah, aw);
		endShape(CLOSE);
		pop();
	}

	RhythmsStuff();
	for (let i = smol.length - 1; i >= 0; i--) {
		smol[i].update();
		smol[i].show();
		if (smol[i].isDead()) {
			smol.splice(i, 1);
		}
	}
	
	moveThemThangs()
	
	// Update and display obstacles
	updateObstacles()

	// Update and draw balls
	for (let i = balls.length - 1; i >= 0; i--) {
		let ball = balls[i]
		
		// Remove dead balls
		if (ball.isDead()) {
			balls.splice(i, 1)
			continue
		}
		
		ball.update()
		ball.display()
		
		// Check ball-to-ball collisions
		for (let j = i - 1; j >= 0; j--) {
			let otherBall = balls[j]
			let d = dist(ball.x, ball.y, otherBall.x, otherBall.y)
			if (d < ball.size/2 + otherBall.size/2) {
				// Ball collision detected - bounce them apart
				ballCollision(ball, otherBall)
			}
		}
		
		// Check wall collisions
		if (!ball.isGlued) {
			if (ball.y <= 15) {
				stickyBalls(ball, wallT, 'T');
				ball.color = color("rgb(165,233,165)");
				if (synthsInitialized && synthWallT) {
					synthWallT.play(random(notes), 0.2 * ball.getFadeMultiplier(), 0, 0.8);
				}
				createBurst(ball.x, ball.y, color("rgb(202,255,202)"), 'circle', null, {}, ball.getFadeMultiplier());
			}
			else if (ball.y >= height - 15) {
				ball.color = color("rgb(252,155,155)");
				stickyBalls(ball, wallB, 'B');
				if (synthsInitialized && synthWallB) {
					synthWallB.play(random(notes), 0.2 * ball.getFadeMultiplier(), 0, 0.8);
				}
				createBurst(ball.x, ball.y, color("rgb(255,185,185)"), 'circle', null, {}, ball.getFadeMultiplier());
			}
			else if (ball.x <= 15) {
				ball.color = color("rgb(255,255,147)");
				stickyBalls(ball, wallL, 'L');
				if (synthsInitialized && synthWallL) {
					synthWallL.play(random(notes), 0.2 * ball.getFadeMultiplier(), 0, 0.8);
				}
				createBurst(ball.x, ball.y, color("rgb(255,255,200)"), 'circle', null, {}, ball.getFadeMultiplier());
			}
			else if (ball.x >= width - 15) {
				ball.color = color("rgb(238,195,255)");
				stickyBalls(ball, wallR, 'R');
				if (synthsInitialized && synthWallR) {
					synthWallR.play(random(notes), 0.2 * ball.getFadeMultiplier(), 0, 0.8);
				}
				createBurst(ball.x, ball.y, color("rgb(248,227,255)"), 'circle', null, {}, ball.getFadeMultiplier());
			}
			
			// Check static obstacles
			for (let obstacle of obstacles) {
				if (obstacle.collidesWith(ball)) {
					handleObstacleCollision(ball, obstacle);
				}
			}
			
			// Check moving obstacles
			for (let obstacle of movingObstacles) {
				if (obstacle.collidesWith(ball)) {
					handleObstacleCollision(ball, obstacle);
				}
			}
		}
		
		// Check bouncer collisions
		if (!ball.isGlued) {
			// Right bouncer collision
			if (ball.x + ball.size/2 > bouncerR.x - bouncerR.width/2 && 
				ball.x - ball.size/2 < bouncerR.x + bouncerR.width/2 &&
				ball.y + ball.size/2 > bouncerR.y - bouncerR.height/2 && 
				ball.y - ball.size/2 < bouncerR.y + bouncerR.height/2) {
				
				// Set consistent speed to the right
				ball.vx = 3
				ball.color = color("rgb(124,255,255)")
				if (synthsInitialized && synthBouncerR) {
					synthBouncerR.play(random(notes), 0.2 * ball.getFadeMultiplier(), 0, 0.5)
				}
				createBurst(ball.x, ball.y, color("rgb(193,255,255)"), 'circle', null, {}, ball.getFadeMultiplier())
			}
			
			// Left bouncer collision
			if (ball.x + ball.size/2 > bouncerL.x - bouncerL.width/2 && 
				ball.x - ball.size/2 < bouncerL.x + bouncerL.width/2 &&
				ball.y + ball.size/2 > bouncerL.y - bouncerL.height/2 && 
				ball.y - ball.size/2 < bouncerL.y + bouncerL.height/2) {
				
				// Set consistent speed to the left
				ball.vx = -3
				ball.color = color("rgb(255,200,124)")
				if (synthsInitialized && synthBouncerL) {
					synthBouncerL.play(random(notes), 0.2 * ball.getFadeMultiplier(), 0, 0.5)
				}
				createBurst(ball.x, ball.y, color("rgb(255,223,163)"), 'circle', null, {}, ball.getFadeMultiplier())
			}
		}
	}

	// Show audio initialization status
	if (!synthsInitialized) {
		fill(255, 255, 255, 200);
		textAlign(CENTER, CENTER);
		textSize(16);
		text("Click anywhere to enable audio", width/2, height/2);
		textSize(12);
		text("(Required for sound effects)", width/2, height/2 + 25);
	}
	
	// Show current level
	fill(255, 255, 255, 150);
	textAlign(LEFT, TOP);
	textSize(14);
	text("Level " + currentLevel, 10, 10);
	
	// Display level selection buttons
	displayButtons();
	
	// Show directional shooting feedback
	if (isDragging) {
		// Draw direction line
		stroke(255, 255, 255, 150);
		strokeWeight(2);
		line(dragStartX, dragStartY, currentDragX, currentDragY);
		
		// Draw arrowhead
		let dx = currentDragX - dragStartX;
		let dy = currentDragY - dragStartY;
		let distance = sqrt(dx * dx + dy * dy);
		
		if (distance > 10) {
			// Calculate arrowhead points
			let angle = atan2(dy, dx);
			let arrowLength = 15;
			let arrowAngle = PI / 6; // 30 degrees
			
			let x1 = currentDragX - arrowLength * cos(angle - arrowAngle);
			let y1 = currentDragY - arrowLength * sin(angle - arrowAngle);
			let x2 = currentDragX - arrowLength * cos(angle + arrowAngle);
			let y2 = currentDragY - arrowLength * sin(angle + arrowAngle);
			
			// Draw arrowhead
			noFill();
			triangle(currentDragX, currentDragY, x1, y1, x2, y2);
			
			// Show speed indicator
			fill(255, 255, 255, 200);
			noStroke();
			textAlign(CENTER, CENTER);
			textSize(12);
			text("Drag to aim, release to shoot", width/2, 30);
		} else {
			// Show click indicator
			fill(255, 255, 255, 200);
			noStroke();
			textAlign(CENTER, CENTER);
			textSize(12);
			text("Click for random ball", width/2, 30);
		}
		
		noStroke(); // Reset stroke for other drawing
	}

	// Update free balls rhythm group
	rhythms.F.balls = balls.filter(ball => !ball.isGlued);

	// Add mobile controls display
	drawMobileControls();
}

// Level management functions
function setupLevel(level) {
	currentLevel = level;
	obstacles = [];
	movingObstacles = [];

	// Clear all balls when switching levels
	balls = [];

	// Clear all particles
	smol = [];

	// Reset bouncer positions
	if (typeof bouncerL !== 'undefined') bouncerL.y = height/2;
	if (typeof bouncerR !== 'undefined') bouncerR.y = height/2;

	// Stop all sounds
	if (synthsInitialized) {
		if (synthWallT) synthWallT.triggerRelease();
		if (synthWallB) synthWallB.triggerRelease();
		if (synthWallL) synthWallL.triggerRelease();
		if (synthWallR) synthWallR.triggerRelease();
		if (synthBouncerL) synthBouncerL.triggerRelease();
		if (synthBouncerR) synthBouncerR.triggerRelease();
	}

	// Clear rhythm group stuck balls
	for (let key in rhythms) {
		rhythms[key].balls = [];
	}

	// Assign notes based on level for harmonious sound
	switch(level) {
		case 1: // C major pentatonic
			notes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5']; break;
		case 2: // C minor pentatonic
			notes = ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5']; break;
		case 3: // C major
			notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']; break;
		case 4: // C minor
			notes = ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5']; break;
		case 5: // C lydian
			notes = ['C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5']; break;
		case 6: // C dorian
			notes = ['C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C5']; break;
		case 7: // C mixolydian
			notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5']; break;
		case 8: // C whole tone
			notes = ['C4', 'D4', 'E4', 'F#4', 'G#4', 'A#4', 'C5']; break;
		default:
			notes = ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5', 'Eb5', 'F5', 'G5', 'Bb5'];
	}

	if (level === 1) {
		// Mode 1: Pure Harmony - Clean space, direct bouncer interaction
		// No obstacles - perfect for learning the instrument
	} else if (level === 2) {
		// Mode 2: Echo Chamber - Two dividers, new locations
		obstacles.push(new Obstacle(220, 120, 20, 40, color(255, 182, 193)));
		obstacles.push(new Obstacle(580, 280, 20, 40, color(173, 216, 230)));
	} else if (level === 3) {
		// Mode 3: Triangle Resonance - Three obstacles in triangular formation
		obstacles.push(new Obstacle(250, 150, 20, 60, color(255, 218, 185)));
		obstacles.push(new Obstacle(400, 250, 20, 60, color(221, 160, 221)));
		obstacles.push(new Obstacle(550, 150, 20, 60, color(176, 224, 230)));
	} else if (level === 4) {
		// Mode 4: Corner Harmony - Four corner obstacles create a frame
		obstacles.push(new Obstacle(150, 100, 20, 80, color(255, 192, 203)));
		obstacles.push(new Obstacle(650, 100, 20, 80, color(173, 216, 230)));
		obstacles.push(new Obstacle(150, 300, 20, 80, color(255, 218, 185)));
		obstacles.push(new Obstacle(650, 300, 20, 80, color(221, 160, 221)));
	} else if (level === 5) {
		// Mode 5: Flowing Melody - Two moving obstacles create dynamic patterns
		let movingObs1 = new Obstacle(300, 100, 15, 60, color(255, 218, 185));
		movingObs1.speed = 2;
		movingObstacles.push(movingObs1);
		let movingObs2 = new Obstacle(500, 300, 15, 60, color(221, 160, 221));
		movingObs2.speed = 1.5;
		movingObs2.direction = -1;
		movingObstacles.push(movingObs2);
	} else if (level === 6) {
		// Mode 6: Open Groove - Two horizontal obstacles (upper and lower)
		obstacles.push(new Obstacle(400, 90, 300, 18, color(255, 182, 193)));
		obstacles.push(new Obstacle(400, 310, 300, 18, color(173, 216, 230)));
	} else if (level === 7) {
		// Mode 7: Diagonal Jam - Two diagonal obstacles
		// Diagonal 1: top-left to center
		obstacles.push(new Obstacle(200, 100, 180, 18, color(255, 218, 185)));
		obstacles[obstacles.length-1].angle = -30; // Custom property for drawing
		// Diagonal 2: bottom-right to center
		obstacles.push(new Obstacle(600, 300, 180, 18, color(221, 160, 221)));
		obstacles[obstacles.length-1].angle = 30;
	} else if (level === 8) {
		// Mode 8: Crossover - One horizontal (upper) and one diagonal (lower left to center)
		obstacles.push(new Obstacle(400, 90, 320, 18, color(176, 224, 230)));
		obstacles.push(new Obstacle(180, 320, 180, 18, color(255, 192, 203)));
		obstacles[obstacles.length-1].angle = 25;
	} else if (level === 9) {
		// Mode 9: Spiral Groove - Four obstacles in a spiral pattern
		let centerX = 400;
		let centerY = 200;
		let radii = [70, 110, 150, 190];
		let angles = [0, 30, 60, 90];
		let colors = [
			color(120, 180, 255), // blue
			color(180, 120, 255), // purple
			color(255, 120, 200), // pink
			color(255, 180, 120)  // orange
		];
		for (let i = 0; i < 4; i++) {
			let rad = radii[i];
			let theta = radians(angles[i]);
			let x = centerX + rad * cos(theta);
			let y = centerY + rad * sin(theta);
			let obs = new Obstacle(x, y, 18, 80, colors[i]);
			obs.angle = angles[i];
			obstacles.push(obs);
		}
	}
}

function updateObstacles() {
	// Update and display static obstacles
	for (let obstacle of obstacles) {
		obstacle.display();
	}
	
	// Update and display moving obstacles
	for (let obstacle of movingObstacles) {
		obstacle.update();
		obstacle.display();
	}
}

function handleObstacleCollision(ball, obstacle) {
	// For both axis-aligned and rotated obstacles, use the closest-point method
	let angleRad = obstacle.angle ? radians(obstacle.angle) : 0;
	let cosA = Math.cos(-angleRad);
	let sinA = Math.sin(-angleRad);
	// Transform ball center to obstacle's local space
	let dx = ball.x - obstacle.x;
	let dy = ball.y - obstacle.y;
	let localX = dx * cosA - dy * sinA;
	let localY = dx * sinA + dy * cosA;
	// Find closest point on the rectangle to the ball center
	let closestX = Math.max(-obstacle.width/2, Math.min(localX, obstacle.width/2));
	let closestY = Math.max(-obstacle.height/2, Math.min(localY, obstacle.height/2));
	// Calculate normal and penetration
	let distX = localX - closestX;
	let distY = localY - closestY;
	let distance = Math.sqrt(distX * distX + distY * distY);
	let radius = ball.size / 2;
	if (distance === 0) {
		// Ball center is exactly at the closest point; pick an arbitrary normal
		distX = 1; distance = 1; distY = 0;
	}
	if (distance < radius) {
		// Collision detected
		// Move ball out along the normal
		let penetration = radius - distance + 0.1;
		let nx = distX / distance;
		let ny = distY / distance;
		// Move in local space
		localX += nx * penetration;
		localY += ny * penetration;
		// Transform back to world space
		let worldX = localX * cosA + localY * sinA + obstacle.x;
		let worldY = -localX * sinA + localY * cosA + obstacle.y;
		ball.x = worldX;
		ball.y = worldY;
		// Reflect velocity along the normal (in local space)
		// Transform velocity to local
		let vLocalX = ball.vx * cosA - ball.vy * sinA;
		let vLocalY = ball.vx * sinA + ball.vy * cosA;
		let vDotN = vLocalX * nx + vLocalY * ny;
		vLocalX -= 2 * vDotN * nx;
		vLocalY -= 2 * vDotN * ny;
		// Add some energy loss
		vLocalX *= 0.95;
		vLocalY *= 0.95;
		// Transform velocity back to world
		ball.vx = vLocalX * cosA + vLocalY * sinA;
		ball.vy = -vLocalX * sinA + vLocalY * cosA;
		// Play obstacle collision sound
		if (synthsInitialized) {
			synthWallL.play(random(notes), 0.15 * ball.getFadeMultiplier(), 0, 0.6);
		}
		// Create particle effect
		createBurst(ball.x, ball.y, obstacle.color, 'circle', null, {}, ball.getFadeMultiplier());
	}
}

// Button creation and management
function createButtons() {
	buttons = [];
	// Position buttons in top right corner, larger for mobile
	let buttonWidth = 45; // Increased from 35 for touch
	let buttonHeight = 35; // Increased from 25 for touch
	let buttonSpacing = 8; // Increased spacing
	let startX = width - 60 - (buttonWidth + buttonSpacing) * 7; // 8 buttons total
	let startY = 15; // Slightly lower for mobile
	
	buttons.push(new Button(startX + (buttonWidth + buttonSpacing) * 0, startY, buttonWidth, buttonHeight, "1", 1));
	buttons.push(new Button(startX + (buttonWidth + buttonSpacing) * 1, startY, buttonWidth, buttonHeight, "2", 2));
	buttons.push(new Button(startX + (buttonWidth + buttonSpacing) * 2, startY, buttonWidth, buttonHeight, "3", 3));
	buttons.push(new Button(startX + (buttonWidth + buttonSpacing) * 3, startY, buttonWidth, buttonHeight, "4", 4));
	buttons.push(new Button(startX + (buttonWidth + buttonSpacing) * 4, startY, buttonWidth, buttonHeight, "5", 5));
	buttons.push(new Button(startX + (buttonWidth + buttonSpacing) * 5, startY, buttonWidth, buttonHeight, "6", 6));
	buttons.push(new Button(startX + (buttonWidth + buttonSpacing) * 6, startY, buttonWidth, buttonHeight, "7", 7));
	buttons.push(new Button(startX + (buttonWidth + buttonSpacing) * 7, startY, buttonWidth, buttonHeight, "8", 8));
}

function displayButtons() {
	// Check for button interactions
	for (let button of buttons) {
		button.checkHover();
		button.display();
		
		// Handle button clicks
		if (button.isClicked()) {
			setupLevel(button.level);
			return; // Exit early to prevent ball spawning
		}
	}
}

// Musical mode switching with keyboard (still works)
function keyPressed() {
	if (key === '1') setupLevel(1);
	else if (key === '2') setupLevel(2);
	else if (key === '3') setupLevel(3);
	else if (key === '4') setupLevel(4);
	else if (key === '5') setupLevel(5);
	else if (key === '6') setupLevel(6);
	else if (key === '7') setupLevel(7);
	else if (key === '8') setupLevel(8);
}

//spawn balls
function initSynths() {
	try {
		synthWallT = new p5.MonoSynth();
		synthWallB = new p5.MonoSynth();
		synthWallL = new p5.MonoSynth();
		synthWallR = new p5.MonoSynth();
		synthBouncerL = new p5.MonoSynth();
		synthBouncerR = new p5.MonoSynth();
		soundstuff = new p5.MonoSynth();

		// Soft, ambient oscillator types for each wall
		synthWallT.oscillator.setType('sine');
		synthWallB.oscillator.setType('sine');
		synthWallL.oscillator.setType('triangle');
		synthWallR.oscillator.setType('triangle');
		synthBouncerL.oscillator.setType('sine');
		synthBouncerR.oscillator.setType('triangle');

		// Set envelopes for each synth (defensive)
		if (synthWallT.envelope) synthWallT.envelope.setADSR(0.2, 0.3, 0.2, 1.2);
		if (synthWallB.envelope) synthWallB.envelope.setADSR(0.3, 0.2, 0.2, 1.2);
		if (synthWallL.envelope) synthWallL.envelope.setADSR(0.15, 0.25, 0.2, 1.0);
		if (synthWallR.envelope) synthWallR.envelope.setADSR(0.15, 0.25, 0.2, 1.0);
		if (synthBouncerL.envelope) synthBouncerL.envelope.setADSR(0.1, 0.2, 0.2, 0.8);
		if (synthBouncerR.envelope) synthBouncerR.envelope.setADSR(0.1, 0.2, 0.2, 0.8);

		// Connect to global reverb if desired
		if (globalReverb) {
			synthWallT.connect(globalReverb);
			synthWallB.connect(globalReverb);
			synthWallL.connect(globalReverb);
			synthWallR.connect(globalReverb);
			synthBouncerL.connect(globalReverb);
			synthBouncerR.connect(globalReverb);
		}
		synthsInitialized = true;
	} catch (e) {
		console.error('Error initializing synths:', e);
	}
}

function mousePressed() {
	// Resume AudioContext if it's suspended
	if (getAudioContext().state !== 'running') {
		getAudioContext().resume();
	}

	if (!synthsInitialized) {
		// Initialize synths on first user interaction
		initSynths();
	}

	// Check if clicking on a button first
	for (let button of buttons) {
		if (button.isHovered) {
			setupLevel(button.level);
			return; // Exit early to prevent ball spawning
		}
	}

	// Start drag for directional shooting - always from center
	isDragging = true;
	isDraggingFar = false;
	// For level 10, spawn from circle center
	if (currentLevel === 10) {
		dragStartX = width/2;
		dragStartY = height/2;
	} else {
		dragStartX = width/2;  // Always start from center
		dragStartY = height/2; // Always start from center
	}
	currentDragX = mouseX;
	currentDragY = mouseY;
}

function mouseDragged() {
	if (isDragging) {
		currentDragX = mouseX;
		currentDragY = mouseY;
		let dx = currentDragX - dragStartX;
		let dy = currentDragY - dragStartY;
		let distance = sqrt(dx * dx + dy * dy);
		if (distance > 10) {
			isDraggingFar = true;
		}
	}
}

function mouseReleased() {
	if (isDragging) {
		let dx = currentDragX - dragStartX;
		let dy = currentDragY - dragStartY;
		let distance = sqrt(dx * dx + dy * dy);
		let spawnX = width/2;
		let spawnY = height/2;
		if (currentLevel === 10) {
			let topMargin = 10;
			let bottomMargin = 10;
			let usableHeight = height - topMargin - bottomMargin;
			spawnY = topMargin + usableHeight/2;
		}
		if (distance > 10) {
			// Milder speed mapping
			let minSpeed = 4;
			let maxSpeed = 12;
			let maxDrag = 140;
			let t = constrain(distance, 0, maxDrag) / maxDrag;
			let speed = lerp(minSpeed, maxSpeed, t);
			let normalizedDx = (dx / distance) * speed;
			let normalizedDy = (dy / distance) * speed;
			let ball = new Ball(spawnX, spawnY, 20);
			ball.vx = normalizedDx;
			ball.vy = normalizedDy;
			balls.push(ball);
		} else {
			// Random ball - always spawn in center
			let ball = new Ball(spawnX, spawnY, 20);
			balls.push(ball);
		}
		isDragging = false;
		isDraggingFar = false;
	}
}

//stick balls
function stickyBalls(ball, wall, wallName) {
	ball.isGlued = true
	ball.gluedTo = wall
	ball.note = random(notes)
	rhythms[wallName].balls.push(ball)
	if (wallName === 'T') {
		ball.y = wall.height + ball.size / 2; // Just below the top wall
	} else if (wallName === 'B') {
		ball.y = height - wall.height - ball.size / 2; // Just above the bottom wall
	} else if (wallName === 'L') {
		ball.x = wall.width + ball.size / 2; // Just right of the left wall
	} else if (wallName === 'R') {
		ball.x = width - wall.width - ball.size / 2; // Just left of the right wall
	}
}

//rhythm control 
function RhythmsStuff(){
	let now = millis();
	for (let key in rhythms) {
		let group = rhythms[key];
		if (typeof group.seqIndex === 'undefined') group.seqIndex = 0;
		for (let i = group.balls.length - 1; i >= 0; i--) {
			if (!balls.includes(group.balls[i])) {
				group.balls.splice(i, 1);
				if (i < group.seqIndex) group.seqIndex--;
			}
		}
		if (now > group.end && group.balls.length > 0) {
			if (group.seqIndex >= group.balls.length) group.seqIndex = 0;
			let ball = group.balls[group.seqIndex];
			if (ball && ball.note && synthsInitialized) {
				if (key === 'T' && synthWallT) {
					synthWallT.play(ball.note, 0.2 * ball.getFadeMultiplier(), 0, 0.8);
					createBurst(ball.x, ball.y, color("rgb(202,255,202)"), 'circle', 90, {size: 10, speed: 1, lifetime: 300, opacity: 180, count: 25, anim: 'pulse'}, ball.getFadeMultiplier());
				} else if (key === 'B' && synthWallB) {
					synthWallB.play(ball.note, 0.2 * ball.getFadeMultiplier(), 0, 0.8);
					createBurst(ball.x, ball.y, color("rgb(255,185,185)"), 'square', -90, {size: 4, speed: 4, lifetime: 100, opacity: 255, count: 40, anim: 'spin'}, ball.getFadeMultiplier());
				} else if (key === 'L' && synthWallL) {
					synthWallL.play(ball.note, 0.2 * ball.getFadeMultiplier(), 0, 0.8);
					createBurst(ball.x, ball.y, color("rgb(255,255,200)"), 'triangle', 0, {size: 8, speed: 2, lifetime: 200, opacity: 200, count: 15, anim: 'wobble'}, ball.getFadeMultiplier());
				} else if (key === 'R' && synthWallR) {
					synthWallR.play(ball.note, 0.2 * ball.getFadeMultiplier(), 0, 0.8);
					createBurst(ball.x, ball.y, color("rgb(248,227,255)"), 'diamond', 180, {size: 14, speed: 3, lifetime: 150, opacity: 220, count: 8, anim: 'spin'}, ball.getFadeMultiplier());
				} else if (key === 'C' && synthWallT) {
					synthWallT.play(ball.note, 0.2 * ball.getFadeMultiplier(), 0, 0.8);
					createBurst(ball.x, ball.y, color("rgb(220,255,220)"), 'circle', null, {size: 10, speed: 1, lifetime: 300, opacity: 180, count: 25, anim: 'pulse'}, ball.getFadeMultiplier());
				} else if (key === 'F' && synthWallT) {
					synthWallT.play(ball.note, 0.2 * ball.getFadeMultiplier(), 0, 0.8);
					createBurst(ball.x, ball.y, color("rgb(255,255,255)"), 'circle', null, {size: 12, speed: 2, lifetime: 200, opacity: 200, count: 18, anim: 'pulse'}, ball.getFadeMultiplier());
				}
			}
			group.seqIndex = (group.seqIndex + 1) % group.balls.length;
			group.end = now + group.interval;
		}
	}
}

//bouncer controls
//i hate maths
function moveThemThangs() {
	const speed = 5;
	
	// Keyboard controls (desktop)
	if (keyIsDown(UP_ARROW)) bouncerL.y -= speed;
	if (keyIsDown(DOWN_ARROW)) bouncerL.y += speed;
	if (keyIsDown(87)) bouncerR.y -= speed; // W
	if (keyIsDown(83)) bouncerR.y += speed; // S
	
	// Mobile touch controls - only when not dragging balls
	if (width < 800 && touches.length > 0 && !isDragging) {
		let touch = touches[0];
		
		// Left bouncer control (left side of screen)
		if (touch.x < 100 && touch.y > height - 100 && touch.y < height - 20) {
			if (touch.y < height - 60) {
				bouncerL.y -= speed; // UP
			} else {
				bouncerL.y += speed; // DOWN
			}
		}
		
		// Right bouncer control (right side of screen)
		if (touch.x > width - 100 && touch.y > height - 100 && touch.y < height - 20) {
			if (touch.y < height - 60) {
				bouncerR.y -= speed; // UP
			} else {
				bouncerR.y += speed; // DOWN
			}
		}
	}

	// Constrain bouncers to screen bounds
	const minY = 45;
	const maxY = height - 45;
	bouncerL.y = constrain(bouncerL.y, minY, maxY);
	bouncerR.y = constrain(bouncerR.y, minY, maxY);
}

//smol
class Particle {
	constructor(x, y, col, shape = 'circle', direction = null, size = null, speed = null, lifetime = null, opacity = null, anim = null) {
		this.pos = createVector(x, y);
		let angle;
		if (direction !== null) {
			angle = radians(direction + random(-45, 45));
			this.vel = p5.Vector.fromAngle(angle).mult(speed || random(1, 3));
		} else {
			this.vel = p5.Vector.random2D().mult(speed || random(1, 3));
		}
		this.lifetime = (lifetime || 255) * 2; // Double the default lifetime
		this.color = col;
		this.shape = shape;
		this.size = size || random(4, 8); // Slightly larger minimum
		this.opacity = opacity || 255;
		this.anim = anim; // e.g., 'spin', 'pulse', etc.
		this.age = 0;
		this.angle = random(TWO_PI);
	}
	update() {
		this.pos.add(this.vel);
		// Clamp position inside the play area (inside the walls), except in level 10
		if (typeof currentLevel === 'undefined' || currentLevel !== 10) {
			this.pos.x = constrain(this.pos.x, wallL.width, width - wallR.width);
			this.pos.y = constrain(this.pos.y, wallT.height, height - wallB.height);
		}
		this.lifetime -= 5;
		this.age++;
		if (this.anim === 'spin') this.angle += 0.2;
		if (this.anim === 'pulse') this.size = abs(sin(this.age * 0.2)) * 6 + 2;
		if (this.anim === 'wobble') this.pos.x += sin(this.age * 0.5) * 0.5;
	}
	show() {
		noStroke();
		fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], min(this.lifetime, this.opacity));
		push();
		translate(this.pos.x, this.pos.y);
		if (this.anim === 'spin') rotate(this.angle);
		if (this.shape === 'circle') {
			ellipse(0, 0, this.size);
		} else if (this.shape === 'square') {
			rect(-this.size/2, -this.size/2, this.size, this.size);
		} else if (this.shape === 'triangle') {
			triangle(
				0, -this.size/2,
				-this.size/2, this.size/2,
				this.size/2, this.size/2
			);
		} else if (this.shape === 'diamond') {
			quad(
				0, -this.size/2,
				this.size/2, 0,
				0, this.size/2,
				-this.size/2, 0
			);
		}
		pop();
	}
	isDead() {
		return this.lifetime < 0;
	}
}

function createBurst(x, y, col, shape = 'circle', direction = null, options = {}, fadeMultiplier = 1.0) {
	// Ensure options is always an object
	if (!options || typeof options !== 'object') {
		options = {};
	}
	// Make particles small but keep their reach far
	let smallSize = options.size ? options.size : 3;
	for (let i = 0; i < (options.count || 10); i++) {
		let adjustedOpacity = (options.opacity || 255) * fadeMultiplier;
		smol.push(new Particle(
			x, y, col, shape, direction,
			smallSize, options.speed, options.lifetime, adjustedOpacity, options.anim
		));
	}
}

// Helper function to play sounds with cooldown
function playSound(note) {
	if (soundstuff && millis() - lastSoundTime > soundCooldown) {
		try {
			soundstuff.play(note, 0.3, 0, 0.8)
			lastSoundTime = millis()
		} catch (e) {
			console.log("Sound error:", e)
		}
	}
}

// Ball-to-ball collision physics
function ballCollision(ball1, ball2) {
	// Calculate collision normal
	let dx = ball2.x - ball1.x
	let dy = ball2.y - ball1.y
	let distance = sqrt(dx * dx + dy * dy)
	
	// Normalize the collision vector
	let nx = dx / distance
	let ny = dy / distance
	
	// Separate the balls to prevent sticking
	let overlap = (ball1.size/2 + ball2.size/2) - distance
	
	// Only move non-stuck balls
	if (!ball1.isGlued) {
		ball1.x -= nx * overlap / 2
		ball1.y -= ny * overlap / 2
	}
	if (!ball2.isGlued) {
		ball2.x += nx * overlap / 2
		ball2.y += ny * overlap / 2
	}
	
	// Calculate relative velocity
	let dvx = ball2.vx - ball1.vx
	let dvy = ball2.vy - ball1.vy
	
	// Calculate velocity along collision normal
	let velAlongNormal = dvx * nx + dvy * ny
	
	// Only bounce if balls are moving toward each other
	if (velAlongNormal < 0) {
		// Swap velocities along the collision normal (only for non-stuck balls)
		if (!ball1.isGlued) {
			ball1.vx += nx * velAlongNormal
			ball1.vy += ny * velAlongNormal
			ball1.vx *= 0.95
			ball1.vy *= 0.95
		}
		if (!ball2.isGlued) {
			ball2.vx -= nx * velAlongNormal
			ball2.vy -= ny * velAlongNormal
			ball2.vx *= 0.95
			ball2.vy *= 0.95
		}
		// Play sound only, no particles
		playSound(random(notes))
	}
}

function getBackgroundColorsForLevel(level) {
	// Returns [bgBase1, bgBase2, bgBase3] for each level
	switch(level) {
		case 1: // Deep blue/purple
			return [color(20, 30, 50), color(40, 30, 70), color(30, 20, 60)];
		case 2: // Dark maroon/red
			return [color(35, 15, 25), color(70, 30, 40), color(60, 20, 30)];
		case 3: // Dark green
			return [color(20, 40, 30), color(40, 80, 60), color(30, 60, 40)];
		case 4: // Dark turquoise/teal
			return [color(15, 35, 38), color(20, 60, 70), color(28, 58, 68)];
		case 5: // Dark indigo/blue
			return [color(18, 22, 40), color(36, 38, 70), color(28, 32, 60)];
		case 6: // Dark olive/yellow-green
			return [color(28, 32, 18), color(50, 60, 30), color(38, 48, 22)];
		case 7: // Dark plum/magenta
			return [color(38, 18, 38), color(68, 38, 68), color(58, 28, 58)];
		case 8: // Dark brown/amber
			return [color(32, 24, 16), color(60, 40, 20), color(48, 32, 18)];
		default:
			return [color(20, 30, 50), color(40, 60, 90), color(30, 40, 70)];
	}
}

// Utility function for panning
function getPanForX(x) {
	return map(x, 0, width, -1, 1);
}

// Mobile touch controls
function touchStarted() {
	// Resume AudioContext if it's suspended
	if (getAudioContext().state !== 'running') {
		getAudioContext().resume();
	}

	if (!synthsInitialized) {
		// Initialize synths on first user interaction
		initSynths();
	}

	// Check if touching a button first
	for (let button of buttons) {
		if (button.isHovered) {
			setupLevel(button.level);
			return; // Exit early to prevent ball spawning
		}
	}

	// Only allow ball spawning in center area (not near bouncer controls)
	let touchX = touches[0].x;
	let touchY = touches[0].y;
	
	// Check if touch is in the center area (not in bouncer control zones)
	if (touchX > 120 && touchX < width - 120 && touchY < height - 120) {
		// Start drag for directional shooting - always from center
		isDragging = true;
		isDraggingFar = false;
		dragStartX = width/2;
		dragStartY = height/2;
		currentDragX = touchX;
		currentDragY = touchY;
	}
}

function touchMoved() {
	if (isDragging) {
		currentDragX = touches[0].x;
		currentDragY = touches[0].y;
		let dx = currentDragX - dragStartX;
		let dy = currentDragY - dragStartY;
		let distance = sqrt(dx * dx + dy * dy);
		if (distance > 10) {
			isDraggingFar = true;
		}
	}
}

function touchEnded() {
	if (isDragging) {
		let dx = currentDragX - dragStartX;
		let dy = currentDragY - dragStartY;
		let distance = sqrt(dx * dx + dy * dy);
		let spawnX = width/2;
		let spawnY = height/2;
		
		if (distance > 10) {
			// Milder speed mapping
			let minSpeed = 4;
			let maxSpeed = 12;
			let maxDrag = 140;
			let t = constrain(distance, 0, maxDrag) / maxDrag;
			let speed = lerp(minSpeed, maxSpeed, t);
			let normalizedDx = (dx / distance) * speed;
			let normalizedDy = (dy / distance) * speed;
			let ball = new Ball(spawnX, spawnY, 20);
			ball.vx = normalizedDx;
			ball.vy = normalizedDy;
			balls.push(ball);
		} else {
			// Random ball - always spawn in center
			let ball = new Ball(spawnX, spawnY, 20);
			balls.push(ball);
		}
		isDragging = false;
		isDraggingFar = false;
	}
}

// Mobile bouncer controls with touch areas
function drawMobileControls() {
	// Draw touch areas for bouncer controls (only on mobile)
	if (width < 800) { // Mobile detection
		// Left bouncer touch area (smaller and more specific)
		fill(255, 255, 255, 30);
		noStroke();
		rect(10, height - 100, 80, 80);
		fill(255, 255, 255, 150);
		textAlign(CENTER, CENTER);
		textSize(10);
		text("LEFT", 50, height - 80);
		text("UP/DOWN", 50, height - 60);
		
		// Right bouncer touch area (smaller and more specific)
		fill(255, 255, 255, 30);
		rect(width - 90, height - 100, 80, 80);
		fill(255, 255, 255, 150);
		text("RIGHT", width - 50, height - 80);
		text("UP/DOWN", width - 50, height - 60);
	}
}
