/********************
 *                  *
 *     BG LOGIC     *
 *                  *
 ********************/
var Starfield = function(canvas) {
    //Inspired by: http://www.codeproject.com/Articles/642499/Learn-JavaScript-Part-1-Create-a-Starfield
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

/********************
 *                  *
 *    GAME LOGIC    *
 *                  *
 ********************/

var GameCanvas = function(containerdiv) {
    this.width = 0;
    this.height = 0;
    this.ctx = 0;
    var __construct = function(_this) {      
        _this.width = containerdiv.clientWidth;
        _this.height = containerdiv.clientHeight;
        
        var canvas = document.createElement('canvas');
        canvas.className = 'gameCanvas';
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
        meteorMaxV: 200,
        meteorWidth: 64
    }
    this.meteorSprites = [];
    this.dt = 1 / this.settings.fps;
    this.canvas = canvas;
    this.player;
    this.objects = { //might add more objects
        rockets: [],
        meteors: []
    };
    //this.pressedKey = null    //Old way, max 1 input registered
    this.pressedKeys = [];      //Now: Array to track if multiple keys are being pressed
                                //See http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
    this.clicked = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.draw = function() {
        this.canvas.ctx.beginPath();
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) //reset rect
        this.canvas.ctx.closePath();
        
        //Draw the player
        this.canvas.ctx.drawImage(
            this.player.sprite, //Image
            0, //src x
            0, ///src y
            this.player.width, //src width
            this.player.height, //src height,
            this.player.x, //x
            this.player.y, //y
            this.player.width, //Destination width
            this.player.height //Destination height
        );
        
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
            var meteor = this.objects.meteors[i]; //Create temp var
            this.canvas.ctx.drawImage(
                meteor.sprite, //Image
                0, //src x
                0, ///src y
                meteor.width, //src width
                meteor.height, //src height,
                meteor.x, //x
                meteor.y, //y
                meteor.width*2, //Destination width
                meteor.height*2 //Destination height
            );
        }
    }
    
    this.update = function() {
        //Player input
        if(!this.clicked) { //To prevent 2x speed when using both inputs --ToDo: add desired controls in settings
            //Keyboard movement
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
        } else { //Mouse movement
            this.player.moveTo(this.mouseX, this.mouseY);
        }
        
        if(this.pressedKeys[32]) { //space
            //fire: create rocket at player
            //Todo: limit firerate
            this.objects.rockets.push(new Rocket(
                this.player.x + this.player.width/2, //x at the right side of the player
                this.player.y + this.player.height/2, //y at center of player
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
                    this.meteorSprites[Math.floor(Math.random()*this.meteorSprites.length)],
                    this.canvas.width, //Spawn at right side
                    (Math.random() * this.canvas.height +this.settings.meteorWidth) - this.settings.meteorWidth, //random y
                    Math.floor(Math.random()*this.settings.meteorMaxV) + this.settings.meteorMinV, //velocity brtween vmin & vmax
                    this.settings.meteorWidth, //meteor width
                    this.settings.meteorWidth, //Height (=width)
                    100 //hp
                ));
            }
        }
        
        //Update meteor positions
        for(var i=0; i<this.objects.meteors.length; i++) {
            this.objects.meteors[i].x -= this.dt * this.objects.meteors[i].v;
            
            if(this.objects.meteors[i].x <= -100) { //Meteor exits field; the -100 is a quick fix until the sprites are adjusted
                //Splice(index, amount)
                //Set i-- to adjust for the spliced meteor
                this.objects.meteors.splice(i--, 1);  
            }
        }
    }
    
    var __construct = function(_this){
        //Add sprites
        var playerSprite = new Image();
        playerSprite.src = "images/ship.png"; //img source: http://opengameart.org/content/spaceship-9
         _this.player = new Player(playerSprite, canvas.width, canvas.height);
        
        //Meteors src=http://opengameart.org/content/asteroids
        //ToDO: make spritesheet
        var meteorSprite1 = new Image();
        meteorSprite1.src = "images/asteroids/1.png";
        _this.meteorSprites.push(meteorSprite1);
        
        var meteorSprite2 = new Image();
        meteorSprite2.src = "images/asteroids/2.png";
        _this.meteorSprites.push(meteorSprite2);
        
        var meteorSprite3 = new Image();
        meteorSprite3.src = "images/asteroids/3.png";
        _this.meteorSprites.push(meteorSprite3);
        
        var meteorSprite4 = new Image();
        meteorSprite4.src = "images/asteroids/4.png";
        _this.meteorSprites.push(meteorSprite4);
        
        var meteorSprite5 = new Image();
        meteorSprite5.src = "images/asteroids/5.png";
        _this.meteorSprites.push(meteorSprite5);
        

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

var Player = function(sprite, gameWidth, gameHeight) {
    //!Player coordinates are measured from the top left corner
    this.sprite = sprite,
    this.fps = 30;
    this.dt = 1 / this.fps;
    this.lives = 3;
    this.width = 31;
    this.height = 45;
    this.x = 100; //Start x-coordinate  
    this.y = gameHeight/2 - this.height/2; //Start y-coordinate (Center) 
    this.v = 500;
    this.moveUp = function() {
        this.y -= this.dt * this.v;
        if(this.y <= 0) { //Stop when top is reached
            this.y = 0;
        }
    }
    this.moveDown = function() {
        this.y += this.dt * this.v;
        if(this.y >= gameHeight - this.height) { //Stop when bottom is reached
            this.y = gameHeight - this.height;
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
    this.moveTo = function(x, y) {
        //For mousecontrol
        var centerx = this.x + this.width/2; //Get the center of the player (x)
        var centery = this.y + this.height/2; //Get the center of the player (y)
        //Vector calculations        
        var deltaX = x - centerx;
        var deltaY = y - centery;
        var moveRight = (deltaX < 0) ? true : false; //Determine the direction for x-axis
        var moveDown = (deltaY < 0) ? true : false; //y-axis
        var rad = Math.atan2(deltaY, deltaX); //ArcTan2: gives the vector angle in radians
        var v_x = this.v * Math.cos(rad); //Get the horizontal component
        var v_y = this.v * Math.sin(rad); //Get the vertical component;
        
        this.x += this.dt * v_x; //move along the x-axis
        if((moveRight && (this.x+this.width/2) <= x) || (!moveRight && (this.x+this.width/2) >= x)) {
            //Check the direction along the x-axis && whether the current x-value is left or right of the target x-value
            //This is done to prevent stuttering when the mouse is on the ship
            this.x = x - this.width/2; //x value adjusted for the center
        }
        
        this.y += this.dt * v_y; //Move along the y-axis
        //See above
        if((moveDown && (this.y+this.height/2) <= y) || (!moveDown && (this.y+this.height/2) >= y)) {
            this.y = y - this.height/2;
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

var Meteor = function(sprite, x, y, v, width, height, health) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.v = v;
    this.width = width;
    this.height = height;
    this.health = health;
}


window.onload = function() {
    var starfielddiv = document.getElementById('starfield');
    var starfield = new Starfield(new StarfieldCanvas(starfielddiv));
    
    var gamediv = document.getElementById('game');
    var game = new Game(new GameCanvas(gamediv));
        
    //Handle Input
    //Keyboard
    document.addEventListener('keydown', onkeydown, false);
    document.addEventListener('keyup', onkeyup, false);
    //Mouse
    var cv = document.querySelector('.gameCanvas');
    cv.addEventListener('mousedown', mousedown, false);
    cv.addEventListener('mouseup', mouseup, false);
    cv.addEventListener('mousemove', mousemove, false);

    function onkeydown(e) {
        game.pressedKeys[e.keyCode] = true; //Sets the keycode
        e.preventDefault();
    }

    function onkeyup(e) {
        delete game.pressedKeys[e.keyCode]; //Offsets the keycode
        e.preventDefault();
    }
    
    function mousedown(e) {
        game.clicked = true;
    }
    function mouseup(e) {
        game.clicked = false;
    }
    function mousemove(e) {
        game.mouseX = e.clientX;
        game.mouseY = e.clientY;
    }
}
