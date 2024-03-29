/**
 * Logging module
 * dict: stores the parameters that have been used
 * everything nevessary to replay a game
 */
class Logger{
    constructor(UUID){
        this.UUID = UUID;
        this.dict = {
            UUID: UUID,
            events: [],
            logs: [],
            obstacles: [],
            nr_jumps: 0
        };
    }

    init_dict(){
        this.dict = {
            UUID: this.UUID,
            events: [],
            logs: [],
            obstacles: [],
            nr_jumps: 0
        };
    }

     /**
     * Store new value in dict
     */
    store(key, value){
        this.dict[key] = value;
    }

    /**
     * add obstacle to obstacles
     * @param {*} obstacle 
     */
    addObstacle(obstacle){
        this.dict.obstacles.push({obstacle: obstacle, time: getTimeStamp()});
    }


    /**
     * increment nr jumps 
     */
    addJump(){
        this.dict.nr_jumps++;
    }

    /**
     * add log to logs
     * @param {*} log 
     */
    addLog(log){
        this.dict.logs.push({log: log, time: getTimeStamp()});
    }

     
    /**
     * add event to events
     * @param {*} eventType 
     */
    addEvent(event){
        var d = {time : getTimeStamp(), event: event};
        this.dict.events.push(d);
    }

    gameOver(obstacle, runner, tRex, parameters){
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
        this.dict[ "gameOverScreen" ] = "loading";
        this.dict[ "gameOverScreen"] = runner.canvas.toDataURL();
        this.dict["dateTime"] = getCurrentDateTime();
        this.normalize_events()
    }

    normalize_events(){
        // let first event start at timestamp 1000
        // adjust all events timestamps accordingly
        var events = this.dict.events;
        var obstacles = this.dict.obstacles;
        var first_event_time = this.dict.events[0].time;
        var subtract_amount = -(-this.dict.events[0].time + 1000);
        for (let i = 0; i < events.length; i++){
            var event = events[i];
            event.time -= subtract_amount;
        }

        // not necessary? 
        for (let i = 0; i < obstacles.length; i++){
            var obstacle = obstacles[i];
            obstacle.time -= subtract_amount;
        }

    }


    /** 
     * Log all the parameters stored in dict
     * @param {*} runner runner obj
     * @param {*} tRex trex obj
     */
    getParams(){
        return this.dict;
    }

    serialize(){
        var serialized_dict = this.dict;
        serialized_dict.events = this.serializeEvents(serialized_dict.events);
        serialized_dict.collisionObstacle = this.serializeCollisionObstacle(serialized_dict.collisionObstacle);
        return JSON.stringify(serialized_dict);
    }

    serializeEvents(events){
        var events_copy = [...events]
        return events_copy.map(et => {
                if(et.event.keyCode){
                    return Object.assign({}, et, 
                        {time: et.time, 
                        event: {type: et.event.type, keyCode: et.event.keyCode}}
                        );
                } else {
                    return Object.assign({}, et, 
                        {time: et.time, 
                        event: {type: et.event.type}}
                        );
                    
                }
            }
        );
    }

    serializeCollisionObstacle(collisionObstacle){
        return {
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
    }

    reset(){
        this.init_dict();
    }

}