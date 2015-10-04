//Inspired by: http://www.codeproject.com/Articles/642499/Learn-JavaScript-Part-1-Create-a-Starfield

var Starfield = function(canvas) {
    this.fps = 30;
    this.dt = 1 / this.fps;
    this.canvas = canvas;
    this.numberOfStars = 150;
    this.stars = [];
    this.vmin = 50;
    this.vmax = 75;
 
    this.draw = function() {
        //Clear previous stars
        canvas.ctx.clearRect(0,0, canvas.width, canvas.height);
        
        //Draw the stars
        for(var i=0; i<this.numberOfStars; i++) {
            canvas.ctx.fillStyle = '#FFFFFF';
            canvas.ctx.fillRect(this.stars[i].x, this.stars[i].y, this.stars[i].size, this.stars[i].size);
        }
    }
    
    this.update = function() {        
        for(var i=0; i<this.numberOfStars; i++) {
            this.stars[i].x -= this.dt * this.stars[i].v; //Update the x-positions
            
            if(this.stars[i].x <= 0) { //If the star has reached the side, spawn a new one
                this.stars[i] = new Star(
                    this.canvas.width, //at the left side of the screen, x=0
                    Math.random() * this.canvas.height, //random y-coordinate
                    Math.random() * 3 + 1, //size between 1 and 3
                    Math.floor(Math.random()*this.vmax) + this.vmin // Random value between vmin and vmax
                );
            }
        }
    }
    
    var __construct = function(_this) { //constructor
        //Create the stars
        var stars = [];
        for(var i=0; i<_this.numberOfStars; i++) {
            stars.push(new Star(
                Math.random() * _this.canvas.width, // random x coordinate
                Math.random() * _this.canvas.height, // random y coordinate 
                Math.random() * 3 + 1, // value between 1 & 3
                Math.floor(Math.random()*_this.vmax) + _this.vmin // Random value between vmin and vmax
            ));
        }
        _this.stars = stars;
        
        function render() { 
            setTimeout(function() {
                requestAnimationFrame(render);
                _this.update();
                _this.draw();
            }, 1000 / _this.fps);
        }
        render(); //Start rendering
    }(this);
}

var Star = function(x, y, size, v) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.v = v;
}

var StarfieldCanvas = function(containerdiv) {
    this.width = 0;
    this.height = 0;
    this.ctx = null;
    var __construct = function(_this) { //Constructor function, ES6 not supported        
        _this.width = containerdiv.clientWidth;
        _this.height = containerdiv.clientHeight;
        
        var canvas = document.createElement('canvas');
        canvas.width = _this.width;
        canvas.height = _this.height;
        canvas.style.background = '#0F0F0F';
        _this.ctx = canvas.getContext('2d');
        
        containerdiv.appendChild(canvas);
    }(this);
}

/* Game logic */
var GameCanvas = function(containerdiv) {
    this.width = 0;
    this.height = 0;
    this.ctx = 0;
    var __construct = function(_this) {      
        _this.width = containerdiv.clientWidth;
        _this.height = containerdiv.clientHeight;
        
        var canvas = document.createElement('canvas');
        canvas.width = _this.width;
        canvas.height = _this.height;
        _this.ctx = canvas.getContext('2d');
        
        containerdiv.appendChild(canvas);
    }(this);
}

