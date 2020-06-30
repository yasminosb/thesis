class ReplayRunner extends Runner {
    constructor(outerContainerId, opt_param_config, replay_events){
        super(outerContainerId, opt_param_config);
        this.replaying = true;
        this.initEvents(replay_events);
        this.update()
    }

    initEvents(replay_events){
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

    initUpdate(){
        // empty - start update only after init
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