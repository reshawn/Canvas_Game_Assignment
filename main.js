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
	knight.still = true;
}, false);



//fixed jumping physics variables
var gravity = 0.5;
var velocityY = 0;
//initialize main menu variables
var isGameRunning = false;
var whichHover = "start";
var isPause = false;
//pause screen
var pause = new Image();
pause.src = "images/pause.png";
//instructions screen
var isOnInstr = false;
//game over
var isGameover = false;


var death = { //seperate object made for death for reusability of the animation
	timer: 0,
	numFrames: 4,
	deathFrame: 0,
	image: new Image(),
	imageReady: false,
};

death.image.onload = function () {
	knight.imageReady = true;
};
death.image.src = "images/death.png";

heart= new Image();
heart.src = "images/heart.png";

var knight = {
	x: 0,
	y: 0,
	width: 64,
	height: 64,
	speed: 250,
	direction: 0, //direction for movement
    still: true, //condition for single frame when not moving, i.e not walking
    walking: false, //condition for walk animation in progress
	walkSet: 0,
	jumpSet: 0,
	walkFrame: 0,
	walkNumFrames: 6,
	animDelay: 50,
	walkTimer: 0,
	facing: "right", // store direction being faced, needed as .direction is cleared when still
	onGround: true,
    midAir: false,
	jumping: false,
	isAttacking: false,
	attackTimer: 0,
	attackFrame: 0,
	attackNumFrames: 5,
	attackSet: 0,
	isAlive: true,
    health: 5,
    isHurt: false,
    hurtTimer: 0,
    hurtDelay: 100,
    image: new Image(), //knight image sprite sheet
    imageReady: false,
    update: function(elapsed){
        // 	WALKING ANIMATION **************************************************************************
        // Update hero animation
        if (!this.still || this.walking){ 
            //walking===true so animation continues to completion of current cycle
            //so that frame isn't frozen midcycle by still condition
            knight.walkTimer += elapsed;
            this.walking = true;
            if (knight.walkTimer >= knight.animDelay) {
                // Enough time has passed to update the animation frame
                knight.walkTimer = 0; // Reset the animation timer
                ++knight.walkFrame;

                if (knight.walkFrame >= knight.walkNumFrames) {
                    // We've reached the end of the animation frames; rewind
                    knight.walkFrame = 0;
                    this.walking = false;
                }
            }
        }


    // 	ATTACKING ANIMATION **************************************************************************
        // Update hero animation
        if (this.isAttacking){ 
            //walking===true so animation continues to completion of current cycle
            //so that frame isn't frozen midcycle by still condition
            this.attackTimer += elapsed;
            if (this.attackTimer >= this.animDelay) {
                // Enough time has passed to update the animation frame
                this.attackTimer = 0; // Reset the animation timer
                ++this.attackFrame;

                if (this.attackFrame >= this.attackNumFrames) {
                    // We've reached the end of the animation frames; rewind
                    this.attackFrame = 0;
                    this.isAttacking = false;
                }
            }
        }

    // KNIGHT HURT FRAME ****************************************************************************
      if (knight.isHurt){
      	this.hurtTimer += elapsed;
      	this.direction = 0;
            if (this.hurtTimer >= this.hurtDelay) {
                //hurt frame has been showed enough
                this.hurtTimer = 0; // Reset the animation timer
                knight.isHurt = false;
            }
      }
    //KNIGHT DEATH ANIMATION ***********************************************************************
      if (this.health === 0){
      	death.timer += elapsed;
            if (death.timer >= this.animDelay) {
            	console.log(death.deathFrame);
                // Enough time has passed to update the animation frame
                death.timer = 0; // Reset the animation timer
                ++death.deathFrame;

                if (death.deathFrame >= death.numFrames) {
                    // We've reached the end of the animation frames; rewind
                    this.isAlive = false;
                }
            }
      }
    // JUMPING FRAME *******************************************************************************
        if (this.jumping) {
            if (this.facing === "right") // right jump
                this.jumpSet = 0;
            if (this.facing === "left") // left jump
                this.jumpSet = 1;
        }

    // WALKING FRAME SET SELECTION BY DIRECTION ****************************************************
        if (this.facing === "right") {
            this.walkSet = 0;
        }
        else if (this.facing === "left"){
            this.walkSet = 1;
        }


        // ATTACKIING FRAME SET SELECTION BY DIRECTION ****************************************************
        if (this.facing === "right") {
            this.attackSet = 1;
        }
        else if (this.facing === "left"){
            this.attackSet = 0;
        }


    // MOVEMENT FRAME OF CHARACTER ***********************************************************************
        if(this.direction===-1){ 
            if (this.x>0){  //edge detection
                var move = (this.speed * (elapsed/1000));
                this.x += Math.round(move * this.direction);
            }
        }
        else if (this.direction===1){ 
            if (this.x<(canvas.width - this.width)){ // edge detection
                var move = (this.speed * (elapsed/1000));
                this.x += Math.round(move * this.direction);
            }
        }

        if (this.y<((canvas.height-100)-this.height)){
            this.onGround = false;
            this.midAir = true;
        }

        else {
            this.onGround = true;
            this.midAir = false;
        }


        if (this.jumping || !this.onGround){	
            velocityY += gravity;
            this.y += velocityY;
            if (this.y > (canvas.height-100 - this.height)){
                console.log("u mad bro");
                this.y = canvas.height-100 - this.height;
                velocityY = 0;
                gravity = 0;
            }
        }
    },
    draw: function(context){
        if (this.imageReady) {
            //console.log(this.midAir);
            var spriteX, effectiveX = this.x, effectiveWidth = this.width;
            if (this.isHurt){
            	if (this.facing === "right")
            	spriteX = 2086 - (64*2);
            	else spriteX = 2086 - 64;
            }
            else if (this.midAir){
                spriteX = ( 
                (2 * (effectiveWidth * this.walkNumFrames)) + // frame for sprite if knight.jumping
                (this.jumpSet * effectiveWidth)
                );
            }
            else if (this.isAttacking){  // "else if" : only if the char is not in the air can he slash; less problems this way...
                // images are wider for attacking frames and the knight.width values must be adjusted accordingly
                if (this.attackFrame <= 1){
                    effectiveWidth = 90; // set width to 90 pixels for the first two frames of attacking; sword behind char at angle
                    spriteX = (
                    (2 * (this.width * this.walkNumFrames)) + (2 * this.width) + //move past frames for jumping and walking
                    (this.attackSet * (531)) + //1 if second set of frames is needed 0 if first is needed
                    (this.attackFrame * effectiveWidth)
                    );
                }
                if (this.attackFrame >1) {
                    effectiveWidth = 117; // set width to 117 pixels for other frames of attacking; sword in front for contact
                    // this calculation moves to the frames for the 117 px section of attack by first adding the 
                    // the walking frames and jumping frames then catering for the possible different attack sets
                    // then adding 180 to cater for the first two 90px frames of attacking and lastly
                    // adjusting the attackFrame count by subtracting 2 then multiplying by the current knight.width

                    spriteX = (
                    (2 * (this.width * this.walkNumFrames)) + (2 * this.width) + //move past frames for jumping and walking
                    (this.attackSet * (531)) + 180 + //1 if second set of frames is needed 0 if first is needed
                    ((this.attackFrame -2) * effectiveWidth)
                    );

                }
            }
            else {
                spriteX = (
                (this.walkSet * (this.width * this.walkNumFrames)) + // frame for sprite if walking/still
                (this.walkFrame * this.width) // in the case of still, the animation for walking would be complete and therefore reset
                ); //to the first frame, i.e the "still frame"
            }
        // END OF KNIGHT IMAGE SPRITE X *********************************************************************************************


            // Change the position to draw from so as to account for the slash sprite being wider than the regular sprite
            if ((this.attackSet===0)&&(this.attackFrame>1)){ 
                // adjust x coordinate to cater for the sword being in front of the character in certain frames while facing left
                effectiveX -= 53;
            }
            else if ((this.attackSet===1)&&(this.attackFrame<=1)&& this.isAttacking){ 
                // adjust x coordinate to cater for the sword being behind the character in certain frames while facing right
                effectiveX -= 26;
            }


            // Render image to canvas
            if (this.health > 0) {
            ctx.drawImage(
                this.image,
                spriteX, 0, effectiveWidth, this.height,
                effectiveX, this.y, effectiveWidth, this.height
            );
        	}
        	if (this.health === 0) {
        		spriteX = (64*death.deathFrame);

        		ctx.drawImage(
                death.image,
                spriteX, 0, effectiveWidth, this.height,
                effectiveX, this.y, effectiveWidth, this.height
            );
        	}

         } else {
            // Image not ready. Draw a green box
            ctx.fillStyle = "green";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
};

//position knight
knight.x = (canvas.width / 2 - knight.width / 2);
knight.y = (canvas.height - 100) - (knight.height);

knight.image.onload = function () {
	knight.imageReady = true;
};
knight.image.src = "images/combine_images.png";

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
        width: 35,
        height: 42,
        speed: 125,
        direction: 0,
        walkSet: 0,
        walkFrame: 0,
        walkNumFrames: 4,
        walkTimer: 0,
        animDelay: 50,
        attackFrame: 0,
        attackNumFrames: 2,
        attackTimer: 0,
        image: new Image(),
        imageReady: false,
        alive: true,
        health: 1,
        lastAttack: 500,
        inAttackingRange: false,
        attackSet: 0,
        update: function(elapsed){  
            var distanceBetween = this.x - knight.x;
            this.lastAttack += elapsed;
            //If it > -35 that means that this enemy is being drawn next to the knight on the left
            //If it < 64 that means that this enemy is being drawn next to the kniht on the right
            if(distanceBetween < -35 || distanceBetween > 64){//If not in attacking range then move closer
                this.inAttackingRange = false;
                this.walkTimer += elapsed;
                if (this.walkTimer >= this.animDelay) {
                    // Enough time has passed to update the animation frame
                    this.walkTimer = 0; // Reset the animation timer
                    this.walkFrame++;

                    if (this.walkFrame >= this.walkNumFrames) {
                        // We've reached the end of the animation frames; rewind
                        this.walkFrame = 0;
                    }
                }
               
                
                var distance = Math.round(this.speed * (elapsed/1000));
                if(knight.x > this.x){ //Knight is on the right
                    this.x += distance;
                    this.walkSet = 0
                }else if(knight.x+knight.width < this.x){// Knight is on the left
                    this.x -= distance;
                    this.walkSet = 1;
                }
            }else{
                this.walkFrame = 0;//If close enough set the frame to the beginning
                this.inAttackingRange = true;
                this.attackSet = distanceBetween < 0 ? 0 : 1; 
                if(this.lastAttack >= 500 && knight.onGround){// in attacking range and time since last attack is 500ms
                    this.attackTimer += elapsed;
                    if(this.attackTimer >= this.animDelay){
                        this.attackTimer = 0;
                        this.attackFrame++;
                        
                        if(this.attackFrame >= this.attackNumFrames){//Reset to the beginning frame
                            this.attackFrame = 0;
                            knight.health -= 1;
                            knight.isHurt = true;
                            this.lastAttack = 0;
                        }

                    }                    
                }
            }
        },
        draw: function(context){
        	if(this.imageReady){
                var spriteX;
                if(!this.inAttackingRange || !knight.onGround)
                    spriteX =  (this.walkSet * (this.width * this.walkNumFrames)) + (this.walkFrame * this.width); 
                else
                    spriteX = (2 * this.walkNumFrames * this.width) + (this.attackSet * 70) + (this.attackFrame * this.width);
                
        		context.drawImage(this.image, spriteX, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        	}else{
        		context.fillStyle = "green";
        		context.fillRect(this.x, this.y, this.width, this.height);
        	}
        }        
    };
    enemy.image.onload = function(){
        enemy.imageReady = true;
    }
    enemy.image.src = "images/enemy.png";
    return enemy;
}

var boss = {
	x: 0,
	y: 0,
	width: 128,
	height: 128,
	speed: 200,
	direction: 0,
	walkSet: 0,
	jumpSet: 0,
	walkFrame: 0,
	walkNumFrames: 6,
	walkDelay: 50,
	walkTimer: 0,
    image: new Image(),
    imageReady: false,
	available: false,
	health: 10,
	lastAttack: 500,
	update: function (elapsed) {
		if(knight.x > this.x){
            //console.log("Knight is on the right");
            this.x += Math.round(this.speed * (elapsed/1000));
            console.log(knight.x, this.x)
        }else if(knight.x < this.x){//knight.x < this.x
            //console.log("Knight is on the left");
            this.x -= Math.round(this.speed * (elapsed/1000));
        }
        var distance = Math.abs(this.x - knight.x);

        this.lastAttack += elapsed;
        if(distance < 32 && this.lastAttack >= 500 && knight.onGround){
        	console.log("boss can attack");
        	knight.health -= 1;
        	this.lastAttack = 0;
        }
	},
	draw: function(context){
		if(this.imageReady){
    		context.drawImage(this.image, 0, 0, this.width, this.height,
            this.x, this.y, this.width, this.height);
    	}else{
    		context.fillStyle = "black";
    		context.fillRect(this.x, this.y, this.width, this.height);
    	}
	} 
};
boss.y = (canvas.height - 100) - (boss.height);
boss.image.onload = function(){
	boss.imageReady = true;
}
boss.image.src = "http://ih0.redbubble.net/image.120554593.5192/flat,800x800,075,f.u2.jpg"; //charmander is boss``


var handleInput = function () {
	// Stop moving the playa
	knight.direction = 0;

	if (37 in keysDown){
		knight.direction = -1;
		knight.still=false;
		knight.facing = "left";
	}

	if (39 in keysDown){
		knight.direction = 1;
		knight.still=false;
		knight.facing = "right";
	}

	if (32 in keysDown && knight.onGround){ //space
		knight.jumping = true;
		velocityY = -12;
		gravity = 0.5;

	}

	if (90 in keysDown && knight.onGround){
		knight.isAttacking = true;
		knight.still = false;
	}

	if (80 in keysDown){ // P for pause
		isPause = true;	
	}
	if (85 in keysDown){ // U for unpause; different keys used because 
		// isPause would switch from paused to unpaused 60 times per second when p is pressed so there's no control
		// different keys allow for control
		isPause = false;
	}

	
};


var update = function (elapsed) {
    
    if(!knight.isAlive){
		isGameRunning = false; //knight dead so stop game
		isGameover = true;
		
	}
    
    knight.update(elapsed);
    
    //Add enemy
    if(enemies.length < 1){
        var e = createEnemy();
        e.x = Math.round(Math.random() * canvas.width);
        e.y = canvas.height - 100 - e.height;
        enemies.push(e);
    }
    
    boss.available = enemies.length > 5; //boss spawns if more than five enemies
    for(var i = 0; i < enemies.length; i++){
    	boss.available = boss.available && !enemies[i].alive; //boss spawns if the more than five have been killed
        if(enemies[i].alive) enemies[i].update(elapsed); // if enemy alive then update enemy
    }
    
    if(boss.available){
    	boss.update(elapsed);
    }

    // TIMER FRAME UPDATE***********************************************************

    var timerSeconds = (Math.floor(timer/1000));
    var timerNumDigits = Math.ceil(Math.log(timerSeconds + 1) / Math.LN10); //to get the "length" of the timerSeconds variable

    // each digit value is stored in a separate variable of the timer object
    // in different cases of values of timerSeconds such as 1, 20, 125
    if (timerNumDigits <= 1){
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

	knight.draw(ctx);
    
    // Timer image rendering
    ctx.font = "30px Impact";

    for (var h = 0; h < knight.health; h++){
    	ctx.drawImage(heart, 0, 0, 22, 18, 20+(20*h), 20, 22, 18);
    }

    ctx.fillText(timerDigits.hundreds.toString(), (((canvas.width/2) - 30)), 40);
    ctx.fillText(timerDigits.tens.toString(), (((canvas.width/2) - 30) + 20), 40);
    ctx.fillText(timerDigits.ones.toString(), (((canvas.width/2) - 30) + 40), 40);
    
    for(var i = 0; i < enemies.length; i++){
        if(enemies[i].alive) enemies[i].draw(ctx);
    }
    
    if(boss.available){
    	boss.draw(ctx);
    }
}

var mainMenu = function () {
	if (isGameover) // if game is over then run game over instead of main menu
		gameover();

	else {

		var mainImages = {
			startScreen: new Image(),
			unselectedStart: new Image(),
			selectedStart: new Image(),
			unselectedHowTo: new Image(),
			selectedHowTo: new Image(),
			pause: new Image(),

		};

		mainImages.startScreen.src = "images/mainMenu.png";
		mainImages.unselectedStart.src = "images/unselectedStart.png";
		mainImages.selectedStart.src = "images/selectedStart.png";
		mainImages.unselectedHowTo.src = "images/unselectedHowTo.png";
		mainImages.selectedHowTo.src = "images/selectedHowTo.png";
		// mainImages.pause.src = "images/pause.png";

		ctx.drawImage(mainImages.startScreen, 0, 0, 1000, 700);

		var hoverStart = function() { // white border around start button or "hover cursor" over start button
		ctx.drawImage(mainImages.selectedStart, 100, 350, 200, 70);
		ctx.drawImage(mainImages.unselectedHowTo, 100, 450, 200, 70);
		}

		var hoverHowTo = function() { // white border around how to button or "hover cursor" over how to button
			ctx.drawImage(mainImages.unselectedStart, 100, 350, 200, 70);
			ctx.drawImage(mainImages.selectedHowTo, 100, 450, 200, 70);
		}

			if (whichHover === "start")
				hoverStart(); // draw selected button for start to simulate start
			else if (whichHover === "howTo")
				hoverHowTo();

			// only start game is enter is pressed while hovering over start
			if (13 in keysDown && whichHover === "start"){ //select start
				resetGame(); // reset in case game was being played before
				isGameRunning = true;
			}
			

			//for the instructions screen, due to the fact that the Enter key is used for entrance and exit, the 13 value remains in the
			// keysDown array not allowing the user to control entrance and exit properly
			// therefore the three instr variables and the two conditional setTimeouts were introduced
			// this method attempts to allow for the user to enter and exit by pressing the enter key after a 100ms period on each
			//but reentry still has issues even though it works in some circumstances

			if (13 in keysDown && whichHover === "howTo" || isOnInstr){
				instructions();
			}
			
			// if hovering over start and down is pressed hover over how to
			if (40 in keysDown && whichHover === "start")
				whichHover = "howTo"; 
			// if hovering over howTo and up is pressed hover over start
			if (38 in keysDown && whichHover === "howTo")
				whichHover = "start";
	}
}





var instructions = function() { 

	var instruc = new Image();
	instruc.src = "images/instructions.png";

	ctx.drawImage(instruc, 0, 0, 1000, 700);

	isOnInstr = true;

	if(27 in keysDown) //Esc to go back to main menu
		isOnInstr = false;

}

var pauseScreen = function(){
	ctx.drawImage(pause, (canvas.width/2)-(290/2), (canvas.height/2)-50, 290, 100);
}

function gameover(){
	var gameoverScreen = new Image();

	gameoverScreen.src = "images/gameover_test.png";

	ctx.drawImage(gameoverScreen, 0, 0, 1000, 700);

	if (27 in keysDown) //Esc to go back to main menu
		isGameover = false; // enter the 'else' in order to bring up main menu
	if (13 in keysDown){ // enter to try again
		resetGame(); // reset immediately
		isGameover = false; 
		isGameRunning = true; //immeduately go back to game
	}

}

function resetGame() {
	// reset knight variables
	knight.x = (canvas.width / 2 - knight.width / 2);
	knight.y = (canvas.height - 100) - (knight.height);	
	knight.facing = "right";
	knight.health = 5;
	knight.isAlive = true;
	// reset timer
	timer = 0;
	//reset enemies
	enemies = [];


}

// Main game loop
var main = function () {

	// Calculate time since last frame
	var now = Date.now();
	var delta = (now - last);
	last = now;
	if(!isGameRunning)
		mainMenu(); //only run main menu if start was not hit; for now ;) 

	handleInput();
	// Update game objects
	if (isGameRunning === true && !isPause){ //only run game loop if start was hit and the game is unpaused
		update(delta);

		// Render to the screen
		render();
	}
	else if (isGameRunning && isPause)
	 pauseScreen();
};

// Start the main game loop!
var last = Date.now();


		
	
var interval = setInterval(main, 1000/60);



//COUNT UP TIMER
var timer = 0;


var lastSec = Date.now();
var myVar = setInterval(myTimer ,1000);

 function myTimer() {
 	
     var now = Date.now();
     var delta = now - lastSec;
     lastSec = now;
     if(!isPause && isGameRunning){ //only update timer if unpaused; so now and lastSec continue changing 
     //even when paused so delta remains 1sec after unpause and only if the game is actually running (not in menus)
	     timer += delta;
 	 }
}