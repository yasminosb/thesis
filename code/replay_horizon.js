class ReplayHorizon extends Horizon {
    constructor(canvas, spritePos, dimensions, gapCoefficient, runner, replay_obstacles){
        super(canvas, spritePos, dimensions, gapCoefficient, runner);
        this.replay_obstacles = replay_obstacles;
        this.replay_obstacle_index = 0;
    }

    determineObstacleType(){
        var obstacle = this.getCurrentReplayObstacle();
        var type = obstacle.typeConfig.type;
        var obstacleType = Obstacle.types.filter(obj => { return obj.type == type })[0];
        return obstacleType;
    }

    getCurrentReplayObstacle(){
        var replay_obstacle = this.replay_obstacles[this.replay_obstacle_index]
        var obstacle = replay_obstacle.obstacle;
        return obstacle;
    }

    createNewObstacle(canvasCtx, obstacleType, obstacleSpritePos, dimensions, gapCoefficient, currentSpeed, width, runner){
        var obstacle = this.getCurrentReplayObstacle();
        this.replay_obstacle_index++;
        return new ReplayObstacle(canvasCtx, obstacleType, obstacleSpritePos, dimensions, gapCoefficient, currentSpeed, width, runner,
            obstacle.gap, obstacle.size, obstacle.speedOffset, obstacle.yPos);
    }



}