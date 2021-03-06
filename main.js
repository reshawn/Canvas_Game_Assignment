//Create canvas and get context
var canvas = document.createElement("canvas");
canvas.id = 'canvas';
canvas.width = 1000;
canvas.height = 700;
document.body.appendChild(canvas);
var ctx = canvas.getContext("2d");

//keyboard events
var keysDown = {};

//Mock Keyboard Events using the Gamepad API
var gamepadInput = {
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
    11: false,
    12: false,
    13: false,
    14: false,
    15: false
};
var pollGamepad = function(){
    var gamepad = navigator.getGamepads()[0];
    if(!gamepad || !gamepad.buttons) return;
    var buttons = gamepad.buttons;
    for(var i = 0; i < buttons.length; i++){
        if(gamepadInput[i] !== buttons[i].pressed){ //The value is different from the last state change
            gamepadInput[i] = buttons[i].pressed; //Change to new value
            var key;
            switch(i){
                case 12: //Up
                    key = 38;
                    break;
                case 13: //Down
                    key = 40;
                    break;
                case 14: //Left
                    key = 37;
                    break;
                case 15: //Right
                    key = 39;
                    break;
                case 0: //A
                    key = 32; //Space
                    break;
                case 1: //B
                    key = 90; //Z
                    break;
                case 4: //Left Bumper
                    key = 80; //P
                    break;
                case 5: //Right Bumper
                    key = 85; //U
                    break;
                case 8:
                    key = 27; //ESC
                    break;
                case 9: //Start
                    key = 13; //Enter
                    break; 
                default:
                    return;
            }
            //Fake a keyboard event being fired
            var eventType = buttons[i].pressed ? "keydown" : "keyup";
            var event = document.createEvent("KeyboardEvent");
            Object.defineProperty(event, "keyCode", {
                get : function() {
                    return this.keyCodeVal;
                }
            });
            Object.defineProperty(event, "which", {
                get : function() {
                    return this.keyCodeVal;
                }
            });
            var initMethod = typeof event.initKeyboardEvent !== "undefined" ? "initKeyboardEvent" : "initKeyEvent";
            event[initMethod](eventType, true, true, window, false, false, false, false, key, 0);
            event.keyCodeVal = key;
            window.dispatchEvent(event);
        }
    }
}

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) { // so page doesn't move when arrow keys or space bar is pressed
        e.preventDefault();
    }
}, false); //false; default useCapture value

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
    knight.still = true;
}, false);

canvas.addEventListener("click", function (e) {
    //Use offsetX, offsetY or layerX, layerY to check where the user clicked on the canvas
    var x = e.offsetX,
        y = e.offsetY;
    if (!isGameRunning && (x >= 100 && x <= 300)) { //Main Menu
        if (y >= 350 && y <= 420) { //Click Start
            resetGame();
            isGameRunning = true;
        } else if (y >= 450 && y <= 520) { //Click Instructions
            isOnInstr = true;
        } else if (y >= 555 && y <= 625) { //Click Story
            isOnStory = true;
        }
    } else if (isGameover && (x >= 440 && x <= 540)) { //Game Over Screen
        if (y >= 430 && y <= 490) { //Click Try Again
            resetGame();
            isGameover = false;
            isGameRunning = true;
        } else if (y >= 510 && y <= 570) { //Click Main Menu
            isGameover = false;
            whichHover = "start";
        }
    }
}, false);

//Copy the functionality of one object and make a new one with extra properties
function extend(type, props) {
    var newType = {};
    for (var prop in type){
        newType[prop] = type[prop]
    }
    for(var prop in props) {
        newType[prop] = props[prop];
    }
    return newType;
}

