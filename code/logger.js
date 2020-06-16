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
        this.dict.obstacles.push([obstacle, getTimeStamp()]);
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
        this.dict.logs.push([log, getTimeStamp()]);
    },
    /**
     * add event to events
     * @param {*} eventType 
     */
    addEvent: function(eventType){
        this.dict.events.push([eventType, getTimeStamp()]);
    },
    gameOver: function(obstacle, runner, tRex, parameters){
        this.dict["collisionObstacle"] = obstacle;
        var actualDistance = runner.distanceMeter.getActualDistance(Math.ceil(runner.distanceRan));
        
        this.dict[ "distanceRan"] = runner.distanceRan;
        this.dict[ "actualDistance" ] =  actualDistance;
        this.dict[ "runnerConfig"] =  runner.config;
        this.dict[ "tRexConfig"] =  tRex.config;
        this.dict[ "inverted"] =  runner.inverted;
        this.dict[ "obstacleTypes"] =  Obstacle.types;
        this.dict[ "parameters"] = parameters;
    },
    /** 
     * Log all the parameters stored in dict
     * @param {*} runner runner obj
     * @param {*} tRex trex obj
     */
    getParams: function(){
        console.log("logger.getparams")
        return this.dict;
    }
}