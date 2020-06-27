class ReplayRunner extends Runner {
    constructor(outerContainerId, opt_param_config, replay_events){
        console.log('ReplayRunner constructor')
        super(outerContainerId, opt_param_config);
        this.initEvents(replay_events);
        this.update()
    }

    initEvents(replay_events){
        console.log(replay_events)
        this.replay_events = replay_events;

        this.replay_index = 0;
    }

    initListening(){
        //this.startListening();
        window.addEventListener(Runner.events.RESIZE,
            this.debounceResize.bind(this));
    }

    initUpdate(){
        // empty - start update only after init
    }

    update(){
        console.log(this.time)
        var replay_event = this.replay_events[this.replay_index]
        if(this.replay_index < this.replay_events.length && this.time > replay_event[1] ){
            this.handleEvent(replay_event[0]);
            this.replay_index++;
        }
        super.update();
    }
}