//jumping physics variables
var gravity = 0.5;
var velocityY = 0;
//initialize main menu variables
var isGameRunning = false;
var whichHover = "start"; //valid options: start, howTo, tryAgain, mainMenu
var isPause = false;
//main menu
var menuImages = {
    startSelected: new Image(),
    howToSelected: new Image(),
    storySelected: new Image(),
};
menuImages.startSelected.src = "images/menuStartSelected.png"
menuImages.howToSelected.src = "images/menuHowToSelected.png";
menuImages.storySelected.src = "images/menuStorySelected.png";
//pause screen
var pause = new Image();
pause.src = "images/pause.png";
//instructions screen
var instruc = new Image();
instruc.src = "images/instructions.png";
var isOnInstr = false;
//story screen
var storyScreen = new Image();
storyScreen.src = "images/story.png";
var isOnStory = false;
//game over
var gameoverImages = {
    tryAgainSelected: new Image(),
    mainMenuSelecetd: new Image()
}
gameoverImages.tryAgainSelected.src = "images/gameOverTryAgainSelected.png"
gameoverImages.mainMenuSelecetd.src = "images/gameOverMainMenuSelected.png"
var isGameover = false;
// final time and final score
var finalTime = 0;
var score = 0;

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

var heart = new Image();
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
    lastAttack: 250,
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
    update: function (elapsed) {
        // 	WALKING ANIMATION **************************************************************************
        // Update hero animation
        if (!this.still || this.walking) {
            //walking===true so animation continues to completion of current cycle
            //so that frame isn't frozen midcycle by still condition
            this.walkTimer += elapsed;
            this.walking = true;
            if (this.walkTimer >= this.animDelay) {
                // Enough time has passed to update the animation frame
                this.walkTimer = 0; // Reset the animation timer
                ++this.walkFrame;

                if (this.walkFrame >= this.walkNumFrames) {
                    // We've reached the end of the animation frames; rewind
                    this.walkFrame = 0;
                    this.walking = false;
                }
            }
        }


        // 	ATTACKING ANIMATION **************************************************************************
        // Update hero animation
        if (this.isAttacking && !swingPlayed) {
            swingSound = loadSound("sword-gesture.mp3");
            swingSound.volume = 0.3;
            swingSound.play();
            swingPlayed = true;
        }
        this.lastAttack += elapsed;
        if (this.isAttacking && !this.isHurt) {
            this.attackTimer += elapsed;
            if (this.attackTimer >= this.animDelay) {
                // Enough time has passed to update the animation frame
                this.attackTimer = 0; // Reset the animation timer
                ++this.attackFrame;

                if (this.attackFrame >= this.attackNumFrames) {
                    // We've reached the end of the animation frames; rewind
                    this.attackFrame = 0;
                    this.lastAttack = 0;
                    this.isAttacking = false;
                    swingPlayed = false;
                    //Check if any enemies are in the range of the attack
                    for (var i = 0; i < enemies.length; i++) { //deduct health after attack anim so that 1 health per attack is taken
                        if (enemies[i].isAlive && enemies[i].health > 0 && enemies[i].inAttackingRange) {
                            // only deduct enemy health if in range and if enemy health isn't 0
                            enemies[i].health -= 1;
                            if (bossAvailable) {
                                if (enemies[i].direction === 1)
                                    enemies[i].x -= 10;
                                else
                                    enemies[i].x += 10;
                            }
                        }
                    }
                }
                for (var i = 0; i < enemies.length; i++) { // activate is hurt during attack anim so enemy can't attack during this period
                    if (enemies[i].isAlive && enemies[i].health > 0 && enemies[i].inAttackingRange) {
                        // only activate isHurt if in range and if enemy health isn't 0
                        enemies[i].isHurt = true;

                    }
                }
            }
        }

        // KNIGHT HURT FRAME ****************************************************************************
        if (this.isHurt && !hurtPlayed) {
            hurtSound = loadSound("Grunt.mp3");
            hurtSound.play();
            hurtSound.volume = .5;
            hurtPlayed = true;
        }
        if (this.isHurt) {
            this.hurtTimer += elapsed;
            this.direction = 0;
            if (this.hurtTimer >= this.hurtDelay) {
                //hurt frame has been showed enough
                this.hurtTimer = 0; // Reset the animation timer
                this.isHurt = false;
                hurtPlayed = false;
            }
        }
        //KNIGHT DEATH ANIMATION ***********************************************************************
        if (this.health === 0) {
            if (!deathPlayed) {
                deathSound.play();
                deathPlayed = true;
            }
            death.timer += elapsed;
            if (death.timer >= this.animDelay) {
                // Enough time has passed to update the animation frame
                death.timer = 0; // Reset the animation timer
                ++death.deathFrame;

                if (death.deathFrame >= death.numFrames) {
                    // We've reached the end of the animation frames; rewind
                    this.isAlive = false;
                    death.deathFrame = 0;
                    deathPlayed = false;
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
        } else if (this.facing === "left") {
            this.walkSet = 1;
        }


        // ATTACKIING FRAME SET SELECTION BY DIRECTION ****************************************************
        if (this.facing === "right") {
            this.attackSet = 1;
        } else if (this.facing === "left") {
            this.attackSet = 0;
        }


        // MOVEMENT FRAME OF CHARACTER ***********************************************************************
        if (this.direction === -1) {
            if (this.x > 0) { //edge detection
                var move = (this.speed * (elapsed / 1000));
                this.x += Math.round(move * this.direction);
            }
        } else if (this.direction === 1) {
            if (this.x < (canvas.width - this.width)) { // edge detection
                var move = (this.speed * (elapsed / 1000));
                this.x += Math.round(move * this.direction);
            }
        }

        if (this.y < ((canvas.height - 100) - this.height)) {
            this.onGround = false;
            this.midAir = true;
        } else {
            this.onGround = true;
            this.midAir = false;
        }

        if (this.jumping && !jumpPlayed && !this.onGround) {
            jumpSound = loadSound("Jump.mp3");
            jumpSound.volume = .2;
            jumpSound.play();
            jumpPlayed = true;
        }
        if (this.jumping || !this.onGround) {
            velocityY += gravity;
            this.y += velocityY;
            if (this.y > (canvas.height - 100 - this.height)) {
                this.y = canvas.height - 100 - this.height;
                velocityY = 0;
                gravity = 0;
                jumpPlayed = false;
            }

        }

    },
    draw: function (context) {
        //Draw Knight Health
        for (var h = 0; h < this.health; h++) {
            context.drawImage(heart, 20 + (20 * h), 20, 22, 18);
        }

        if (this.imageReady) {
            var spriteX, effectiveX = this.x,
                effectiveWidth = this.width;
            if (this.isHurt) {
                if (this.facing === "right")
                    spriteX = 2086 - (64 * 2);
                else spriteX = 2086 - 64;
            } else if (this.midAir) {
                spriteX = (
                    (2 * (effectiveWidth * this.walkNumFrames)) + // frame for sprite if knight.jumping
                    (this.jumpSet * effectiveWidth)
                );
            } else if (this.isAttacking) { // "else if" : only if the char is not in the air can he slash; less problems this way...
                // images are wider for attacking frames and the knight.width values must be adjusted accordingly
                if (this.attackFrame <= 1) {
                    effectiveWidth = 90; // set width to 90 pixels for the first two frames of attacking; sword behind char at angle
                    spriteX = (
                        (2 * (this.width * this.walkNumFrames)) + (2 * this.width) + //move past frames for jumping and walking
                        (this.attackSet * (531)) + //1 if second set of frames is needed 0 if first is needed
                        (this.attackFrame * effectiveWidth)
                    );
                }
                if (this.attackFrame > 1) {
                    effectiveWidth = 117; // set width to 117 pixels for other frames of attacking; sword in front for contact
                    // this calculation moves to the frames for the 117 px section of attack by first adding the
                    // the walking frames and jumping frames then catering for the possible different attack sets
                    // then adding 180 to cater for the first two 90px frames of attacking and lastly
                    // adjusting the attackFrame count by subtracting 2 then multiplying by the current knight.width

                    spriteX = (
                        (2 * (this.width * this.walkNumFrames)) + (2 * this.width) + //move past frames for jumping and walking
                        (this.attackSet * (531)) + 180 + //1 if second set of frames is needed 0 if first is needed
                        ((this.attackFrame - 2) * effectiveWidth)
                    );

                }
            } else {
                spriteX = (
                    (this.walkSet * (this.width * this.walkNumFrames)) + // frame for sprite if walking/still
                    (this.walkFrame * this.width) // in the case of still, the animation for walking would be complete and therefore reset
                ); //to the first frame, i.e the "still frame"
            }
            // END OF KNIGHT IMAGE SPRITE X *********************************************************************************************


            // Change the position to draw from so as to account for the slash sprite being wider than the regular sprite
            if ((this.attackSet === 0) && (this.attackFrame > 1)) {
                // adjust x coordinate to cater for the sword being in front of the character in certain frames while facing left
                effectiveX -= 53;
            } else if ((this.attackSet === 1) && (this.attackFrame <= 1) && this.isAttacking) {
                // adjust x coordinate to cater for the sword being behind the character in certain frames while facing right
                effectiveX -= 26;
            }


            // Render image to canvas
            if (this.health > 0) {
                context.drawImage(
                    this.image,
                    spriteX, 0, effectiveWidth, this.height,
                    effectiveX, this.y, effectiveWidth, this.height
                );
            }
            if (this.health === 0) {
                spriteX = (64 * death.deathFrame);

                context.drawImage(
                    death.image,
                    spriteX, 0, effectiveWidth, this.height,
                    effectiveX, this.y, effectiveWidth, this.height
                );
            }

        } else {
            // Image not ready. Draw a green box
            context.fillStyle = "green";
            context.fillRect(this.x, this.y, this.width, this.height);
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
var enemy = {
    x: 0,
    y: 0,
    width: 32,
    height: 64,
    speed: 175,
    direction: 0,
    walkSet: 0,
    walkFrame: 0,
    walkNumFrames: 5,
    walkTimer: 0,
    animDelay: 50,
    attackFrame: 0,
    attackNumFrames: 4,
    attackTimer: 0,
    lastAttack: 500,
    isAttacking: false,
    inAttackingRange: false,
    attackSet: 0,
    attackSetWidth: 256,
    attackRangeLeft: -35,
    attackRangeRight: 64,
    image: new Image(),
    imageReady: false,
    isAlive: true,
    isHurt: false,
    hurtTimer: 0,
    hurtDelay: 200,
    hurtWidth: 32,
    hurtFacingLeftSpriteX: 992,
    hurtFacingRigtSpriteX: 960,
    health: 1,
    update: function (elapsed) {
        var distanceBetween = this.x - knight.x;
        this.lastAttack += elapsed;

        if (this.isHurt && !enemyHurtPlayed) {
            enemyHurtSound = loadSound("jab.mp3");
            enemyHurtSound.play();
            enemyHurtPlayed = true;
        }

        // ENEMY HURT FRAME ***************************************************************************************
        if (this.isHurt) {
            this.hurtTimer += elapsed;
            if (this.hurtTimer >= this.hurtDelay) {
                //hurt frame has been showed enough
                this.hurtTimer = 0; // Reset the animation timer
                this.isHurt = false;
                enemyHurtPlayed = false;
            }
        }

        // ENEMY DEATH ANIMATION *************************************************************************************
        if (this.health === 0) {
            death.timer += elapsed;
            if (death.timer >= this.animDelay) {
                // Enough time has passed to update the animation frame
                death.timer = 0; // Reset the animation timer
                ++death.deathFrame;

                if (death.deathFrame >= death.numFrames) {
                    // We've reached the end of the animation frames; rewind
                    this.isAlive = false;
                    enemyCount--;
                    score++;
                    death.deathFrame = 0;
                }
            }
        }

        // ENEMY MOVEMENT *********************************************************************************************
        //If it > attackRangeLeft that means that this enemy is being drawn next to the knight on the left
        //If it < attackRangeRight that means that this enemy is being drawn next to the kniht on the right
        else if ((distanceBetween < this.attackRangeLeft || distanceBetween > this.attackRangeRight)  && !this.isHurt) { //If not in attacking range then move closer
            this.inAttackingRange = false;
            this.isAttacking = false; //if the knight moves while enemy is mid attack then change back to walking anim
            this.walkTimer += elapsed;
            if (this.walkTimer >= this.animDelay) {
                // Enough time has passed to update the animation frame
                this.walkTimer = 0; // Reset the animation timer
                this.walkFrame++;

                if (this.walkFrame >= this.walkNumFrames) {
                    // We've reached the end of the animation frames; rewind
                    this.walkFrame = 1; //do not include first frame if walking
                }
            }

            var distance = Math.round(this.speed * (elapsed / 1000));
            if (knight.x > this.x) { //Knight is on the right
                this.x += distance;
                this.direction = 1;
                this.walkSet = 0
            } else if (knight.x + knight.width < this.x) { // Knight is on the left
                this.x -= distance;
                this.direction = -1;
                this.walkSet = 1;
            }
            // ENEMY ATTACK *************************************************************************************************
        } else {
            this.walkFrame = 0; //If close enough set the frame to the beginning
            this.inAttackingRange = true;
            this.attackSet = distanceBetween < 0 ? 0 : 1;
            if (this.lastAttack >= 500 && knight.onGround && !this.isHurt) { // in attacking range and time since last attack is 500ms
                this.attackTimer += elapsed;
                this.isAttacking = true;
                if (this.attackTimer >= this.animDelay) {
                    this.attackTimer = 0;
                    this.attackFrame++;

                    if (this.attackFrame >= this.attackNumFrames && knight.health > 0) { //Reset to the beginning frame
                        this.attackFrame = 0;
                        knight.health -= 1;
                        knight.isHurt = true;
                        this.lastAttack = 0;
                        this.isAttacking = false;
                    }

                }
            }
        }
    },
    draw: function (context) {
        if (this.imageReady) {
            var spriteX, effectiveWidth = this.width,
                effectiveX = this.x; //effective variables for adjusting width and x to suit attack frames
            if (this.health > 0) { // if enemy is alive
                if (this.isHurt) {
                    effectiveWidth = this.hurtWidth;
                    if (this.direction === -1)
                        spriteX = this.hurtFacingLeftSpriteX;
                    else
                        spriteX = this.hurtFacingRigtSpriteX;
                } else if (!this.isAttacking || !knight.onGround) //if not attacking (i.e. walking or waiting to attack)
                    spriteX = (this.walkSet * (this.width * this.walkNumFrames)) + (this.walkFrame * this.width);
                else if (this.isAttacking) {
                    spriteX = (2 * this.walkNumFrames * this.width) + (this.attackSet * this.attackSetWidth) + (this.attackFrame * 64);
                    effectiveWidth = 64;
                    if (this.direction === -1) //if facing left
                        effectiveX = this.x - 32;
                    else //if facing right
                        effectiveX = this.x;
                } else {
                    effectiveWidth = this.width;
                    effectiveX = this.x;
                }
                context.drawImage(this.image, spriteX, 0, effectiveWidth, this.height, effectiveX, this.y, effectiveWidth, this.height);
            } else { // if enemy health === 0 so death animation
                spriteX = (64 * death.deathFrame);

                context.drawImage(
                    death.image,
                    spriteX, 0, 64, 64,
                    this.x, this.y, this.width, this.height
                );
            }
        } else {
            context.fillStyle = "green";
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
};
enemy.y = canvas.height - 100 - enemy.height;
enemy.image.onload = function () {
    enemy.imageReady = true;
}
enemy.image.src = "images/enemy_sheet.png";
var lastEnemySpawn = 1000; //Used to ensure the enemy spans every 1000ms/1s

var bossAvailable = false;
var boss = extend(enemy, {
    speed: 150,
    walkNumFrames: 5,
    animDelay: 70,
    attackFrame: 0,
    attackNumFrames: 3,
    attackSetWidth: 192,
    image: new Image(),
    hurtDelay: 500,
    hurtWidth: 64,
    hurtFacingLeftSpriteX: 896,
    hurtFacingRigtSpriteX: 832,
    health: 3,
});
boss.y = (canvas.height - 100) - (boss.height);
boss.image.onload = function () {
    boss.imageReady = true;
}
boss.image.src = "images/kylesheet.png";

var enemyCount = 0; //Counter to keep track of the current active enemies on the screen


//Sound***********************************************************************************************************************************

var bgAudio = document.getElementById("bgAudio");


function loadSound(name) {
    var sound = new Audio("sounds/" + name);
    sound.load();
    sound.loop = false;
    return sound;
}

//Sword sound
var swingPlayed = false;
var swingSound = loadSound("sword-gesture.mp3");
swingSound.volume = 0.3;

//Jump sound
var jumpPlayed = false;
var jumpSound = loadSound("jump.mp3");
jumpSound.volume = .2;

//hurt sound
var hurtPlayed = false;
var hurtSound = loadSound("grunt.mp3");
hurtSound.volume = .5;

//Death sound
var deathPlayed = false;
var deathSound = loadSound("explosion.wav");
deathSound.volume = .5;

//upon enemy hit
var enemyHurtPlayed = false;
var enemyHurtSound = loadSound("jab.mp3");
enemyHurtSound.volume = 1;


// end of sound stuff ********************************************************************************************************************

var handleInput = function () {
    if (isGameRunning) {
        // Stop moving the playa
        knight.direction = 0;

        if (37 in keysDown && !knight.isAttacking) { // left arrow key
            knight.direction = -1;
            knight.still = false;
            knight.facing = "left";
        }

        if (39 in keysDown && !knight.isAttacking) { // right arrow key
            knight.direction = 1;
            knight.still = false;
            knight.facing = "right";
        }

        if (32 in keysDown && knight.onGround) { //space
            knight.jumping = true;
            velocityY = -12;
            gravity = 0.5;

        }

        if (90 in keysDown && knight.onGround && knight.lastAttack >= 250) { // z
            knight.isAttacking = true;
            // knight.still = false;
        }

        if (80 in keysDown) { // P for pause
            isPause = true;
        }
        if (85 in keysDown) { // U for unpause; different keys used because
            // isPause would switch from paused to unpaused 60 times per second when p is pressed so there's no control
            // different keys allow for control
            isPause = false;
        }
    } else if (isGameover) {
        if (40 in keysDown && whichHover === "tryAgain") // if hovering over start and down is pressed hover over main menu
            whichHover = "mainMenu";
        else if (38 in keysDown && whichHover === "mainMenu") // if hovering over main menu and up is pressed hover over try again
            whichHover = "tryAgain";
        if (13 in keysDown) {
            isGameover = false;
            if (whichHover === "tryAgain") {
                resetGame(); // reset immediately
                isGameover = false;
                isGameRunning = true; //immeduately go back to game
            } else if (whichHover === "mainMenu") {
                whichHover = "start";
                delete keysDown[13];
            }
        }
    } else if (!isGameRunning && !isOnInstr && !isOnStory) { //main menu
        // only start game is enter is pressed while hovering over start
        if (13 in keysDown && whichHover === "start") { //select start
            resetGame(); // reset in case game was being played before
            isGameRunning = true;
        }

        if (13 in keysDown && whichHover === "howTo") {
            isOnInstr = true;
        }


        if (13 in keysDown && whichHover === "story") {
            isOnStory = true;
        }

        // if hovering over start and down is pressed hover over how to
        if (40 in keysDown && whichHover === "start") {
            whichHover = "howTo";
            delete keysDown[40];
        }
        // if hovering over howTo and up is pressed hover over start
        if (38 in keysDown && whichHover === "howTo")
            whichHover = "start";
        // if hovering over howTo and down is pressed hover over story
        if (40 in keysDown && whichHover === "howTo")
            whichHover = "story";
        // if hovering over story and up is pressed hover over how to
        if (38 in keysDown && whichHover === "story") {
            whichHover = "howTo";
            delete keysDown[38];
        }
    } else if (isOnInstr) {
        if (27 in keysDown) //Esc to go back to main menu
            isOnInstr = false;
    } else if (isOnStory) {
        if (27 in keysDown) //Esc to go back to main menu
            isOnStory = false;
    }

};

var enemyCount = 0; // counts how many enemies on the screen at one time
var requiredNumberOfEnemies = 10; // number of enemies allowed on the screen at one time
var requiredSpawnTime = 1000;

var update = function (elapsed) {
    var timerSeconds = (Math.floor(timer / 1000)); // must be declared before finalTime

    if (!knight.isAlive) {
        finalTime = timerSeconds;
        isGameRunning = false; //knight dead so stop game
        isGameover = true;
        whichHover = "tryAgain"; //set to tryAgain so for the game over screen to load correct image

    }

    knight.update(elapsed);

    //Enemy Spawn Control********************************************************************************************************************

    //Add enemy
    if ((lastEnemySpawn >= requiredSpawnTime) && (enemyCount < requiredNumberOfEnemies)) { // stops from spawning if to many enemies on the screen
        enemyCount++;
        var e = Object.create(bossAvailable ? boss : enemy);
        e.x = Math.random() < 0.5 ? 0 : 1000; // randomly spawn at either end of canvas
        enemies.push(e);
        lastEnemySpawn = 0;
    }
    lastEnemySpawn += elapsed;
    bossAvailable = (((enemies.length + 1) % 10) === 0); //boss spawns if 9 mikkels have been spawned

    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].isAlive) enemies[i].update(elapsed); // if enemy alive then update enemy
    }

    //End of Enemy Spawn Control*************************************************************************************************************

    // TIMER FRAME UPDATE************************************************************************************************************
    var timerNumDigits = Math.ceil(Math.log(timerSeconds + 1) / Math.LN10); //to get the "length" of the timerSeconds variable

    // each digit value is stored in a separate variable of the timer object
    // in different cases of values of timerSeconds such as 1, 20, 125
    if (timerNumDigits <= 1) {
        timerDigits.ones = timerSeconds;
        timerDigits.tens = 0;
        timerDigits.hundreds = 0;
    } else if (timerNumDigits === 2) {
        timerDigits.ones = timerSeconds % 10;
        timerDigits.tens = Math.floor(timerSeconds / 10);
        timerDigits.hundreds = 0;
    } else if (timerNumDigits === 3) {
        var conversionStep = timerSeconds % 100;
        timerDigits.ones = conversionStep % 10;
        timerDigits.tens = Math.floor(conversionStep / 10);
        timerDigits.hundreds = Math.floor(timerSeconds / 100);
    } else {
        timerDigits.ones = 9;
        timerDigits.tens = 9;
        timerDigits.hundreds = 9;
    }
};


var render = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    knight.draw(ctx);

    // Count up timer rendering
    ctx.font = "30px Impact";
    ctx.fillStyle = "white";
    ctx.fillText(timerDigits.hundreds.toString(), (((canvas.width / 2) - 30)), 40);
    ctx.fillText(timerDigits.tens.toString(), (((canvas.width / 2) - 30) + 20), 40);
    ctx.fillText(timerDigits.ones.toString(), (((canvas.width / 2) - 30) + 40), 40);
    // Score rendering
    ctx.fillText("Kills: ", 150, 40);
    ctx.fillText(score.toString(), 220, 40);

    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].isAlive)
            enemies[i].draw(ctx);
    }
}

