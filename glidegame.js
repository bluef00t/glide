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
        //display variables
        size(side, side); 
        frameRate(30);
        //drawing control variables
        var wallWidth = side/80;
        var meSpeed = side/50;
        var endText = "";

        var unit = (side - wallWidth*11)/10;
        var levelDone = false;

        var endY = side/2 - unit;
        var endHeight = 3*unit;
        

        //enum of directions, helpful for readable code
        const moving = {
            NO: "no",
            UP: "up",
            DOWN: "down",
            LEFT: "left",
            RIGHT: "right"
        }

        //keeping track of when keypressed
        //(thank you u/GoSubRoutine from r/processing!)
        var KEYS_RANGE = 0500;
        var keysDown = [];
        var keyPressed = function() {
            setKey(keyCode, true);
        }

        var keyReleased = function() {
            setKey(keyCode, false);
        }

        var setKey = function(k, isDown) {
            if (k < KEYS_RANGE)  keysDown[k] = isDown;
        }

        var keyIsDown = function(k){
             if (k < KEYS_RANGE)  return keysDown[k];
        }

        //TOOD: wallgrid and itemgrid functions to 
        var wallGrid = function(coord){
            return coord*(unit+wallWidth) + wallWidth/2;
        }

        var itemGrid = function(coord){
            return (coord + 0.5)*(unit+wallWidth) + wallWidth/2;
        }

        // walls:[new Wall({x:1, y:side/2, height:side}),
        //new Wall({x:side/2, y:1, height:side, isHoriz:true}), 
        //new Wall({x:side-1, y:side/2, height:side}), 
        //new Wall({x:side/2, y:side-1, height:side, isHoriz:true})]

        //to

        // walls:[new Wall({x:0, y:5, height:side}),


        var me = {
            x:side/2,
            y:side/2,
            width: unit*0.75,
            direction: moving.NO,
            draw: function(){
                //x and y represent center of smiley
                //based on the KA default smiley; scales with width
                fill(255, 255, 0);
                stroke(0, 0, 0);
                strokeWeight(2);
                ellipse(this.x, this.y, this.width, this.width);
                noFill();
                arc(this.x, this.y + this.width/10, this.width/1.5, this.width/2, 0, PI);
                fill(0, 0, 0);
                ellipse(this.x - this.width/4, this.y - this.width/8, this.width/10, this.width/10);
                ellipse(this.x + this.width/4, this.y - this.width/8, this.width/10, this.width/10);
            },
            touchesEnd: function(level){
                if(dist(me.x, me.y, level.finishX + unit/2, level.finishY + unit/2) < this.width/2){
                    return true;
                }
                return false;
            },
            collectCoins: function(coins){//if touching a coin, collect it
                 for(var i = 0; i<coins.length; i++){
                    var thisCoin = coins[i];
                    if(!thisCoin.collected && thisCoin.touchesMe()){
                        thisCoin.collected = true;
                    }
                }
            },
            handleCollision: function(walls){//if touching wall, stop moving (and move to a position where no longer touching the wall, to enable future movement)
                for(var i = 0; i<walls.length; i++){
                    var thisWall = walls[i];
                    while(thisWall.touchesMe()){
                        //println("touching me, now going " + this.direction);
                        var tolerance = 2; //how close to get to the wall
                        switch(this.direction){//inch away until fixed
                            case moving.UP: me.y = me.y +tolerance; break;
                             case moving.DOWN: me.y = me.y -tolerance; break;
                              case moving.LEFT: me.x = me.x +tolerance; break;
                               case moving.RIGHT: me.x = me.x -tolerance; break;
                        }
                        if(!thisWall.touchesMe()){//the last time, stop moving
                            this.direction = moving.NO;
                            break;
                        }
                    }
                }
            },
            update: function(level){
                this.handleCollision(level.walls);
                this.collectCoins(level.coins);
                if(this.touchesEnd(level)){//trigger win condition
                    levelDone = true;
                    me.direction = moving.NO;
                    me.x = side/2;
                    me.y = side/2;
                    var n = 0;
                    for (var i = 0; i<level.coins.length; i++){
                        if (level.coins[i].collected) n++;
                    }
                    textSize(unit/2);
                    text("< BACK", wallWidth, endY-unit, unit*2, unit);
                    text("NEXT >", side-unit*2, endY-unit, unit*2, unit);
                    endText = "You collected " + n + " out of " + level.coins.length + " coins.";
                }
            }
        }

        var Coin = function(config){
            this.collected = false;
            this.x = config.x || unit*5;
            this.y = config.y || unit*5;
            this.coinSize = unit/2;
            this.touchesMe = function(){
                var r = me.width/2 + this.coinSize/2;
                //println(dist(me.x, me.y, this.x, this.y) + ", " + r);
                if(dist(me.x, me.y, this.x, this.y) < r){
                    return true;
                }
                return false;
            };
            this.draw = function(){
                fill(255, 255, 0);
                stroke(0, 0, 0);
                strokeWeight(2);
                ellipse(this.x, this.y, this.coinSize * 0.7, this.coinSize);
                ellipse(this.x - unit/10, this.y, this.coinSize * 0.7, this.coinSize);
            }
        }

        var Wall = function(config){
            this.isHoriz = config.isHoriz || false;
            this.x = config.x || unit*5;
            this.y = config.y || unit*5;
            this.height = config.height || unit/10;

            //returns boolean: true if smiley is touching wall
            this.touchesMe = function(){
                var heightR = this.height/2 + me.width/2;
                var widthR = wallWidth/2+ me.width/2;
                if (this.isHoriz){//calculation of distance from wall horizontal
                    if (me.x < this.x + heightR &&
                        me.x > this.x - heightR){//if inside the X plane of the line
                        if (dist(0, me.y, 0, this.y) < widthR){
                            return true;
                        }
                        return false;
                    }
                }else{//calculation of distance from wall vertical
                     if (me.y < this.y + heightR &&
                        me.y > this.y - heightR){
                        if (dist(me.x, 0, this.x, 0) < widthR) {
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

        //TODO: level builder interface
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
                for (var i = 0; i < this.coins.length; i++){
                    this.coins[i].collected = false;
                }
            };
            
            this.draw = function(){
                background(180,180,180);
                //render walls
                rectMode(CENTER);
                for(var i=0; i < this.walls.length; i++){
                    this.walls[i].draw();
                }
                //render coins
                for(var i=0; i < this.coins.length; i++){
                    if (!this.coins[i].collected) this.coins[i].draw();
                }
                //render end box
                rectMode(CORNER);
                fill(0,0,0);
                rect(this.finishX, this.finishY, unit, unit, 1);
                pushMatrix();
                translate(this.finishX + unit/2, this.finishY + unit/2); // center of the star
                fill(255, 255,0);
                //star shape with help from https://stackoverflow.com/questions/53799599/how-to-draw-a-star-shape-in-processingjs
                beginShape();
                var n = unit/100;//scale bc scale() wasn't playing nice
                vertex(0, -50*n);
                vertex(15*n, -17*n);
                vertex(47*n, -15*n);//right point
                vertex(22*n, 7*n);
                vertex(29*n, 40*n);//bottom right point
                vertex(0, 22*n);
                vertex(-29*n, 40*n);
                vertex(-22*n, 7*n);
                vertex(-47*n, -15*n);
                vertex(-14*n, -20*n);
                endShape(CLOSE);
                popMatrix();
            }
        }

        //walls code which defines a bounding box
        /*
         walls:[new Wall({x:1, y:side/2, height:side}), new Wall({x:side/2, y:1, height:side, isHoriz:true}), new Wall({x:side-1, y:side/2, height:side}), new Wall({x:side/2, y:side-1, height:side, isHoriz:true})]
         */
         //TODO: put x and y into arrays, automatically populate levels when created
        var L1 = new Level({
            walls:[new Wall({x:1, y:side/2, height:side}), new Wall({x:side/2, y:1, height:side, isHoriz:true}), new Wall({x:side-1, y:side/2, height:side}), new Wall({x:side/2, y:side-1, height:side, isHoriz:true}),
            new Wall({x:side/2, y:unit, height:2*unit}), new Wall({x:side/2, y:side-unit, height:2*unit}), 
            new Wall({y:side/2, x:unit, height:2*unit, isHoriz:true}), new Wall({y:side/2, x:side-unit, height:2*unit, isHoriz:true}),
            new Wall({y:side/2 + unit, x:side/2, height:2*unit, isHoriz:true})
            ],
            coins:[new Coin({x:itemGrid(0), y:itemGrid(1)}), new Coin({x:itemGrid(0), y:itemGrid(2)}), new Coin({x:itemGrid(0), y:itemGrid(3)})]
        });
        L1.init();
        L1.draw();
        me.draw();

        //define all levels, walls, etc
        var endWalls = [new Wall({isHoriz: true, x:side/2, y:endY}), new Wall({isHoriz: true, x:side/2, y:endY+endHeight})];



        //every frame drawn here
        draw = function(){
            if (keyIsDown(keyCode) && me.direction === moving.NO){
                switch (keyCode){
                    case UP: me.direction = moving.UP; break;
                     case DOWN: me.direction = moving.DOWN; break;
                      case LEFT: me.direction = moving.LEFT; break;
                       case RIGHT: me.direction = moving.RIGHT; break;
                }
                //console.log(me.direction);
            }
            switch(me.direction){
                case moving.UP: me.y = me.y -meSpeed; break;
                 case moving.DOWN: me.y = me.y +meSpeed; break;
                  case moving.LEFT: me.x = me.x -meSpeed; break;
                   case moving.RIGHT: me.x = me.x +meSpeed; break;
                }
            if (!levelDone){
                L1.draw();
                me.update(L1);
                me.draw();
            }else{// level conclusion
                //draw results box
                rectMode(CORNER);
                fill(240, 240, 240);
                stroke(0, 0, 0);
                strokeWeight(unit/10);
                rect(0, endY, side, endHeight);
                fill(0,0,0);
                textSize(unit/2);
                text(endText, endHeight, endY+unit, side, endHeight);
                me.handleCollision(endWalls);
                me.draw();
                //two option choices
                if (me.x < 0){//replay level
                    L1.init();
                    levelDone = false;
                }else if(me.x > side){
                    println(me.x);
                    //go to next level
                    levelDone =  false;
                }
            }
            
        }
    }};

    // Get the canvas that Processing-js will use
    var canvas = document.getElementById("mycanvas"); 
    // Pass the function sketchProc (defined in myCode.js) to Processing's constructor.
    var processingInstance = new Processing(canvas, sketchProc); 
