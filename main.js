//Create canvas and get context


var canvas = document.createElement("canvas");
canvas.width = 1000;
canvas.height = 700;
document.body.appendChild(canvas);
var ctx= canvas.getContext("2d");

//keyboard events
var keysDown = {};


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


var still = true; //condition for single frame when not moving, i.e not walking
var walking = false; //condition for walk animation in progress
var midAir = false;
var gravity = 0.5;
var velocityY = 0;

var knight = {
	x: 0,
	y: 0,
	width: 64,
	height: 64,
	speed: 250,
	direction: 0, //direction for movement
	walkSet: 0,
	jumpSet: 0,
	walkFrame: 0,
	walkNumFrames: 6,
	animDelay: 50,
	walkTimer: 0,
	facing: "right", // store direction being faced, needed as .direction is cleared when still
	onGround: true,
	jumping: false,
	isAttacking: false,
	attackTimer: 0,
	attackFrame: 0,
	attackNumFrames: 5,
	attackSet: 0
};

//position knight
knight.x = (canvas.width / 2 - knight.width / 2);
knight.y = (canvas.height - 100) - (knight.height);

//knight image sprite sheet
var knightImageReady = false;
var knightImage = new Image();
knightImage.onload = function () {
	knightImageReady = true;
};

knightImage.src = "images/combine_images.png";

var timerDigits = {
	ones: 0,
	tens: 0,
	hundreds: 0
};


var enemies = [];

var createEnemy = function(){
    var enemy = {
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
        image: new Image(),
        imageReady: false,
        update: function(elapsed){
            if(knight.x > this.x){
                //console.log("Knight is on the right");
                this.x += this.speed * (elapsed/1000);
            }else{//knight.x < this.x
                //console.log("Knight is on the left");
                this.x -= this.speed * (elapsed/1000);
            }
        },
        draw: function(context){
            context.drawImage(this.image, 0, 0, this.width, this.height,
                this.x, this.y, this.width, this.height);
        }
    };
    enemy.image.onload = function(){
        enemy.imageReady = true;
    }
    enemy.image.src = "images/combine_images.png";
    return enemy;

    
} 

var handleInput = function () {
	// Stop moving the playa
	knight.direction = 0;

	if (37 in keysDown){
		knight.direction = -1;
		still=false;
		knight.facing = "left";
		
		// }
	}


	if (39 in keysDown){
		knight.direction = 1;
		still=false;
		knight.facing = "right";
		// }
	}

	if (38 in keysDown && knight.onGround === true || 32 in keysDown && knight.onGround === true){ //up
		knight.jumping = true;
		velocityY = -12;
		gravity = 0.5;

	}

	if ((90 in keysDown)&&(knight.onGround === true)){
		knight.isAttacking = true;
		still = false;
	}



};


