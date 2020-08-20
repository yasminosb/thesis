class ReplayRunner extends Runner {
    constructor(outerContainerId, opt_param_config, replay_events, replay_obstacles, playIntro){
        super(outerContainerId, opt_param_config);
        // this.replay_playIntro = playIntro; 
        this.replaying = true;
        this.replay_obstacles = replay_obstacles;
        // this.config.GAMEOVER_CLEAR_TIME = 0;
        this.initReplayEvents(replay_events);
        this.loadImages();
        this.tRex.replaying = true;
        this.update();
        // if(!playIntro){
            // this.playIntro();
            //this.containerEl.style.width = this.dimensions.WIDTH + 'px';
            //this.gameOver();
            //this.update();
        // }
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

    // playIntro() {
    //     if (!this.activated && !this.crashed) {
    //         if(!this.replay_playIntro){
    //             // this.restart();
    //             this.containerEl.style.width = this.dimensions.WIDTH + 'px';
    //             this.playing = true;
    //             this.activated = true;
    //         } else {
    //             this.playingIntro = true;
    //             this.tRex.playingIntro = true;
    //             // CSS animation definition.
    //             var keyframes = '@-webkit-keyframes intro { ' +
    //                 'from { width:' + Trex.config.WIDTH + 'px }' +
    //                 'to { width: ' + this.dimensions.WIDTH + 'px }' +
    //                 '}';
    //             document.styleSheets[0].insertRule(keyframes, 0);
    //             this.containerEl.addEventListener(Runner.events.ANIM_END,
    //                 this.startGame.bind(this));
    //             this.containerEl.style.webkitAnimation = 'intro .4s ease-out 1 both';
    //             this.containerEl.style.width = this.dimensions.WIDTH + 'px';
    //             if (this.touchController) {
    //                 this.outerContainerEl.appendChild(this.touchController);
    //             }
    //             this.playing = true;
    //             this.activated = true;
    //         }
    //     } else if (this.crashed) {
    //         this.restart();
    //     }
    // }
}