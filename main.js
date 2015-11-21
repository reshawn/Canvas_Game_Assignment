//Create canvas and get context

console.log("success");
var canvas = document.createElement("canvas");
canvas.width = 1000;
canvas.height = 700;
document.body.appendChild(canvas);
var ctx= canvas.getContext("2d");

//keyboard events
var keysDown = {};
var still = true; //condition for single frame when not moving
var walking = false; //condition for animation in progress

addEventListener("keydown", function (e){
	keysDown[e.keyCode] = true;
	still = false;

	
	
}, false); //false; default useCapture value

addEventListener("keyup", function (e){
	delete keysDown[e.keyCode];
	still = true;
}, false);


var knight = {
	x: 0,
	y: 0,
	width: 64,
	height: 64,
	speed: 250,
	direction: 0,
	walkSet: 0,
	walkFrame: 0,
	walkNumFrames: 6,
	walkDelay: 50,
	walkTimer: 0
};

//position knight
knight.x = (canvas.width / 2 - knight.width / 2);
knight.y = (canvas.height - 200) - (knight.height);

knightImageReady = false;
knightImage = new Image();
knightImage.onload = function () {
	knightImageReady = true;
};

knightImage.src = "combine_images.png";

var handleInput = function () {
	// Stop moving the playa
	knight.direction = 0;

	if (37 in keysDown){
		if (walking==true) { // Left
		knight.direction = -1;
		}
	}


	if (39 in keysDown){
		if (walking==true) { // right
		knight.direction = 1;
		}
	}


};


var update = function (elapsed) {

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

	if (knight.direction == 1) {
		knight.walkSet = 0;
	}
	else if (knight.direction == -1){
		knight.walkSet = 1;
	}
	
	// Edge detection
	if(knight.direction===-1){
		if (knight.x>0){
			var move = (knight.speed * (elapsed/1000));
			knight.x += Math.round(move * knight.direction);
		}
	}
	else if (knight.direction===1){ 
			if (knight.x<(canvas.width - knight.width)){
			var move = (knight.speed * (elapsed/1000));
			knight.x += Math.round(move * knight.direction);
			}
	}



};


var render = function () {
	ctx.fillStyle = "grey";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.fillStyle = "black";
	ctx.fillRect(0,(canvas.height-200),canvas.width,(canvas.height - 200));

	if (knightImageReady) {
		var spriteX = (
			(knight.walkSet * (knight.width * knight.walkNumFrames)) +
			(knight.walkFrame * knight.width)
		);

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