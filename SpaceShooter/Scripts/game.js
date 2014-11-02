var stage;
var queue;

// game objects
var plane;
var island;
var clouds = [];
var ocean;
var scoreboard;

// game constants
var CLOUD_NUM = 3;
var PLAYER_LIVES = 3;
var GAME_FONT = "40px Consolas";
var FONT_COLOUR = "#FFFF00";

// Preload function
function preload() {
    queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", init);
    queue.loadManifest([
        { id: "plane", src: "images/plane.png" },
        { id: "island", src: "images/island.png" },
        { id: "cloud", src: "images/cloud.png" },
        { id: "ocean", src: "images/ocean.gif" },
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
    ocean.update();
    island.update();
    plane.update();

    for (var count = 0; count < CLOUD_NUM; count++) {
        clouds[count].update();
    }

    collisionCheck();

    scoreboard.update();

    stage.update();
}

// Plane Class
var Plane = (function () {
    function Plane() {
        this.image = new createjs.Bitmap(queue.getResult("plane"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.image.x = 430;

        stage.addChild(this.image);
    }
    Plane.prototype.update = function () {
        this.image.y = stage.mouseY;
    };
    return Plane;
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

// Ocean Class
var Ocean = (function () {
    function Ocean() {
        this.image = new createjs.Bitmap(queue.getResult("ocean"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.dy = 5;
        stage.addChild(this.image);
        this.reset();
    }
    Ocean.prototype.reset = function () {
        this.image.y = -this.height + stage.canvas.height;
    };

    Ocean.prototype.update = function () {
        this.image.y += this.dy;
        if (this.image.y >= 0) {
            this.reset();
        }
    };
    return Ocean;
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
function planeAndIsland() {
    var p1 = new createjs.Point();
    var p2 = new createjs.Point();

    p1.x = plane.image.x;
    p1.y = plane.image.y;
    p2.x = island.image.x;
    p2.y = island.image.y;

    if (distance(p1, p2) <= ((plane.height * 0.5) + (island.height * 0.5))) {
        createjs.Sound.play("yay");
        scoreboard.score += 100;
        island.reset();
    }
}

// Check Collision with Plane and Cloud
function planeAndCloud(theCloud) {
    var p1 = new createjs.Point();
    var p2 = new createjs.Point();
    var cloud = new Cloud();

    cloud = theCloud;

    p1.x = plane.image.x;
    p1.y = plane.image.y;
    p2.x = cloud.image.x;
    p2.y = cloud.image.y;

    if (distance(p1, p2) <= ((plane.height * 0.5) + (cloud.height * 0.5))) {
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

function gameStart() {
    ocean = new Ocean();
    island = new Island();
    plane = new Plane();

    for (var count = 0; count < CLOUD_NUM; count++) {
        clouds[count] = new Cloud();
    }

    scoreboard = new Scoreboard();
}
//# sourceMappingURL=game.js.map
