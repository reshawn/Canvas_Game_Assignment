//Create canvas and get context


var canvas = document.createElement("canvas");
canvas.width = 1000;
canvas.height = 700;
document.body.appendChild(canvas);
var ctx= canvas.getContext("2d");

//keyboard events
var keysDown = {};
var still = true; //condition for single frame when not moving, i.e not walking
var walking = false; //condition for walk animation in progress
var midAir = false;


addEventListener("keydown", function (e){
	keysDown[e.keyCode] = true;
	if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) { // so page doesn't move when arrow keys or space bar is pressed
        e.preventDefault();
    }
		
}, false); //false; default useCapture value

addEventListener("keyup", function (e){
	delete keysDown[e.keyCode];
	still = true;
}, false);



var gravity = 0.5;
var velocityY = 0;

var knight = {
	x: 0,
	y: 0,
	width: 64,
	height: 64,
	speed: 250,
	direction: 0,
	walkSet: 0,
	jumpSet: 0,
	walkFrame: 0,
	walkNumFrames: 6,
	walkDelay: 50,
	walkTimer: 0,
	airTimer: 0,
	jumpTime: 400,
	facing: "right",
	jSpeed: 200,
	airDirection: 0,
	onGround: true,
	jumping: false
};

//position knight
knight.x = (canvas.width / 2 - knight.width / 2);
knight.y = (canvas.height - 100) - (knight.height);

knightImageReady = false;
knightImage = new Image();
knightImage.onload = function () {
	knightImageReady = true;
};

knightImage.src = "images/combine_images.png";

var handleInput = function () {
	// Stop moving the playa
	knight.direction = 0;

	if (37 in keysDown){
		// if (walking==true) { // Left
		knight.direction = -1;
		still=false;
		knight.facing = "left";
		
		// }
	}


	if (39 in keysDown){
		// if (walking==true) { // right
		knight.direction = 1;
		still=false;
		knight.facing = "right";
		// }
	}

	if (38 in keysDown || 32 in keysDown && knight.onGround===true){ //up
		knight.jumping = true;
		// velocityY = -5;
		// gravity = 1;

	}



};


var update = function (elapsed) {

// 	WALKING ANIMATION **************************************************************************
	// Update hero animation
	if ((still == false)||(walking == true)){ 
		//walking==true so animation continues to completion of current cycle
		//so that frame isn't frozen midcycle by still condition
		knight.walkTimer += elapsed;
		walking = true;
		if (knight.walkTimer >= knight.walkDelay) {
			// Enough time has passed to update the animation frame
			knight.walkTimer = 0; // Reset the animation timer
			++knight.walkFrame;

			if (knight.walkFrame >= knight.walkNumFrames) {
				// We've reached the end of the animation frames; rewind
				knight.walkFrame = 0;
				walking = false;
			}
		}
	}

// JUMPING FRAME *******************************************************************************
	if ((knight.jumping === true)) {
		knight.airDirection = 1;
		knight.airTimer+= elapsed;
		console.log(knight.airTimer);
		if (knight.airTimer == knight.jumpTime)
			knight.airDirection = 0;
		if (knight.airTimer < knight.jumpTime)
			midAir = true;
		if (knight.airTimer > knight.jumpTime) {
			knight.airTimer = 0;
			knight.jumping = false;
			knight.airDirection = -1;
		}
		
		if (knight.facing === "right") // right jump
			knight.jumpSet = 0;
		if (knight.facing === "left") // left jump
			knight.jumpSet = 1;
	}

// WALKING FRAME SET SELECTION BY DIRECTION ****************************************************
	if (knight.direction == 1) {
		knight.walkSet = 0;
	}
	else if (knight.direction == -1){
		knight.walkSet = 1;
	}
	
// MOVEMENT OF CHARACTER ***********************************************************************
	if(knight.direction===-1){ 
		if (knight.x>0){  //edge detection
			var move = (knight.speed * (elapsed/1000));
			knight.x += Math.round(move * knight.direction);
		}
	}
	else if (knight.direction===1){ 
			if (knight.x<(canvas.width - knight.width)){ // edge detection
			var move = (knight.speed * (elapsed/1000));
			knight.x += Math.round(move * knight.direction);
			}
	}

	if (knight.y<((canvas.height-100)-knight.height)){
		knight.onGround = false;
		midAir = true;
	}

	else {
		knight.onGround = true;
		midAir = false;
	}
	if (knight.jumping === true || knight.onGround === false){
	// 	velocityY += gravity;
	// 	knight.y += velocityY;
	// 	console.log(velocityY);
	// 	if (knight.y > (canvas.height-100 - knight.height)){
	// 		console.log("u mad bro");
	// 		knight.y = canvas.height-100 - knight.height;
	// 		velocityY = 0;
	// 		gravity = 0;}


		var move = (knight.jSpeed*elapsed/1000);
		knight.y -= Math.round(move * knight.airDirection);
	}




};


var render = function () {
	ctx.fillStyle = "grey";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.fillStyle = "black";
	ctx.fillRect(0,(canvas.height-100),canvas.width,(canvas.height - 200));

	
	if (knightImageReady) {
		if (midAir === true ){
			var spriteX = ( 
			(2 * (knight.width * knight.walkNumFrames)) + // frame for sprite if knight.jumping
			(knight.jumpSet * knight.width)
		);
		}
		else {
		var spriteX = (
			(knight.walkSet * (knight.width * knight.walkNumFrames)) + // frame for sprite if walking/still
			(knight.walkFrame * knight.width)
		);
		}



		// Render image to canvas
		ctx.drawImage(
			knightImage,
			spriteX, 0, knight.width, knight.height,
			knight.x, knight.y, knight.width, knight.height
		);
		
	} else {
		// Image not ready. Draw a green box
		ctx.fillStyle = "green";
		ctx.fillRect(knight.x, knight.y, knight.width, knight.height);
	}
}

// Main game loop
var main = function () {

	// Calculate time since last frame
	var now = Date.now();
	var delta = (now - last);
	last = now;

	// Handle any user input
	handleInput();

	// Update game objects
	update(delta);

	// Render to the screen
	render();


};

// Start the main game loop!
var last = Date.now();
setInterval(main, 1);




// Notes: When direction is suddenly changed, the character, after a little while, 
// sticks for a little while