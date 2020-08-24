//******************************************************************************
/**
 * Obstacle.
 * @param {HTMLCanvasCtx} canvasCtx
 * @param {Obstacle.type} type
 * @param {Object} spritePos Obstacle position in sprite.
 * @param {Object} dimensions
 * @param {number} gapCoefficient Mutipler in determining the gap.
 * @param {number} speed
 * @param {number} opt_xOffset
 */
class Obstacle{

    /**
     * Coefficient for calculating the maximum gap.
     * @const
     */
    static MAX_GAP_COEFFICIENT = 1.5;
    /**
     * Maximum obstacle grouping count.
     * @const
     */
    static MAX_OBSTACLE_LENGTH = (typeof Obstacle.MAX_OBSTACLE_LENGTH == 'undefined') ? 3 : Obstacle.MAX_OBSTACLE_LENGTH;

    constructor(canvasCtx, type, spriteImgPos, dimensions,
        gapCoefficient, speed, opt_xOffset, runner) {
        this.runner = runner;
        this.canvasCtx = canvasCtx;
        this.spritePos = spriteImgPos;
        this.typeConfig = type;
        this.gapCoefficient = gapCoefficient;
        this.dimensions = dimensions;
        this.remove = false;
        this.xPos = dimensions.WIDTH + (opt_xOffset || 0);
        this.yPos = 0;
        this.width = 0;
        this.collisionBoxes = [];
        this.gap = 0;
        this.speedOffset = 0;
        // For animated obstacles.
        this.currentFrame = 0;
        this.timer = 0;
        this.launchInit(speed);
    }

    launchInit(speed){
        this.init(speed);
    }

    /**
     * Initialise the DOM for the obstacle.
     * @param {number} speed
     */
    init(speed){
        this.cloneCollisionBoxes();
        this.setDimensions(speed);
        this.setHeight();
        this.draw();
        this.adjustCollisionBoxes();
        this.setSpeedOffset();
        this.setGap(speed);
        this.logParameters();
    }

    setDimensions(speed){
        this.size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH);
        // Only allow sizing if we're at the right speed.
        if (this.size > 1 && this.typeConfig.multipleSpeed > speed) { // size is random but since pterodactyl has multipleSpeed 900 -> always size reset to 1
            this.size = 1;
        }
        this.width = this.typeConfig.width * this.size;
    }

    setHeight(){
        // Check if obstacle can be positioned at various heights.
        if (Array.isArray(this.typeConfig.yPos)) {
            var yPosConfig = IS_MOBILE ? this.typeConfig.yPosMobile :
                this.typeConfig.yPos;
            this.yPos = yPosConfig[getRandomNum(0, yPosConfig.length - 1)];
        } else {
            this.yPos = this.typeConfig.yPos;
        }
    }


    adjustCollisionBoxes(){
        // Make collision box adjustments,
       // Central box is adjusted to the size as one box.
       //      ____        ______        ________
       //    _|   |-|    _|     |-|    _|       |-|
       //   | |<->| |   | |<--->| |   | |<----->| |
       //   | | 1 | |   | |  2  | |   | |   3   | |
       //   |_|___|_|   |_|_____|_|   |_|_______|_|
       //
       if (this.size > 1) {
           this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width -
               this.collisionBoxes[2].width;
           this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
       }
   }

   setSpeedOffset(){
       // For obstacles that go at a different speed from the horizon.
       if (this.typeConfig.speedOffset) {
           this.speedOffset = Math.random() > 0.5 ? this.typeConfig.speedOffset :
               -this.typeConfig.speedOffset;
       } 
       // either x times slower or x times faster than horizon (0.8 for pterodactyl)
   }

   setGap(speed){
       this.gap = this.getGap(this.gapCoefficient, speed);
   }

   logParameters(){
        var param_obstacle = {
            "typeConfig": this.typeConfig,
            "size": this.size, // for tree
            "yPos": this.yPos, // for pterodactyl
            "gap": this.gap,
            "speedOffset": this.speedOffset
        }
        if (!this.runner.replaying) {
            logger.addObstacle(param_obstacle);
        } 
    }

    /**
     * Draw and crop based on size.
     */
    draw(){
        var sourceWidth = this.typeConfig.width;
        var sourceHeight = this.typeConfig.height;
        if (IS_HIDPI) {
            sourceWidth = sourceWidth * 2;
            sourceHeight = sourceHeight * 2;
        }
        // X position in sprite.
        /**
         * sprite : X-XX-XXX for size 1-2-3
         * size = 0 -> original pos in sprite + 0*width
         * size = 1 -> original pos in sprite + 1*width
         * size = 3 -> original pos in sprite + 3*width
         */
        var sourceX = (sourceWidth * this.size) * (0.5 * (this.size - 1)) +
            this.spritePos.x;
        // Animation frames.
        if (this.currentFrame > 0) {
            sourceX += sourceWidth * this.currentFrame;
        }
        this.canvasCtx.drawImage(Runner.imageSprite,
            sourceX, this.spritePos.y,
            sourceWidth * this.size, sourceHeight,
            this.xPos, this.yPos,
            this.typeConfig.width * this.size, this.typeConfig.height);
    }
     
    /**
     * Obstacle frame update.
     * @param {number} deltaTime
     * @param {number} speed
     */
    update(deltaTime, speed){
        if (!this.remove) {
            if (this.typeConfig.speedOffset) {
                speed += this.speedOffset;
            }
            this.xPos -= Math.floor((speed * FPS / 1000) * deltaTime);
            // Update frame
            if (this.typeConfig.numFrames) {
                this.timer += deltaTime;
                if (this.timer >= this.typeConfig.frameRate) {
                    this.currentFrame =
                        this.currentFrame == this.typeConfig.numFrames - 1 ?
                            0 : this.currentFrame + 1;
                    this.timer = 0;
                }
            }
            this.draw();
            if (!this.isVisible()) {
                this.remove = true;
            }
        }
    }

    /**
     * Calculate a random gap size.
     * - Minimum gap gets wider as speed increses
     * @param {number} gapCoefficient
     * @param {number} speed
     * @return {number} The gap size.
     */
    gap_distribution_pow = 2;
    use_game_gap = false;
    getGap(gapCoefficient, speed){
        if (this.use_game_gap) { // original code: not used anymore
            var minGap = Math.round(this.width * speed +
                this.typeConfig.minGap * gapCoefficient);
            var maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
            var r = getRandomNum(minGap, maxGap);
            return r
        } else {
            var minGap = this.runner.parameters.getMinGap();
            var maxGap = this.runner.parameters.getMaxGap();
            var r = getRandomSquared(this.gap_distribution_pow, minGap, maxGap);
            return r
        }
    }

    /**
     * Check if obstacle is visible.
     * @return {boolean} Whether the obstacle is in the game area.
     */
    isVisible(){
        return this.xPos + this.width > 0;
    }

    /**
     * Make a copy of the collision boxes, since these will change based on
     * obstacle type and size.
     */
    cloneCollisionBoxes(){
        var collisionBoxes = this.typeConfig.collisionBoxes;
        for (var i = collisionBoxes.length - 1; i >= 0; i--) {
            this.collisionBoxes[i] = new CollisionBox(collisionBoxes[i].x,
                collisionBoxes[i].y, collisionBoxes[i].width,
                collisionBoxes[i].height);
        }
    }

}


    Obstacle.prototype = {
       
        
    };
