var stage;
var queue;
var hasShot = false;

// game objects
var space;
var spaceship;

//var island: Island;
//var clouds = [];
var scoreboard;

// game constants
var CLOUD_NUM = 3;
var PLAYER_LIVES = 3;
var GAME_FONT = "40px Consolas";
var FONT_COLOUR = "#FFFF00";
var Y_OFFSET = 15;
var LASER_SPEED = 20;

// Preload function
function preload() {
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
        { id: "cloud", src: "images/cloud.png" },
        { id: "space", src: "images/spacebackground.png" },
        { id: "yay", src: "sounds/yay.ogg" },
        { id: "thunder", src: "sounds/thunder.ogg" }
    ]);
}

function init() {
    stage = new createjs.Stage(document.getElementById("canvas"));
    stage.enableMouseOver(20);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", gameLoop);
    gameStart();
}

// Game Loop
function gameLoop(event) {
    space.update();
    spaceship.update();

    //for (var count = 0; count < CLOUD_NUM; count++) {
    //clouds[count].update();
    //}
    //collisionCheck();
    scoreboard.update();

    stage.update();
}

/*
* SpaceShip Class, the player controls this spaceship
*/
var SpaceShip = (function () {
    function SpaceShip() {
        this.animTimer = 0;
        this.laserCounter = 0;
        this.thrusterAnimImage = new createjs.Bitmap(queue.getResult("thrusteranim1"));
        this.image = new createjs.Bitmap(queue.getResult("spaceship"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.image.x = 60;
        this.thrusterAnimImage.x = 11;
        stage.addChild(this.image);
        stage.on("click", this.shootLaser, this);
    }
    SpaceShip.prototype.shootLaser = function () {
        this.laserCounter++;
        if (event.button == 0) {
            if (!hasShot) {
                this.laserShot = new createjs.Bitmap(queue.getResult("shoot"));
                this.laserShot = new createjs.Bitmap(queue.getResult("shoot"));
                this.laserShot.y = stage.mouseY - Y_OFFSET;
                this.laserShot.x = this.image.x + Y_OFFSET;

                stage.addChild(this.laserShot);
                stage.update();
                hasShot = true;
            }
        }
    };
    SpaceShip.prototype.update = function () {
        if (hasShot) {
            this.laserShot.x += LASER_SPEED;
            if (this.laserShot.x > 600) {
                stage.removeChild(this.laserShot);
                hasShot = false;
            }
        }
        this.animTimer += 1;
        if (this.animTimer % 2 == 0) {
            stage.removeChild(this.thrusterAnimImage);
            this.thrusterAnimImage = new createjs.Bitmap(queue.getResult("thrusteranim1"));
            this.thrusterAnimImage.x = 11;
            stage.addChild(this.thrusterAnimImage);
        } else if (this.animTimer % 3 == 0) {
            stage.removeChild(this.thrusterAnimImage);
            this.thrusterAnimImage = new createjs.Bitmap(queue.getResult("thrusteranim2"));
            this.thrusterAnimImage.x = this.image.x + this.thrusterAnimImage.getBounds().x;
            this.thrusterAnimImage.x = 11;
            stage.addChild(this.thrusterAnimImage);
            this.animTimer = 0;
        } else {
            stage.removeChild(this.thrusterAnimImage);
            this.thrusterAnimImage = new createjs.Bitmap(queue.getResult("thrusteranim3"));
            this.thrusterAnimImage.x = 11;
            stage.addChild(this.thrusterAnimImage);
        }
        this.image.y = stage.mouseY;
        this.thrusterAnimImage.y = this.image.y - 18;
    };
    return SpaceShip;
})();

// Island Class
var Island = (function () {
    function Island() {
        this.image = new createjs.Bitmap(queue.getResult("island"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.dy = 5;
        stage.addChild(this.image);
        this.reset();
    }
    Island.prototype.reset = function () {
        this.image.y = -this.height;
        this.image.x = Math.floor(Math.random() * stage.canvas.width);
    };

    Island.prototype.update = function () {
        this.image.y += this.dy;
        if (this.image.y > (this.height + stage.canvas.height)) {
            this.reset();
        }
    };
    return Island;
})();

// Island Class
var Cloud = (function () {
    function Cloud() {
        this.image = new createjs.Bitmap(queue.getResult("cloud"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;

        stage.addChild(this.image);
        this.reset();
    }
    Cloud.prototype.reset = function () {
        this.image.y = -this.height;
        this.image.x = Math.floor(Math.random() * stage.canvas.width);
        this.dy = Math.floor(Math.random() * 5 + 5);
        this.dx = Math.floor(Math.random() * 4 - 2);
    };

    Cloud.prototype.update = function () {
        this.image.y += this.dy;
        this.image.x += this.dx;
        if (this.image.y > (this.height + stage.canvas.height)) {
            this.reset();
        }
    };
    return Cloud;
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
    SpaceBackground.prototype.reset = function () {
        this.image.x = -this.width + stage.canvas.width;
    };

    SpaceBackground.prototype.update = function () {
        this.image.x += this.dx;
        if (this.image.x >= 0) {
            this.reset();
        }
    };
    return SpaceBackground;
})();

// Scoreboard Class
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

// Check Collision with Plane and Island
/*function planeAndIsland() {
var p1: createjs.Point = new createjs.Point();
var p2: createjs.Point = new createjs.Point();
p1.x = spaceship.image.x;
p1.y = spaceship.image.y;
p2.x = island.image.x;
p2.y = island.image.y;
if (distance(p1, p2) <= ((spaceship.height * 0.5) + (island.height * 0.5))) {
createjs.Sound.play("yay");
scoreboard.score += 100;
island.reset();
}
}
// Check Collision with Plane and Cloud
function planeAndCloud(theCloud: Cloud) {
var p1: createjs.Point = new createjs.Point();
var p2: createjs.Point = new createjs.Point();
var cloud: Cloud = new Cloud();
cloud = theCloud;
p1.x = spaceship.image.x;
p1.y = spaceship.image.y;
p2.x = cloud.image.x;
p2.y = cloud.image.y;
if (distance(p1, p2) <= ((spaceship.height * 0.5) + (cloud.height * 0.5))) {
createjs.Sound.play("thunder");
scoreboard.lives -= 1;
cloud.reset();
}
}
function collisionCheck() {
planeAndIsland();
for (var count = 0; count < CLOUD_NUM; count++) {
planeAndCloud(clouds[count]);
}
}
*/
function gameStart() {
    space = new SpaceBackground();
    spaceship = new SpaceShip();

    //for (var count = 0; count < CLOUD_NUM; count++) {
    //  clouds[count] = new Cloud();
    //}
    scoreboard = new Scoreboard();
}
//# sourceMappingURL=game.js.map
