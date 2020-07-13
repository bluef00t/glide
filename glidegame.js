/* Code by 0. "bluef00t" Blaufuss
    July 2020
    */
    var sketchProc = function(processingInstance) {
     with (processingInstance) {
        
        //commenting out KA's beautiful smiley man
        /*fill(255, 255, 0);
        ellipse(200, 200, 200, 200);
        noFill();
        stroke(0, 0, 0);
        strokeWeight(2);
        arc(200, 200, 150, 100, 0, PI);
        fill(0, 0, 0);
        ellipse(250, 200, 10, 10);
        ellipse(153, 200, 10, 10);*/

        //Main game variables
        var levelNum = 0;
        var side = 400;//EVERYTHING SCALES TO GAME SIZE
        size(side, side); 
        frameRate(30);
        //drawing control variables
        var wallWidth = side/80;
        var meSpeed = 8;

        var unit = side/10 + wallWidth;
        

        //enum of directions, helpful for readable code
        const moving = {
            NO: "no",
            UP: "up",
            DOWN: "down",
            LEFT: "left",
            RIGHT: "right"
        }

        //attempt at getting keypressed to work
        var KEYS_RANGE = 0500;
        var keysDown = [];
        var keyPressed = function() {
            setKey(keyCode, true);
            //println("keyPressed = " + keyCode);
            //println(isDown(keyCode));
        }

        var keyReleased = function() {
            setKey(keyCode, false);
            //println("keyReleased = " + keyCode);
            //println(isDown(keyCode));
        }

        var setKey = function(k, isDown) {
            if (k < KEYS_RANGE)  keysDown[k] = isDown;
        }

        var keyIsDown = function(k){
             if (k < KEYS_RANGE)  return keysDown[k];
        }


        var me = {
            x:side/2,
            y:side/2,
            width: unit*0.8,
            direction: moving.NO,
            draw: function(){
                fill(255, 255, 0);
                //console.log(this.x + this.width/2 + ", "+ this.y+ this.width/2+ ", " + this.width+ ", "+this.width);
                //x and y represent center of smiley
                //based on the KA default smiley; scales with width
                stroke(0, 0, 0);
                strokeWeight(2);
                ellipse(this.x, this.y, this.width, this.width);
                noFill();
                arc(this.x, this.y + this.width/10, this.width/1.5, this.width/2, 0, PI);
                fill(0, 0, 0);
                ellipse(this.x - this.width/4, this.y - this.width/8, this.width/10, this.width/10);
                ellipse(this.x + this.width/4, this.y - this.width/8, this.width/10, this.width/10);
            },
            handleCollisions: function(level){
                //if touching wall, stop moving (and move to a position where no longer touching the wall, to enable future movement)
                for(var i = 0; i<level.walls.length; i++){
                    var thisWall = level.walls[i];
                    if(thisWall.touchesMe()){
                        //println(thisWall.touchesMe());
                        switch(this.direction){//move backwards one step to avoid clipping wall
                            case moving.UP: me.y = me.y +meSpeed; break;
                             case moving.DOWN: me.y = me.y -meSpeed; break;
                              case moving.LEFT: me.x = me.x +meSpeed; break;
                               case moving.RIGHT: me.x = me.x -meSpeed; break;
                        }
                        this.direction = moving.NO;
                        break;
                    }
                }
            }
        }

        var Wall = function(config){
            this.isHoriz = config.isHoriz || false;
            this.x = config.x || unit*5;
            this.y = config.y || unit*5;
            this.height = config.height || unit/10;

            //returns boolean: true if smiley is touching wall
            this.touchesMe = function(){
                var r = wallWidth/2 + me.width/2;//radius of smiley
                if (this.isHoriz){//calculation of distance from wall horizontal
                    if (me.x < this.x + this.height/2 &&
                        me.x > this.x - this.height/2){//if inside the X plane of the line
                        //println("within x  of horizontal line");
                        //println(dist(0, me.y, 0, this.y) + ", " + r);
                        if (dist(0, me.y, 0, this.y) < r){
                            return true;
                        }
                        return false;
                    }
                }else{//calculation of distance from wall vertical
                     if (me.y < this.y + this.height/2 &&
                        me.y > this.y - this.height/2){
                        if (dist(me.x, 0, this.x, 0) < r) {
                            return true;
                        }
                        return false;
                    }
                }
                return false;//else return false
            };

            this.draw = function(){
                noStroke();
                fill(0,0,0);
                if(this.isHoriz){
                    //console.log(this.x + ", " +this.y + ", " + this.height + ", " +wallWidth);
                     rect(this.x, this.y, this.height, wallWidth);
                }else{
                    //console.log("vertical")
                    rect(this.x, this.y, wallWidth, this.height);
                }
            }
        }

        var Level = function(config){
            this.coins = config.coins || [];
            this.startX = config.startX || unit/2;
            this.startY = config.startY || unit/2;
            this.finishX = config.finishX || side-unit;
            this.finishY = config.finishY || side-unit;
            this.enemies = config.enemies || [];
            this.walls = config.walls || [];
            //TODO later: implement level colors

            this.init = function(){
                me.x = this.startX;
                me.y = this.startY;
            }
            
            this.draw = function(){
                background(180,180,180);
                //render walls
                rectMode(CENTER);
                for(var i=0; i < this.walls.length; i++){
                    this.walls[i].draw();
                }
                //render end box
                rectMode(CORNER);
                fill(0,0,0);
                rect(this.finishX, this.finishY, unit, unit, 1);
                
            }
        }

        //walls code which defines a bounding box
        /*
         walls:[new Wall({x:1, y:side/2, height:side}), new Wall({x:side/2, y:1, height:side, isHoriz:true}), new Wall({x:side-1, y:side/2, height:side}), new Wall({x:side/2, y:side-1, height:side, isHoriz:true})]
         */
        var L1 = new Level({
            walls:[new Wall({x:1, y:side/2, height:side}), new Wall({x:side/2, y:1, height:side, isHoriz:true}), new Wall({x:side-1, y:side/2, height:side}), new Wall({x:side/2, y:side-1, height:side, isHoriz:true}),
            new Wall({x:side/2, y:unit, height:2*unit}), new Wall({x:side/2, y:side-unit, height:2*unit}), 
            new Wall({y:side/2, x:unit, height:2*unit, isHoriz:true}), new Wall({y:side/2, x:side-unit, height:2*unit, isHoriz:true}),
            new Wall({y:side/2 + unit, x:side/2, height:2*unit, isHoriz:true})
            ]
        });
        L1.init();
        L1.draw();
        me.draw();

        //every frame drawn here
        draw = function(){
            L1.draw();
            //println(keyCode + ", " + isDown(keyCode));
            if (keyIsDown(keyCode) && me.direction === moving.NO){
                switch (keyCode){
                    case UP: me.direction = moving.UP; break;
                     case DOWN: me.direction = moving.DOWN; break;
                      case LEFT: me.direction = moving.LEFT; break;
                       case RIGHT: me.direction = moving.RIGHT; break;
                }
                //console.log(me.direction);
            }
            me.handleCollisions(L1);
            switch(me.direction){
                case moving.UP: me.y = me.y -meSpeed; break;
                 case moving.DOWN: me.y = me.y +meSpeed; break;
                  case moving.LEFT: me.x = me.x -meSpeed; break;
                   case moving.RIGHT: me.x = me.x +meSpeed; break;
            }
            me.draw();
        }
    }};

    // Get the canvas that Processing-js will use
    var canvas = document.getElementById("mycanvas"); 
    // Pass the function sketchProc (defined in myCode.js) to Processing's constructor.
    var processingInstance = new Processing(canvas, sketchProc); 