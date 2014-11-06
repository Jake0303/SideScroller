var stage;
var queue;

// game objects
var space;
var spaceship;
var laser = [];
var laserCounter = 0;
var powerup;
var asteroids = [];
var scoreboard;
var explosionTimer = 0;
var explosionSpriteSheet;
var explosionAnim = [];
var explosions = 0;
var isExploding;

// game constants
var LASER_NUM = 10;
var ASTEROID_NUM = 4;
var PLAYER_LIVES = 3;
var GAME_FONT = "40px Consolas";
var FONT_COLOUR = "#FFFF00";
var Y_OFFSET = 15;
var LASER_SPEED = 20;
var ADD_SCORE = 100;
var REMOVE_LASER = 2000;
var REMOVE_EXPLOSION = 5;

// Preload function
function preload() {
    queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", init);
    queue.loadManifest([
        { id: "spaceship", src: "images/Spaceship.png" },
        { id: "thrusteranim", src: "Assets/thruster.png" },
        { id: "shoot", src: "images/lasershot.png" },
        { id: "explosionanim", src: "Assets/explosion.png" },
        { id: "asteroid1", src: "images/asteroid1.png" },
        { id: "asteroid2", src: "images/asteroid2.png" },
        { id: "asteroid3", src: "images/asteroid3.png" },
        { id: "space", src: "images/spacebackground.png" },
        { id: "powerup", src: "Assets/images.png" },
        { id: "yay", src: "sounds/yay.ogg" },
        { id: "thunder", src: "sounds/thunder.ogg" }
    ]);
}

//Init function, called when the body of the html page is loaded. Enables mouse over and ticker
function init() {
    stage = new createjs.Stage(document.getElementById("canvas"));
    stage.enableMouseOver(20);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", gameLoop);
    gameStart();
}

// Game Loop, called every frame. Update game objects
function gameLoop(event) {
    space.update();
    spaceship.update();
    powerup.update();
    for (var i = 0; i < LASER_NUM; i++) {
        if (laser[i] != null) {
            laser[i].update();
        }
    }
    for (var count = 1; count < ASTEROID_NUM; count++) {
        asteroids[count].update();
    }
    if (isExploding) {
        explosionTimer++;
        if (explosionTimer > REMOVE_EXPLOSION) {
            for (var i = 0; i < explosionAnim.length; i++) {
                stage.removeChild(explosionAnim[i]);
                explosionTimer = 0;
                isExploding = false;
            }
        }
    }
    collisionCheck();

    scoreboard.update();

    stage.update();
}

