class ReplayRunner extends Runner {
    constructor(outerContainerId, opt_param_config, replay_events, replay_obstacles){
        super(outerContainerId, opt_param_config);
        this.replaying = true;
        this.replay_obstacles = replay_obstacles;
        this.initReplayEvents(replay_events);
        this.loadImages();
        this.tRex.replaying = true;
        this.update();
    }

    initReplayEvents(replay_events){
        this.replay_events = replay_events;
        this.replay_index = 0;
        this.gameOverTime = getTimeStamp();
    }

    initListening(){
        // don't listen, fire handleEvent manually
        //this.startListening(); 
        window.addEventListener(Runner.events.RESIZE,
            this.debounceResize.bind(this));
    }

    initHorizon(){
        // Horizon contains clouds, obstacles and the ground.
        this.horizon = new ReplayHorizon(this.canvas, this.spriteDef, this.dimensions,
            this.config.GAP_COEFFICIENT, this, this.replay_obstacles);
    }

    initUpdate(){
        // empty - start update only after init
    }

    launch(){
        // empty - start launch after init
    }

    update(){
        var replay_event = this.replay_events[this.replay_index]
        if((this.replay_index < this.replay_events.length) && (this.time - this.gameOverTime > replay_event.time)){
            this.handleEvent(replay_event.event);
            this.replay_index++;
            replay_event = this.replay_events[this.replay_index];
        }
        super.update();
    }
}