var Game = function(canvas) {
    this.settings = {
        fps: 30,
        maxNumberOfMeteors: 5,
        meteorSpawnChance: 0.05,
        meteorMinV: 100,
        meteorMaxV: 200
    }
    this.dt = 1 / this.settings.fps;
    this.canvas = canvas;
    this.player = new Player(canvas.width, canvas.height);
    this.objects = { //might add more objects
        rockets: [],
        meteors: []
    };
    //TESTING: sprites
    this.testSprite;
    //this.pressedKey = null    //Old way, max 1 input registered
    this.pressedKeys = [];      //Now: Array to track if multiple keys are being pressed
                                //See http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
    this.draw = function() {
        this.canvas.ctx.beginPath();
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) //reset rect
        this.canvas.ctx.closePath();
        
        //Draw the player(triangle)
        this.canvas.ctx.fillStyle = '#F00';
        var path = new Path2D();
        path.moveTo(this.player.x + this.player.width, this.player.y); //Point of the triangle
        path.lineTo(this.player.x, this.player.y + this.player.width/2); //Bottom of triangle
        path.lineTo(this.player.x, this.player.y - this.player.width/2); //Top of triangle
        this.canvas.ctx.fill(path);
        
        //Draw the rockets
        for(var i=0; i<this.objects.rockets.length; i++) {
            var path = this.canvas.ctx;
            path.strokeStyle = '#F00';
            path.beginPath();
            path.moveTo(this.objects.rockets[i].x, this.objects.rockets[i].y);
            path.lineTo(this.objects.rockets[i].x + this.objects.rockets[i].width, this.objects.rockets[i].y);
            path.stroke();
            path.closePath();
        }
        
        //Draw the meteors
        for(var i=0; i<this.objects.meteors.length; i++) {
            var path = this.canvas.ctx;
            path.fillStyle = '#371C00';
            path.arc(
                this.objects.meteors[i].x, //x of center
                this.objects.meteors[i].y, //y of center
                this.objects.meteors[i].radius, //radius
                0, //starting angle (in rad)
                2*Math.PI, //ending angle
                false //counterclokcwise = false
            );
            path.fill();
            path.closePath();
        }
        
        //spritetests
        var ctx = this.canvas.ctx;
        ctx.drawImage(
            this.testSprite.img,
            0,
            0,
            this.testSprite.width,
            this.testSprite.height,
            100,
            100,
            this.testSprite.width,
            this.testSprite.height
        );
    }
    
    this.update = function() {
        //Player input
        if(this.pressedKeys[38] || this.pressedKeys[90]) { //Arrow up or Z
            this.player.moveUp();
        } 
        if(this.pressedKeys[40] || this.pressedKeys[83]) { //Arrow down or S
            this.player.moveDown();
        }
        if(this.pressedKeys[37] || this.pressedKeys[81]) { //Arrow left or Q
            this.player.moveLeft();
        }
        if(this.pressedKeys[39] || this.pressedKeys[68]) { //Arrow right or D
            this.player.moveRight();
        }
        if(this.pressedKeys[32]) { //space
            //fire: create rocket at player
            //Todo: limit firerate
            this.objects.rockets.push(new Rocket(
                this.player.x + this.player.width, //x of the top of the triangle
                this.player.y, //y
                1000, //velocity ToDo: set default velocity
                50 //damage
            ));
        }
        
        //Update rocket positions
        for(var i=0; i<this.objects.rockets.length; i++) { 
            this.objects.rockets[i].x += this.dt * this.objects.rockets[i].v; //update x, y doesn't change
            
            if(this.objects.rockets[i].x >= this.canvas.width) { //Rocket exits field
                //Splice(index, amount)
                //Set i-- to adjust for the spliced rocket
                this.objects.rockets.splice(i--, 1);  
            }
        }
        
        //Spawn meteors        
        if(this.objects.meteors.length < this.settings.maxNumberOfMeteors) { //Check for max number
            var r = Math.random();
            if(r < this.settings.meteorSpawnChance) { 
                this.objects.meteors.push(new Meteor(
                    this.canvas.width, //Spawn at right side
                    Math.random() * this.canvas.height, //random y
                    Math.floor(Math.random()*this.settings.meteorMaxV) + this.settings.meteorMinV, //velocity brtween vmin & vmax
                    25, //radius
                    100 //hp
                ));
            }
        }
        
        //Update meteor positions
        for(var i=0; i<this.objects.meteors.length; i++) {
            this.objects.meteors[i].x -= this.dt * this.objects.meteors[i].v;
            
            if(this.objects.meteors[i].x <= 0) { //Meteor exits field
                //Splice(index, amount)
                //Set i-- to adjust for the spliced meteor
                this.objects.meteors.splice(i--, 1);  
            }
        }
    }
    
    var __construct = function(_this){
        //Add sprites
        var testSpriteImg = new Image();
        testSpriteImg.src = "images/ship.png";
        
        var testSprite = sprite({
            width: 45,
            height: 31,
            img: testSpriteImg
        })
        
        _this.testSprite = testSprite;
        console.log(testSprite);
        
        
        
        
        function render() {
            setTimeout(function() {
                requestAnimationFrame(render);
                _this.update();
                _this.draw();
            }, 1000 / _this.settings.fps);
        }
        render();
    }(this)
}

var Player = function(gameWidth, gameHeight) {
    this.fps = 30;
    this.dt = 1 / this.fps;
    this.lives = 3;
    this.width = 80;
    this.x = 100;
    this.y = 100;
    this.v = 500;
    this.moveUp = function() {
        this.y -= this.dt * this.v;
        if(this.y <= this.width/2) { //Stop when top is reached
            this.y = this.width/2;
        }
    }
    this.moveDown = function() {
        this.y += this.dt * this.v;
        if(this.y >= gameHeight - this.width/2) { //Stop when bottom is reached
            this.y = gameHeight - this.width/2;
        }
    }
    this.moveLeft = function() {
        this.x -= this.dt * this.v;
        if(this.x <= 0) { //Stop when left side is reached
            this.x = 0;
        }
    }
    this.moveRight = function() {
        this.x += this.dt * this.v;
        if(this.x >= gameWidth - this.width) { //Stop when right side is reached
            this.x = gameWidth - this.width;
        }
    }
}

var Rocket = function(x, y, v, damage) {
    this.x = x;
    this.y = y;
    this.v = v;
    this.width = 15; //Default width
    this.damage = damage;
}

var Meteor = function(x, y, v, radius, health) {
    this.x = x;
    this.y = y;
    this.v = v;
    this.radius = radius;
    this.health = health;
}

var TestSprite = function(sprite, x, y) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.width = sprite.width;
    this.height = sprite.height;
}

function sprite(options) {
    var output = {};
    
    output.width = options.width;
    output.height = options.height;
    output.img = options.img;
    
    return output;
}

window.onload = function() {
    var starfielddiv = document.getElementById('starfield');
    var starfield = new Starfield(new StarfieldCanvas(starfielddiv));
    
    var gamediv = document.getElementById('game');
    var game = new Game(new GameCanvas(gamediv));
    
    
    
    //Handle Input
    document.addEventListener('keydown', onkeydown, false);
    document.addEventListener('keyup', onkeyup, false);

    function onkeydown(e) {
        game.pressedKeys[e.keyCode] = true; //Sets the keycode
        e.preventDefault();
    }

    function onkeyup(e) {
        delete game.pressedKeys[e.keyCode]; //Offsets the keycode
        e.preventDefault();
    }
}
