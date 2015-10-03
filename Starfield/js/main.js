//Inspired by: http://www.codeproject.com/Articles/642499/Learn-JavaScript-Part-1-Create-a-Starfield

var Starfield = function(canvas) {
    this.fps = 30;
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
        
        var dt = 1 / this.fps; //Amount of time passed (s)
        for(var i=0; i<this.numberOfStars; i++) {
            this.stars[i].x -= dt * this.stars[i].v; //Update the x-positions
            
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
    this.fps = 30;
    this.canvas = canvas;
    this.player = new Player(canvas.width, canvas.height);
    this.objects = {
        rockets: []    
    },
    //this.pressedKey = null    //Old way, max 1 input registered
    this.pressedKeys = [];      //Array to track if multiple keys are being pressed
                                //See http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
    this.draw = function() {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) //reset
        
        this.canvas.ctx.fillStyle = '#F00';
        
        var path = new Path2D();
        path.moveTo(this.player.x + this.player.width, this.player.y); //Point of the triangle
        path.lineTo(this.player.x, this.player.y + this.player.width/2); //Bottom of triangle
        path.lineTo(this.player.x, this.player.y - this.player.width/2); //Top of triangle
        this.canvas.ctx.fill(path);
    }
    this.update = function() {
        //Player movement
        if(this.pressedKeys[38]) {
            this.player.moveUp();
        } 
        if(this.pressedKeys[40]) {
            this.player.moveDown();
        }
        if(this.pressedKeys[37]) {
            this.player.moveLeft();
        }
        if(this.pressedKeys[39]) {
            this.player.moveRight();
        }
    }
    
    var __construct = function(_this){
        
        function render() {
            setTimeout(function() {
                requestAnimationFrame(render);
                _this.update();
                _this.draw();
            }, 1000 / _this.fps);
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
    this.v = 200;
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
        if(this.x <= 0) {
            this.x = 0;
        }
    }
    this.moveRight = function() {
        this.x += this.dt * this.v;
        if(this.x >= gameWidth - this.width) {
            this.x = gameWidth - this.width;
        }
    }
    this.fire = function() {
        
    }
}

var Rocket = function(x, y, v, damage) {
    this.x = x;
    this.y = y;
    this.v = v;
    this.damage = damage;
}







window.onload = function() {
    var starfielddiv = document.getElementById('starfield');
    var starfield = new Starfield(new StarfieldCanvas(starfielddiv));
    
    var gamediv = document.getElementById('game');
    var game = new Game(new GameCanvas(gamediv));
    
    
    
    //Handle Input
    document.addEventListener('keydown',    onkeydown,    false);
    document.addEventListener('keyup',      onkeyup,      false);

    function onkeydown(e) {
        game.pressedKeys[e.keyCode] = true; //Sets the keycode
        e.preventDefault();
    }

    function onkeyup(e) {
        delete game.pressedKeys[e.keyCode]; //Offsets the keycode
        e.preventDefault();
    }
}


