/**
 * Logging module
 * dict: stores the parameters that have been used
 * everything nevessary to replay a game
 */
function Logger(){
    this.dict = {
        events: [],
        logs: [],
        obstacles: [],
        nr_jumps: 0
    };
}

/**
 * Store events the dict
 */
Logger.prototype = {
    /**
     * Store new value in dict
     */
    store: function(key, value){
        this.dict[key] = value;
    },
    /**
     * add obstacle to obstacles
     * @param {*} obstacle 
     */
    addObstacle(obstacle){
        this.dict.obstacles.push({obstacle: obstacle, time: getTimeStamp()});
    },
    /**
     * increment nr jumps 
     */
    addJump(){
        this.dict.nr_jumps++;
    },
    /**
     * add log to logs
     * @param {*} log 
     */
    addLog: function(log){
        this.dict.logs.push({log: log, time: getTimeStamp()});
    },
    /**
     * add event to events
     * @param {*} eventType 
     */
    addEvent: function(eventType){
        var d = {time : getTimeStamp(), event: eventType};
        this.dict.events.push(d);
    },
    gameOver: function(obstacle, runner, tRex, parameters){
        this.dict["collisionObstacle"] = obstacle;
        var actualDistance = runner.distanceMeter.getActualDistance(Math.ceil(runner.distanceRan));
        this.dict[ "distanceRan"] = runner.distanceRan;
        this.dict[ "actualDistance" ] =  actualDistance;
        this.dict[ "runnerConfig"] =  runner.config;
        this.dict[ "tRexConfig"] =  tRex.config;
        this.dict[ "invertedGameOver"] =  runner.inverted;
        this.dict[ "obstacleTypes"] =  Obstacle.types;
        this.dict[ "parameters"] = parameters;
        this.dict[ "gameOverTime"] = runner.time;
    },
    /** 
     * Log all the parameters stored in dict
     * @param {*} runner runner obj
     * @param {*} tRex trex obj
     */
    getParams: function(){
        return this.dict;
    },

    serialize: function(){
        var serialized_dict = this.dict;
        serialized_dict.events.map(event => {event.type});
        var collisionObstacle = serialized_dict.collisionObstacle;
        serialized_dict.collisionObstacle = {
            "typeConfig": collisionObstacle.typeConfig,
            "dimensions": collisionObstacle.dimensions,
            "size": collisionObstacle.size,
            "width": collisionObstacle.width,
            "xPos": collisionObstacle.xPos,
            "yPos": collisionObstacle.yPos,
            "collisionBoxes": collisionObstacle.collisionBoxes,
            "speedOffset": collisionObstacle.speedOffset,
            "gap": collisionObstacle.gap
        };
        return JSON.stringify(this.dict);
    }

}