var mainMenu = function () {
    if (isGameover) { // if game is over then run game over instead of main menu
        ctx.drawImage(whichHover === "tryAgain" ? gameoverImages.tryAgainSelected : gameoverImages.mainMenuSelecetd,
            0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillText("Time: ", ((canvas.width / 2) - 90), 50);
        ctx.fillText(finalTime.toString(), (((canvas.width / 2) - 30) + 20), 50);
        ctx.fillText("Kills: ", ((canvas.width / 2) - 90), 100);
        ctx.fillText(score.toString(), (((canvas.width / 2) - 30) + 20), 100);
    } else if (isOnInstr) {
        ctx.drawImage(instruc, 0, 0, canvas.width, canvas.height);
    } else if (isOnStory) {
        ctx.drawImage(storyScreen, 0, 0, canvas.width, canvas.height);
    } else {
        if (whichHover === "start") { // white border around start button or "hover cursor" over start button
            ctx.drawImage(menuImages.startSelected, 0, 0, canvas.width, canvas.height);
        }
        if (whichHover === "howTo") { // white border around how to button or "hover cursor" over how to button
            ctx.drawImage(menuImages.howToSelected, 0, 0, canvas.width, canvas.height);

        } else if (whichHover === "story") { // white border around story button or "hover cursor" over story button
            ctx.drawImage(menuImages.storySelected, 0, 0, canvas.width, canvas.height);

        }
    }

}


var pauseScreen = function () {
    ctx.drawImage(pause, (canvas.width / 2) - (290 / 2), (canvas.height / 2) - 50, 290, 100);
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
    // reset score
    score = 0;
    //reset enemies
    enemies = [];


    enemyCount = 0; // these 4 variables reset so that the correct number of enemies are allowed on the screen
    bossAvailable = false; // & at the correct spawn rate when u die and try again
    requiredNumberOfEnemies = 10;
    requiredSpawnTime = 1000;

}

// Main game loop

var main = function () {
    // Calculate time since last frame
    var now = Date.now();
    var delta = (now - last);
    last = now;
    if (!isGameRunning) {
        bgAudio.pause();
        mainMenu(); //only run main menu if start was not hit; for now ;)
    }

    pollGamepad();
    handleInput();
    // Update game objects
    if (isGameRunning && !isPause) { //only run game loop if start was hit and the game is unpaused
        update(delta);
        bgAudio.play();
        // Render to the screen
        render();
    } else if (isGameRunning && isPause)
        pauseScreen();

    // console.log("Number of enemies = "+enemies.length);
    // console.log(enemyCount);
    // console.log(requiredSpawnTime)

    if (((enemies.length % 10) === 0) && (lastEnemySpawn > requiredSpawnTime)) { // allows more enemies to be on the screen at
        requiredNumberOfEnemies++; // a time for every 10 kills you get and speeds their spawn time too
        if (requiredSpawnTime > 500)
            requiredSpawnTime -= 20;
    }
};

// Start the main game loop!
var last = Date.now();
var interval = setInterval(main, 1000 / 60);



//COUNT UP TIMER
var timer = 0;


var lastSec = Date.now();
var myVar = setInterval(myTimer, 1000);

function myTimer() {
    var now = Date.now();
    var delta = now - lastSec;
    lastSec = now;
    if (!isPause && isGameRunning) { //only update timer if unpaused; so now and lastSec continue changing
        //even when paused so delta remains 1sec after unpause and only if the game is actually running (not in menus)
        timer += delta;
    }
}

//Rain ===========================================================================

var canvas2 = document.getElementById("canvas2");
var ctx2 = canvas2.getContext("2d");

ctx2.strokeStyle = 'rgba(174,194,224,0.5)';
ctx2.lineWidth = 1;
ctx2.lineCap = 'round';

var particles = [];
var MAX_PARTS = 1000;
for (var a = 0; a < MAX_PARTS; a++) {
    particles.push({
        x: Math.random() * canvas2.width,
        y: Math.random() * canvas2.height,
        l: Math.random() * 1,
        xs: -4 + Math.random() * 4 + 2,
        ys: Math.random() * 10 + 10
    })
}

function draw() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    if (isGameRunning) {
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            ctx2.beginPath();
            ctx2.moveTo(p.x, p.y);
            ctx2.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
            ctx2.stroke();

            p.x += p.xs;
            p.y += p.ys;
            if (p.x > canvas2.width || p.y > canvas2.height) {
                p.x = Math.random() * canvas2.width;
                p.y = -20;
            }
        }
    }
}

setInterval(draw, 30);

//==========================================================================
