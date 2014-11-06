var stage: createjs.Stage;
var queue;
// game objects
var space: SpaceBackground;
var spaceship: SpaceShip;
var laser = [];
var laserCounter: number = 0;
var powerup: Powerup;
var asteroids = [];
var scoreboard: Scoreboard;
var explosionTimer = 0;
var explosionSpriteSheet: createjs.SpriteSheet;
var explosionAnim = [];
var explosions = 0;
var isExploding: boolean;
// game constants
var LASER_NUM: number = 10;
var ASTEROID_NUM: number = 4;
var PLAYER_LIVES: number = 3;
var GAME_FONT = "40px Consolas";
var FONT_COLOUR = "#FFFF00";
var Y_OFFSET = 15;
var LASER_SPEED = 20;
var ADD_SCORE = 100;
var REMOVE_LASER = 2000;
var REMOVE_EXPLOSION = 5;

// Preload function
function preload(): void {
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
function init(): void {
    stage = new createjs.Stage(document.getElementById("canvas"));
    stage.enableMouseOver(20);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", gameLoop);
    gameStart();

}

// Game Loop, called every frame. Update game objects
function gameLoop(event): void {

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
            for(var i = 0; i < explosionAnim.length;i++)
            {
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
class SpaceShip {
    image: createjs.Bitmap;
    //Thruster Animation
    thrusterData = {
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
    spriteSheet = new createjs.SpriteSheet(this.thrusterData);
    thruster: createjs.Sprite;
    width: number;
    height: number;
    animTimer: number = 0;
    constructor() {
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
    update() {
        this.image.y = stage.mouseY;
        this.image.x = stage.mouseX;
        this.thruster.y = this.image.y + 15;
        this.thruster.x = stage.mouseX - 55;
        this.thruster.rotation = 270;
    }
}
/*
 * LaserShot Class, called when the player clicks/shoots
 */
class LaserShot {
    public laserBeam: createjs.Bitmap;
    laserCounter: number = 0;
    width: number;
    height: number;
    constructor() {
        this.laserBeam = new createjs.Bitmap(queue.getResult("shoot"));
        this.width = this.laserBeam.getBounds().width;
        this.height = this.laserBeam.getBounds().height;
    }
    //Called when the player left clicks,can only shoot 10 at a time.
    shootLaser() {
        this.laserCounter++;
        if (event.button == 0) {
            this.laserBeam.y = stage.mouseY - Y_OFFSET;
            this.laserBeam.x = spaceship.image.x + Y_OFFSET;
            stage.addChild(this.laserBeam);
            stage.update();
        }
    }
    //If the laser beam is shot passed the screen remove it.
    update() {
        this.laserBeam.x += LASER_SPEED;
        if (this.laserBeam.x > 600) {
            stage.removeChild(this.laserBeam);
        }
    }
}

/*
 * Powerup Class
 */
class Powerup {
    //Powerup Animation
    data = {
        images: [queue.getResult("powerup")],
        frames: [
            [56, 2, 51, 54],
            [109, 2, 51, 54],
            [162, 2, 51, 54],
            [2, 2, 52, 54]
        ],
        animations: { powerupAnim: [0, 3, "powerupAnim", 0.3] }
    };
    spriteSheet = new createjs.SpriteSheet(this.data);
    powerup: createjs.Sprite;
    width: number;
    height: number;
    dx: number;
    constructor() {
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
    reset() {
        this.powerup.y = Math.floor(Math.random() * stage.canvas.height);
        this.powerup.x = stage.canvas.width + this.width * Math.floor(Math.random() * 20) + 2;
    }
    //Make the powerup fly across towards the player.
    update() {
        this.powerup.x -= this.dx;
        if (this.powerup.x < 0 + this.width) {
            this.reset();
        }

    }
}

/*
 * Asteroid Class, these are dangerous towards the player.
 */
class Asteroid {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dy: number;
    dx: number;
    //Choose an different asteroid image randomly.
    constructor(randNum: number) {
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
    reset(randNum: number) {
        stage.removeChild(this.image);
        if (randNum == 1) {
            this.image = new createjs.Bitmap(queue.getResult("asteroid1"));
        }
        else if (randNum == 2) {
            this.image = new createjs.Bitmap(queue.getResult("asteroid2"));
        }
        else if (randNum == 3)
            this.image = new createjs.Bitmap(queue.getResult("asteroid3"));
        this.image.x = stage.canvas.width + this.image.getBounds().width;
        this.image.y = Math.floor(Math.random() * stage.canvas.height);
        this.dy = Math.floor(Math.random() * 2 - 1);
        this.dx = Math.floor(Math.random() * 5 + 5);
        stage.addChild(this.image);
    }
    //Make the asteroid steer down or up or straight.
    update() {
        if (this.image.y < stage.canvas.height / 2) {
            this.image.y += this.dy;
        }
        else {
            this.image.y -= this.dy;
        }
        this.image.x -= this.dx;
        if (this.image.x < 0 - this.image.getBounds().width) {
            this.reset(Math.floor((Math.random() * 3) + 1));
        }

    }
}

/*
 * Space Background class, background image in our game.
 */
class SpaceBackground {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dx: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("space"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.dx = 5;
        stage.addChild(this.image);
        this.reset();
    }
    //Reset the background for a continous loop
    reset() {
        this.image.x = -this.width + stage.canvas.width;
    }
    //Let the background slide across the screen.
    update() {
        this.image.x += this.dx;
        if (this.image.x >= 0) {
            this.reset();
        }

    }
}

/*
 * Scoreboard Class, display lives and score during the game.
 */
class Scoreboard {
    label: createjs.Text;
    labelString: string = "";
    lives: number = PLAYER_LIVES;
    score: number = 0;
    width: number;
    height: number;
    constructor() {
        this.label = new createjs.Text(this.labelString, GAME_FONT, FONT_COLOUR);
        this.update();
        this.width = this.label.getBounds().width;
        this.height = this.label.getBounds().height;

        stage.addChild(this.label);
    }

    update() {
        this.labelString = "Lives: " + this.lives.toString() + " Score: " + this.score.toString();
        this.label.text = this.labelString;
    }
}
/*
 * Find the distance between two points.
 */
function distance(point1: createjs.Point, point2: createjs.Point): number {
    var p1: createjs.Point;
    var p2: createjs.Point;
    var theXs: number;
    var theYs: number;
    var result: number;

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
    var p1: createjs.Point = new createjs.Point();
    var p2: createjs.Point = new createjs.Point();

    for (var i = 0; i < LASER_NUM; i++) {
        if (laser[i] != null) {
            p1.x = laser[i].laserBeam.x;
            p1.y = laser[i].laserBeam.y;
            for (var count = 1; count < ASTEROID_NUM; count++) {
                if (asteroids[count] != null) {
                    p2.x = asteroids[count].image.x;
                    p2.y = asteroids[count].image.y;
                    //If there was a collision add score,remove the laser and then play an explosion animation
                    if (!(laser[i].laserBeam.x >= asteroids[count].image.x + asteroids[count].width
                        || laser[i].laserBeam.x + laser[i].width <= asteroids[count].image.x
                        || laser[i].laserBeam.y >= asteroids[count].image.y + asteroids[count].height
                        || laser[i].laserBeam.y + laser[i].height <= asteroids[count].image.y) &&
                        laser[i].laserBeam.x < stage.canvas.width - laser[i].width) {
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
function checkAsteroid(aAsteroid: Asteroid) {
    var p1: createjs.Point = new createjs.Point();
    var p2: createjs.Point = new createjs.Point();


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
function checkPowerup(aPowerup: Powerup) {
    var p1: createjs.Point = new createjs.Point();
    var p2: createjs.Point = new createjs.Point();


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
    //Check collision for each asteroid
    for (var count = 1; count < ASTEROID_NUM; count++) {
        checkAsteroid(asteroids[count]);
    }
}
//Initialize objects on start.
function gameStart(): void {
    space = new SpaceBackground();
    spaceship = new SpaceShip();
    powerup = new Powerup();
    for (var count = 1; count < ASTEROID_NUM; count++) {
        asteroids[count] = new Asteroid(Math.floor((Math.random() * 3) + 1));
    }

    scoreboard = new Scoreboard();
}