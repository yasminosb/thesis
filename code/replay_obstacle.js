class ReplayObstacle extends Obstacle {
    constructor(canvasCtx, type, spriteImgPos, dimensions, gapCoefficient, speed, opt_xOffset, runner,
        gap, size, speedOffset, yPos){
        super(canvasCtx, type, spriteImgPos, dimensions, gapCoefficient, speed, opt_xOffset, runner)
        this.replay_gap = gap;
        this.replay_size = size;
        this.replay_speefOffset = speedOffset;
        this.replay_yPos = yPos;
        this.init();
    }

    launchInit(){
        return;
    }

    setGap(speed){
        this.gap = this.replay_gap;
    }

    setDimensions(speed){
        this.size = this.replay_size;
        // Only allow sizing if we're at the right speed.
        if (this.size > 1 && this.typeConfig.multipleSpeed > speed) { // size is random but since pterodactyl has multipleSpeed 900 -> always size reset to 1
            this.size = 1;
        }
        this.width = this.typeConfig.width * this.size;
    }

    setSpeedOffset(){
        this.speedOffset = this.replay_speefOffset;
    }

    setHeight(){
        this.yPos = this.replay_yPos;
    }


}