var update = function (elapsed) {

// 	WALKING ANIMATION **************************************************************************
	// Update hero animation
	if ((still === false)||(walking === true)){ 
		//walking===true so animation continues to completion of current cycle
		//so that frame isn't frozen midcycle by still condition
		knight.walkTimer += elapsed;
		walking = true;
		if (knight.walkTimer >= knight.animDelay) {
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


// 	ATTACKING ANIMATION **************************************************************************
	// Update hero animation
	if (knight.isAttacking === true){ 
		//walking===true so animation continues to completion of current cycle
		//so that frame isn't frozen midcycle by still condition
		knight.attackTimer += elapsed;
		if (knight.attackTimer >= knight.animDelay) {
			// Enough time has passed to update the animation frame
			knight.attackTimer = 0; // Reset the animation timer
			++knight.attackFrame;

			if (knight.attackFrame >= knight.attackNumFrames) {
				// We've reached the end of the animation frames; rewind
				knight.attackFrame = 0;
				knight.isAttacking = false;
			}
		}
	}



// JUMPING FRAME *******************************************************************************
	if ((knight.jumping === true)) {
		
		if (knight.facing === "right") // right jump
			knight.jumpSet = 0;
		if (knight.facing === "left") // left jump
			knight.jumpSet = 1;
	}

// WALKING FRAME SET SELECTION BY DIRECTION ****************************************************
	if (knight.facing === "right") {
		knight.walkSet = 0;
	}
	else if (knight.facing === "left"){
		knight.walkSet = 1;
	}
	

	// ATTACKIING FRAME SET SELECTION BY DIRECTION ****************************************************
	if (knight.facing === "right") {
		knight.attackSet = 1;
	}
	else if (knight.facing === "left"){
		knight.attackSet = 0;
	}
	

// MOVEMENT FRAME OF CHARACTER ***********************************************************************
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
		velocityY += gravity;
		knight.y += velocityY;
		if (knight.y > (canvas.height-100 - knight.height)){
			console.log("u mad bro");
			knight.y = canvas.height-100 - knight.height;
			velocityY = 0;
			gravity = 0;}
	}
    
    //Add enemy
    if(enemies.length < 1){
        var e = createEnemy();
        e.x = Math.random() * canvas.width;
        e.y = canvas.height - 100 - e.height;
        enemies.push(e);
    }
    
    for(var i = 0; i < enemies.length; i++){
        enemies[i].update(elapsed);
    }


    // TIMER FRAME UPDATE***********************************************************

        var timerSeconds = (Math.floor(timer/1000));
        var timerNumDigits = Math.ceil(Math.log(timerSeconds + 1) / Math.LN10); //to get the "length" of the timerSeconds variable

        // each digit value is stored in a separate variable of the timer object
        // in different cases of values of timerSeconds such as 1, 20, 125
        if (timerNumDigits === 1){

        	timerDigits.ones = timerSeconds;
        	timerDigits.tens = 0;
        	timerDigits.hundreds = 0;
        }
        else if (timerNumDigits === 2){
        	timerDigits.ones = timerSeconds%10;
        	timerDigits.tens = Math.floor(timerSeconds/10);
        	timerDigits.hundreds = 0;
        }
        else if (timerNumDigits === 3){
        	var conversionStep = timerSeconds%100;
        	timerDigits.ones = conversionStep%10;
        	timerDigits.tens = Math.floor(conversionStep/10);
        	timerDigits.hundreds = Math.floor(timerSeconds/100);
        }
        else {
        	timerDigits.ones = 9;
        	timerDigits.tens = 9;
        	timerDigits.hundreds = 9;
        }
};


var render = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "grey";
	ctx.fillRect(0,0,canvas.width,canvas.height-100);
	ctx.fillStyle = "black";
	ctx.fillRect(0,(canvas.height-100),canvas.width,100);

	
	// KNIGHT IMAGE SPRITE X CALCULATIONS*************************************************************************************

	if (knightImageReady) {
		//console.log(midAir);
        var spriteX, effectiveX = knight.x, effectiveWidth = knight.width;
		if (midAir === true ){
			spriteX = ( 
			(2 * (effectiveWidth * knight.walkNumFrames)) + // frame for sprite if knight.jumping
			(knight.jumpSet * effectiveWidth)
            );
		}
		else if (knight.isAttacking === true){  // "else if" : only if the char is not in the air can he slash; less problems this way...
			// images are wider for attacking frames and the knight.width values must be adjusted accordingly
			if (knight.attackFrame <= 1){
				effectiveWidth = 90; // set width to 90 pixels for the first two frames of attacking; sword behind char at angle
				spriteX = (
				(2 * (knight.width * knight.walkNumFrames)) + (2 * knight.width) + //move past frames for jumping and walking
				(knight.attackSet * (531)) + //1 if second set of frames is needed 0 if first is needed
				(knight.attackFrame * effectiveWidth)
				);
			}
			if (knight.attackFrame >1) {
				effectiveWidth = 117; // set width to 117 pixels for other frames of attacking; sword in front for contact
				// this calculation moves to the frames for the 117 px section of attack by first adding the 
				// the walking frames and jumping frames then catering for the possible different attack sets
				// then adding 180 to cater for the first two 90px frames of attacking and lastly
				// adjusting the attackFrame count by subtracting 2 then multiplying by the current knight.width

				spriteX = (
				(2 * (knight.width * knight.walkNumFrames)) + (2 * knight.width) + //move past frames for jumping and walking
				(knight.attackSet * (531)) + 180 + //1 if second set of frames is needed 0 if first is needed
				((knight.attackFrame -2) * effectiveWidth)
                );

			}
		}
		else {
			spriteX = (
			(knight.walkSet * (knight.width * knight.walkNumFrames)) + // frame for sprite if walking/still
			(knight.walkFrame * knight.width) // in the case of still, the animation for walking would be complete and therefore reset
            ); //to the first frame, i.e the "still frame"
		}
	// END OF KNIGHT IMAGE SPRITE X *********************************************************************************************


		// Change the position to draw from so as to account for the slash sprite being wider than the regular sprite
		if ((knight.attackSet===0)&&(knight.attackFrame>1)){ 
            // adjust x coordinate to cater for the sword being in front of the character in certain frames while facing left
			effectiveX -= 53;
		}
		else if ((knight.attackSet===1)&&(knight.attackFrame<=1)&&(knight.isAttacking==true)){ 
            // adjust x coordinate to cater for the sword being behind the character in certain frames while facing right
			effectiveX -= 26;
		}
       


        // Render image to canvas
        ctx.drawImage(
            knightImage,
            spriteX, 0, effectiveWidth, knight.height,
            effectiveX, knight.y, effectiveWidth, knight.height
        );

        // Timer image rendering
        	ctx.font = "30px Impact";

        	ctx.fillText(timerDigits.hundreds.toString(), (((canvas.width/2) - 30)), 40);
        	ctx.fillText(timerDigits.tens.toString(), (((canvas.width/2) - 30) + 20), 40);
        	ctx.fillText(timerDigits.ones.toString(), (((canvas.width/2) - 30) + 40), 40);

        
		
	 } else {
		// Image not ready. Draw a green box
		ctx.fillStyle = "green";
		ctx.fillRect(knight.x, knight.y, knight.width, knight.height);
	}
    
    for(var i = 0; i < enemies.length; i++){
        enemies[i].draw(ctx);
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
setInterval(main, 1000/60);

//COUNT UP TIMER
var timer = 0;


var lastSec = Date.now();
var myVar = setInterval(myTimer ,1000);

 function myTimer() {
    var now = Date.now();
    var delta = now - lastSec;
    lastSec = now;
    timer += delta;
console.log(Math.floor(timer/1000));
}timer