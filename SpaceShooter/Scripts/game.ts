var stage: createjs.Stage;
var queue;
var hasShot: boolean = false;
// game objects
var space: SpaceBackground;
var spaceship: SpaceShip;
var laser = [];
var laserCounter: number = 0;
//var island: Island;
var asteroids = [];
var scoreboard: Scoreboard;
// game constants
var LASER_NUM: number = 10;
var ASTEROID_NUM: number = 4;
var PLAYER_LIVES: number = 3;
var GAME_FONT = "40px Consolas";
var FONT_COLOUR = "#FFFF00";
var Y_OFFSET = 15;
var LASER_SPEED = 20;
var ADD_SCORE = 100;


// Preload function
function preload(): void {
    queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", init);
    queue.loadManifest([
        { id: "spaceship", src: "images/Spaceship.png" },
        { id: "thrusteranim1", src: "images/Thrusteranim1.png" },
        { id: "thrusteranim2", src: "images/Thrusteranim2.png" },
        { id: "thrusteranim3", src: "images/Thrusteranim3.png" },
        { id: "shoot", src: "images/lasershot.png" },
        { id: "island", src: "images/island.png" },
        { id: "asteroid1", src: "images/asteroid1.png" },
        { id: "asteroid2", src: "images/asteroid2.png" },
        { id: "asteroid3", src: "images/asteroid3.png" },
        { id: "space", src: "images/spacebackground.png" },
        { id: "yay", src: "sounds/yay.ogg" },
        { id: "thunder", src: "sounds/thunder.ogg" }
    ]);
}

function init(): void {
    stage = new createjs.Stage(document.getElementById("canvas"));
    stage.enableMouseOver(20);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", gameLoop);
    gameStart();

}