/*
* SpaceShip Class, the player controls this spaceship
*/
var SpaceShip = (function () {
    function SpaceShip() {
        //Thruster Animation
        this.thrusterData = {
            images: [queue.getResult("thrusteranim")],
            frames: [
                [2, 2, 30, 12],
                [34, 2, 30, 12],
                [66, 2, 30, 12],
                [98, 2, 30, 12]
            ],
            animations: {
                thrusterAnim: [0, 3, "thrusteranim", 0.5]
            }
        };
        this.spriteSheet = new createjs.SpriteSheet(this.thrusterData);
        this.animTimer = 0;
        this.thruster = new createjs.Sprite(this.spriteSheet, "thrusteranim");
        this.image = new createjs.Bitmap(queue.getResult("spaceship"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.image.x = 60;
        stage.addChild(this.image);
        stage.addChild(this.thruster);

        //If the player clicks, shoot a laser.
        stage.on("click", function () {
            laser[laserCounter] = new LaserShot();
            laser[laserCounter].shootLaser();
            laserCounter++;
            if (laserCounter >= LASER_NUM) {
                laserCounter = 0;
            }
        }, this);
    }
    //Place the spaceship where the mouse is and align the thrusters.
    SpaceShip.prototype.update = function () {
        this.image.y = stage.mouseY;
        this.image.x = stage.mouseX;
        this.thruster.y = this.image.y + 15;
        this.thruster.x = stage.mouseX - 55;
        this.thruster.rotation = 270;
    };
    return SpaceShip;
})();

/*
* LaserShot Class, called when the player clicks/shoots
*/
var LaserShot = (function () {
    function LaserShot() {
        this.laserCounter = 0;
        this.laserBeam = new createjs.Bitmap(queue.getResult("shoot"));
        this.width = this.laserBeam.getBounds().width;
        this.height = this.laserBeam.getBounds().height;
    }
    //Called when the player left clicks,can only shoot 10 at a time.
    LaserShot.prototype.shootLaser = function () {
        this.laserCounter++;
        if (event.button == 0) {
            this.laserBeam.y = stage.mouseY - Y_OFFSET;
            this.laserBeam.x = spaceship.image.x + Y_OFFSET;
            stage.addChild(this.laserBeam);
            stage.update();
        }
    };

    //If the laser beam is shot passed the screen remove it.
    LaserShot.prototype.update = function () {
        this.laserBeam.x += LASER_SPEED;
        if (this.laserBeam.x > 600) {
            stage.removeChild(this.laserBeam);
        }
    };
    return LaserShot;
})();

/*
* Powerup Class
*/
var Powerup = (function () {
    function Powerup() {
        //Powerup Animation
        this.data = {
            images: [queue.getResult("powerup")],
            frames: [
                [56, 2, 51, 54],
                [109, 2, 51, 54],
                [162, 2, 51, 54],
                [2, 2, 52, 54]
            ],
            animations: { powerupAnim: [0, 3, "powerupAnim", 0.3] }
        };
        this.spriteSheet = new createjs.SpriteSheet(this.data);
        this.powerup = new createjs.Sprite(this.spriteSheet, "powerupAnim");
        this.width = this.powerup.getBounds().width;
        this.height = this.powerup.getBounds().height;
        this.powerup.regX = this.width * 0.5;
        this.powerup.regY = this.height * 0.5;
        this.dx = 5;
        stage.addChild(this.powerup);
        this.reset();
    }
    //Resets the powerup and places it on the edge of the screen to the right
    Powerup.prototype.reset = function () {
        this.powerup.y = Math.floor(Math.random() * stage.canvas.height);
        this.powerup.x = stage.canvas.width + this.width * Math.floor(Math.random() * 20) + 2;
    };

    //Make the powerup fly across towards the player.
    Powerup.prototype.update = function () {
        this.powerup.x -= this.dx;
        if (this.powerup.x < 0 + this.width) {
            this.reset();
        }
    };
    return Powerup;
})();

/*
* Asteroid Class, these are dangerous towards the player.
*/
var Asteroid = (function () {
    //Choose an different asteroid image randomly.
    function Asteroid(randNum) {
        if (randNum == 1)
            this.image = new createjs.Bitmap(queue.getResult("asteroid1"));
        else if (randNum == 2)
            this.image = new createjs.Bitmap(queue.getResult("asteroid2"));
        else if (randNum == 3)
            this.image = new createjs.Bitmap(queue.getResult("asteroid3"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        stage.addChild(this.image);
        this.reset(Math.floor((Math.random() * 3) + 1));
    }
    //Reset the asteroid to the right of the screen and randomly choose an image.
    Asteroid.prototype.reset = function (randNum) {
        stage.removeChild(this.image);
        if (randNum == 1) {
            this.image = new createjs.Bitmap(queue.getResult("asteroid1"));
        } else if (randNum == 2) {
            this.image = new createjs.Bitmap(queue.getResult("asteroid2"));
        } else if (randNum == 3)
            this.image = new createjs.Bitmap(queue.getResult("asteroid3"));
        this.image.x = stage.canvas.width + this.image.getBounds().width;
        this.image.y = Math.floor(Math.random() * stage.canvas.height);
        this.dy = Math.floor(Math.random() * 2 - 1);
        this.dx = Math.floor(Math.random() * 5 + 5);
        stage.addChild(this.image);
    };

    //Make the asteroid steer down or up or straight.
    Asteroid.prototype.update = function () {
        if (this.image.y < stage.canvas.height / 2) {
            this.image.y += this.dy;
        } else {
            this.image.y -= this.dy;
        }
        this.image.x -= this.dx;
        if (this.image.x < 0 - this.image.getBounds().width) {
            this.reset(Math.floor((Math.random() * 3) + 1));
        }
    };
    return Asteroid;
})();

/*
* Space Background class, background image in our game.
*/
var SpaceBackground = (function () {
    function SpaceBackground() {
        this.image = new createjs.Bitmap(queue.getResult("space"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.dx = 5;
        stage.addChild(this.image);
        this.reset();
    }
    //Reset the background for a continous loop
    SpaceBackground.prototype.reset = function () {
        this.image.x = -this.width + stage.canvas.width;
    };

    //Let the background slide across the screen.
    SpaceBackground.prototype.update = function () {
        this.image.x += this.dx;
        if (this.image.x >= 0) {
            this.reset();
        }
    };
    return SpaceBackground;
})();

/*
* Scoreboard Class, display lives and score during the game.
*/
var Scoreboard = (function () {
    function Scoreboard() {
        this.labelString = "";
        this.lives = PLAYER_LIVES;
        this.score = 0;
        this.label = new createjs.Text(this.labelString, GAME_FONT, FONT_COLOUR);
        this.update();
        this.width = this.label.getBounds().width;
        this.height = this.label.getBounds().height;

        stage.addChild(this.label);
    }
    Scoreboard.prototype.update = function () {
        this.labelString = "Lives: " + this.lives.toString() + " Score: " + this.score.toString();
        this.label.text = this.labelString;
    };
    return Scoreboard;
})();

/*
* Find the distance between two points.
*/
function distance(point1, point2) {
    var p1;
    var p2;
    var theXs;
    var theYs;
    var result;

    p1 = new createjs.Point();
    p2 = new createjs.Point();

    p1.x = point1.x;
    p1.y = point1.y;
    p2.x = point2.x;
    p2.y = point2.y;

    theXs = p2.x - p1.x;
    theYs = p2.y - p1.y;

    theXs = theXs * theXs;
    theYs = theYs * theYs;

    result = Math.sqrt(theXs + theYs);

    return result;
}

/*
* Check to see if the laser has collided with an asteroid
*/
function checkLaserCollision() {
    var p1 = new createjs.Point();
    var p2 = new createjs.Point();

    for (var i = 0; i < LASER_NUM; i++) {
        if (laser[i] != null) {
            p1.x = laser[i].laserBeam.x;
            p1.y = laser[i].laserBeam.y;
            for (var count = 1; count < ASTEROID_NUM; count++) {
                if (asteroids[count] != null) {
                    p2.x = asteroids[count].image.x;
                    p2.y = asteroids[count].image.y;

                    //If there was a collision add score,remove the laser and then play an explosion animation
                    if (!(laser[i].laserBeam.x >= asteroids[count].image.x + asteroids[count].width || laser[i].laserBeam.x + laser[i].width <= asteroids[count].image.x || laser[i].laserBeam.y >= asteroids[count].image.y + asteroids[count].height || laser[i].laserBeam.y + laser[i].height <= asteroids[count].image.y) && laser[i].laserBeam.x < stage.canvas.width - laser[i].width) {
                        isExploding = true;

                        var explosionData = {
                            images: [queue.getResult("explosionanim")],
                            frames: [
                                [239, 2, 36, 48],
                                [183, 2, 54, 48],
                                [62, 2, 57, 54],
                                [2, 2, 58, 54],
                                [121, 2, 60, 48],
                                [277, 2, 56, 45],
                                [335, 2, 47, 36]
                            ],
                            animations: { explosionAnim: [0, 6, "", 0.5] }
                        };
                        explosionSpriteSheet = new createjs.SpriteSheet(explosionData);
                        explosionAnim[explosions] = new createjs.Sprite(explosionSpriteSheet, "explosionanim");
                        explosionAnim[explosions].x = asteroids[count].image.x;
                        explosionAnim[explosions].y = asteroids[count].image.y;
                        stage.addChild(explosionAnim[explosions]);
                        explosions++;
                        scoreboard.score += ADD_SCORE;
                        asteroids[count].reset();
                        laser[i].laserBeam.x = REMOVE_LASER;
                        stage.removeChild(laser[i].laserBeam);
                        stage.removeChild(laser[i]);
                    }
                }
            }
        }
    }
}

/*
* Check collision between asteroid and spaceship
*/
function checkAsteroid(aAsteroid) {
    var p1 = new createjs.Point();
    var p2 = new createjs.Point();

    p1.x = spaceship.image.x;
    p1.y = spaceship.image.y;
    p2.x = aAsteroid.image.x;
    p2.y = aAsteroid.image.y;

    //If there was a collision lose 1 life and reset the asteroid.
    if (distance(p2, p1) < ((spaceship.height * 0.5) + (aAsteroid.height * 0.5))) {
        scoreboard.lives -= 1;
        aAsteroid.reset(Math.floor((Math.random() * 3) + 1));
    }
}

// Check Collision with spaceship and powerup
function checkPowerup(aPowerup) {
    var p1 = new createjs.Point();
    var p2 = new createjs.Point();

    p1.x = spaceship.image.x;
    p1.y = spaceship.image.y;
    p2.x = aPowerup.powerup.x;
    p2.y = aPowerup.powerup.y;

    //if the player collides add score.
    if (distance(p2, p1) < ((spaceship.height * 0.5) + (aPowerup.height * 0.5))) {
        scoreboard.score += ADD_SCORE;
        aPowerup.reset();
    }
}

//Call the collision check methods constantly.
function collisionCheck() {
    checkLaserCollision();
    checkPowerup(powerup);

    for (var count = 1; count < ASTEROID_NUM; count++) {
        checkAsteroid(asteroids[count]);
    }
}

//Initialize objects on start.
function gameStart() {
    space = new SpaceBackground();
    spaceship = new SpaceShip();
    powerup = new Powerup();
    for (var count = 1; count < ASTEROID_NUM; count++) {
        asteroids[count] = new Asteroid(Math.floor((Math.random() * 3) + 1));
    }

    scoreboard = new Scoreboard();
}
//# sourceMappingURL=game.js.map