// Game Loop
function gameLoop(event): void {

    space.update();
    spaceship.update();
    for (var i = 0; i < LASER_NUM; i++) {
        if (laser[i] != null) {
            laser[i].update();
        }
    }
    for (var count = 1; count < ASTEROID_NUM; count++) {
        asteroids[count].update();
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
    thrusterAnimImage: createjs.Bitmap;
    width: number;
    height: number;
    animTimer: number = 0;
    constructor() {
        this.thrusterAnimImage = new createjs.Bitmap(queue.getResult("thrusteranim1"));
        this.image = new createjs.Bitmap(queue.getResult("spaceship"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.image.x = 60;
        stage.addChild(this.image);
        stage.on("click", function () {

            laser[laserCounter] = new LaserShot();
            laser[laserCounter].shootLaser();
            laserCounter++;
            if (laserCounter >= LASER_NUM) {
                laserCounter = 0;
            }
        }, this);

    }
    update() {
        this.animTimer += 1;
        if (this.animTimer % 2 == 0) {
            stage.removeChild(this.thrusterAnimImage);
            this.thrusterAnimImage = new createjs.Bitmap(queue.getResult("thrusteranim1"));
            stage.addChild(this.thrusterAnimImage);
        }
        else if (this.animTimer % 3 == 0) {
            stage.removeChild(this.thrusterAnimImage);
            this.thrusterAnimImage = new createjs.Bitmap(queue.getResult("thrusteranim2")); this.thrusterAnimImage.x = this.image.x + this.thrusterAnimImage.getBounds().x;
            stage.addChild(this.thrusterAnimImage);
            this.animTimer = 0;
        }
        else {
            stage.removeChild(this.thrusterAnimImage);
            this.thrusterAnimImage = new createjs.Bitmap(queue.getResult("thrusteranim3"));
            this.thrusterAnimImage.x = stage.mouseX;
            stage.addChild(this.thrusterAnimImage);
        }
        this.image.y = stage.mouseY;
        this.image.x = stage.mouseX;
        this.thrusterAnimImage.y = this.image.y - 18;
        this.thrusterAnimImage.x = stage.mouseX - 50;
    }
}
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
    shootLaser() {
        this.laserCounter++;
        if (event.button == 0) {
            //if (!hasShot) {

            this.laserBeam.y = stage.mouseY - Y_OFFSET;
            this.laserBeam.x = spaceship.image.x + Y_OFFSET;

            stage.addChild(this.laserBeam);
            stage.update();
            //hasShot = true;
            // }
        }
    }
    update() {
        //if (hasShot) {
        this.laserBeam.x += LASER_SPEED;
        if (this.laserBeam.x > 600) {
            stage.removeChild(this.laserBeam);
            //hasShot = false;
            //}
        }
    }
}

// Island Class
class Island {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dy: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("island"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.dy = 5;
        stage.addChild(this.image);
        this.reset();
    }

    reset() {
        this.image.y = -this.height;
        this.image.x = Math.floor(Math.random() * stage.canvas.width);
    }

    update() {
        this.image.y += this.dy;
        if (this.image.y > (this.height + stage.canvas.height)) {
            this.reset();
        }

    }
}

// Island Class
class Asteroid {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dy: number;
    dx: number;

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

    reset(randNum: number) {
        stage.removeChild(this.image);
        if (randNum == 1) {
            this.image = new createjs.Bitmap(queue.getResult("asteroid1"));
            //this.image.rotation += Math.floor((Math.random() * 3) + 1);
        }
        else if (randNum == 2) {
            this.image = new createjs.Bitmap(queue.getResult("asteroid2"));
            //this.image.rotation -= Math.floor((Math.random() * 3) + 1);
        }
        else if (randNum == 3)
            this.image = new createjs.Bitmap(queue.getResult("asteroid3"));

        this.image.x = stage.canvas.width + this.image.getBounds().width;
        this.image.y = Math.floor(Math.random() * stage.canvas.height);
        this.dy = Math.floor(Math.random() * 2 - 1);
        this.dx = Math.floor(Math.random() * 5 + 5);
        stage.addChild(this.image);
    }

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

    reset() {
        this.image.x = -this.width + stage.canvas.width;
    }

    update() {
        this.image.x += this.dx;
        if (this.image.x >= 0) {
            this.reset();
        }

    }
}

// Scoreboard Class
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

// Check Collision with Plane and Island
function checkLaserCollision() {
    //if (hasShot) {
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

                    if (!(laser[i].laserBeam.x >= asteroids[count].image.x + asteroids[count].width
                        || laser[i].laserBeam.x + laser[i].width <= asteroids[count].image.x
                        || laser[i].laserBeam.y >= asteroids[count].image.y + asteroids[count].height
                        || laser[i].laserBeam.y + laser[i].height <= asteroids[count].image.y) &&
                        laser[i].laserBeam.x < stage.canvas.width - laser[i].width) {

                        scoreboard.score += ADD_SCORE;
                        asteroids[count].reset();
                        laser[i].laserBeam.x = 2000;
                        stage.removeChild(laser[i].laserBeam);
                        stage.removeChild(laser[i]);

                    }
                }
            }
        }
    }
}

// Check Collision with Plane and Cloud
function checkasteroid(aAsteroid: Asteroid) {
    var p1: createjs.Point = new createjs.Point();
    var p2: createjs.Point = new createjs.Point();


    p1.x = spaceship.image.x;
    p1.y = spaceship.image.y;
    p2.x = aAsteroid.image.x;
    p2.y = aAsteroid.image.y;

    if (distance(p2, p1) < ((spaceship.height * 0.5) + (aAsteroid.height * 0.5))) {
        /*if(!(spaceship.image.x >= aAsteroid.image.x + aAsteroid.width
        || spaceship.image.x + spaceship.width <= aAsteroid.image.x
        || spaceship.image.y >= aAsteroid.image.y + aAsteroid.height
        || spaceship.image.y + spaceship.height <= aAsteroid.image.y)) {*/
        scoreboard.lives -= 1;
        aAsteroid.reset(Math.floor((Math.random() * 3) + 1));
    }
}

function collisionCheck() {
    checkLaserCollision();

    for (var count = 1; count < ASTEROID_NUM; count++) {
        //if (asteroids[count].image.x < 300) {
        checkasteroid(asteroids[count]);
        //}
    }
}

function gameStart(): void {
    space = new SpaceBackground();
    spaceship = new SpaceShip();
    for (var count = 1; count < ASTEROID_NUM; count++) {
        asteroids[count] = new Asteroid(Math.floor((Math.random() * 3) + 1));
    }

    scoreboard = new Scoreboard();
}