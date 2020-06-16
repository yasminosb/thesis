// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//(function() {

//require("logger.js");
    'use strict';
    /**
     * T-Rex runner.
     * @param {string} outerContainerId Outer containing element id.
     * @param {Object} opt_config
     * @constructor
     * @export
     */
    function Runner(outerContainerId, opt_param_config, opt_runner_config) {

      this.parameters = new Parameters(opt_param_config);
      this.parameters.initialise();
      this.replaying = false;
      // Singleton
      if (Runner.instance_) {
        return Runner.instance_;
      }
      Runner.instance_ = this;
      this.outerContainerEl = document.querySelector(outerContainerId);
      this.containerEl = null;
      this.snackbarEl = null;
      this.config = opt_runner_config || Runner.config;
      // Logical dimensions of the container.
      this.dimensions = Runner.defaultDimensions;
      this.canvas = null;
      this.canvasCtx = null;
      this.tRex = null;
      this.distanceMeter = null;
      this.distanceRan = 0;
      this.highestScore = 0;
      this.time = 0;
      this.runningTime = 0;
      this.msPerFrame = 1000 / FPS;
      this.currentSpeed = this.config.SPEED;
      this.obstacles = [];
      this.activated = false; // Whether the easter egg has been activated.
      this.playing = false; // Whether the game is currently in play state.
      this.crashed = false;
      this.paused = false;
      this.inverted = false;
      this.invertTimer = 0;
      this.resizeTimerId_ = null;
      this.playCount = 0;
      // Sound FX.
      this.audioBuffer = null;
      this.soundFx = {};
      // Global web audio context for playing sounds.
      this.audioContext = null;
      // Images.
      this.images = {};
      this.imagesLoaded = 0;
      if (this.isDisabled()) { // false - hardcoded
        this.setupDisabledRunner();
      } else {
        this.loadImages();
      }
    }
    window['Runner'] = Runner;
    Runner.parameters = new Parameters();
    /**
     * Default game width.
     * @const
     */
    var DEFAULT_WIDTH = 600;
    /**
     * Frames per second.
     * @const
     */
    var FPS = 60;
    /** @const */
    var IS_HIDPI = window.devicePixelRatio > 1;
    /** @const */
    var IS_IOS = /iPad|iPhone|iPod/.test(window.navigator.platform);
    /** @const */
    var IS_MOBILE = /Android/.test(window.navigator.userAgent) || IS_IOS;
    /** @const */
    var IS_TOUCH_ENABLED = 'ontouchstart' in window;
    /** @const */
    var ARCADE_MODE_URL = 'chrome://dino/';
    /**
     * Default game configuration.
     * @enum {number}
     */
    Runner.config = {
      ACCELERATION: 0.002, 
      BG_CLOUD_SPEED: 0.2, 
      BOTTOM_PAD: 10,
      CLEAR_TIME: 3000,
      CLOUD_FREQUENCY: 0.5,
      GAMEOVER_CLEAR_TIME: 750,
      GAP_COEFFICIENT: 0.6, 
      GRAVITY: 0.001, 
      INITIAL_JUMP_VELOCITY: 12,
      INVERT_FADE_DURATION: 12000,
      INVERT_DISTANCE: 700, /* Day & Night */ //
      MAX_BLINK_COUNT: 3,
      MAX_CLOUDS: 6,
      MAX_OBSTACLE_LENGTH: 3, // not used: Obstacle.MAX_OBSTACLE_LENGTH instead
      MAX_OBSTACLE_DUPLICATION: 2 , // 2
      MAX_SPEED: 10, 
      MIN_JUMP_HEIGHT: 15,
      MOBILE_SPEED_COEFFICIENT: 1.2,
      RESOURCE_TEMPLATE_ID: 'audio-resources',
      SPEED: 6,
      SPEED_DROP_COEFFICIENT: 3,
      ARCADE_MODE_INITIAL_TOP_POSITION: 35,
      ARCADE_MODE_TOP_POSITION_PERCENT: 0.1
    };
    /**
     * Default dimensions.
     * @enum {string}
     */
    Runner.defaultDimensions = {
      WIDTH: DEFAULT_WIDTH,
      HEIGHT: 150
    };
    /**
     * CSS class names.
     * @enum {string}
     */
    Runner.classes = {
      ARCADE_MODE: 'arcade-mode',
      CANVAS: 'runner-canvas',
      CONTAINER: 'runner-container',
      CRASHED: 'crashed',
      ICON: 'icon-offline',
      INVERTED: 'inverted',
      SNACKBAR: 'snackbar',
      SNACKBAR_SHOW: 'snackbar-show',
      TOUCH_CONTROLLER: 'controller'
    };
    /**
     * Sprite definition layout of the spritesheet.
     * @enum {Object}
     */
    Runner.spriteDefinition = {
      LDPI: {
        CACTUS_LARGE: {x: 332, y: 2},
        CACTUS_SMALL: {x: 228, y: 2},
        CLOUD: {x: 86, y: 2},
        HORIZON: {x: 2, y: 54},
        MOON: {x: 484, y: 2},
        PTERODACTYL: {x: 134, y: 2},
        RESTART: {x: 2, y: 2},
        TEXT_SPRITE: {x: 655, y: 2},
        TREX: {x: 848, y: 2},
        STAR: {x: 645, y: 2}
      },
      HDPI: {
        CACTUS_LARGE: {x: 652, y: 2},
        CACTUS_SMALL: {x: 446, y: 2},
        CLOUD: {x: 166, y: 2},
        HORIZON: {x: 2, y: 104},
        MOON: {x: 954, y: 2},
        PTERODACTYL: {x: 260, y: 2},
        RESTART: {x: 2, y: 2},
        TEXT_SPRITE: {x: 1294, y: 2},
        TREX: {x: 1678, y: 2},
        STAR: {x: 1276, y: 2}
      }
    };
    /**
     * Sound FX. Reference to the ID of the audio tag on interstitial page.
     * @enum {string}
     */
    Runner.sounds = {
      BUTTON_PRESS: 'offline-sound-press',
      HIT: 'offline-sound-hit',
      SCORE: 'offline-sound-reached'
    };
    /**
     * Key code mapping.
     * @enum {Object}
     */
    Runner.keycodes = {
      JUMP: {'38': 1, '32': 1},  // Up, spacebar
      DUCK: {'40': 1},  // Down
      RESTART: {'13': 1}  // Enter
    };
    /**
     * Runner event names.
     * @enum {string}
     */
    Runner.events = {
      ANIM_END: 'webkitAnimationEnd',
      CLICK: 'click',
      KEYDOWN: 'keydown',
      KEYUP: 'keyup',
      MOUSEDOWN: 'mousedown',
      MOUSEUP: 'mouseup',
      RESIZE: 'resize',
      TOUCHEND: 'touchend',
      TOUCHSTART: 'touchstart',
      VISIBILITY: 'visibilitychange',
      BLUR: 'blur',
      FOCUS: 'focus',
      LOAD: 'load'
    };
    
        Runner.prototype = {
            /**
             * Whether the easter egg has been disabled. CrOS enterprise enrolled devices.
             * @return {boolean}
             */
            isDisabled: function () {
                // return loadTimeData && loadTimeData.valueExists('disabled');
                return false;
            },
    
    
    
    
      /**
       * For disabled instances, set up a snackbar with the disabled message.
       */
      setupDisabledRunner: function() { // not called HC
        this.containerEl = document.createElement('div');
        this.containerEl.className = Runner.classes.SNACKBAR;
        this.containerEl.textContent = loadTimeData.getValue('disabled');
        this.outerContainerEl.appendChild(this.containerEl);
        document.addEventListener(Runner.events.KEYDOWN, function(e) {
          if (Runner.keycodes.JUMP[e.keyCode]) {
            this.containerEl.classList.add(Runner.classes.SNACKBAR_SHOW);
            document.querySelector('.icon').classList.add('icon-disabled');
          }
        }.bind(this));
      },
      
      /**
       * Setting individual settings for debugging.
       * @param {string} setting
       * @param {*} value
       */
      updateConfigSetting: function(setting, value) { // not called HC
        if (setting in this.config && value != undefined) {
          this.config[setting] = value;
          switch (setting) {
            case 'GRAVITY':
            case 'MIN_JUMP_HEIGHT':
            case 'SPEED_DROP_COEFFICIENT':
              this.tRex.config[setting] = value;
              break;
            case 'INITIAL_JUMP_VELOCITY':
              this.tRex.setJumpVelocity(value);
              break;
            case 'SPEED':
              this.setSpeed(value);
              break;
          }
        }
      },
      
      /**
       * Cache the appropriate image sprite from the page and get the sprite sheet
       * definition.
       */
      loadImages: function() {
        if (IS_HIDPI) {
          Runner.imageSprite = document.getElementById('offline-resources-2x');
          this.spriteDef = Runner.spriteDefinition.HDPI;
        } else {
          Runner.imageSprite = document.getElementById('offline-resources-1x');
          this.spriteDef = Runner.spriteDefinition.LDPI;
        }
        if (Runner.imageSprite.complete) {
          this.init();
        } else {
          // If the images are not yet loaded, add a listener.
          Runner.imageSprite.addEventListener(Runner.events.LOAD,
              this.init.bind(this));
        }
      },
      /**
       * Load and decode base 64 encoded sounds.
       */
      loadSounds: function() {
        if (!IS_IOS) {
          this.audioContext = new AudioContext();
          var resourceTemplate =
              document.getElementById(this.config.RESOURCE_TEMPLATE_ID).content;
          for (var sound in Runner.sounds) {
            var soundSrc =
                resourceTemplate.getElementById(Runner.sounds[sound]).src;
            soundSrc = soundSrc.substr(soundSrc.indexOf(',') + 1);
            var buffer = decodeBase64ToArrayBuffer(soundSrc);
            // Async, so no guarantee of order in array.
            this.audioContext.decodeAudioData(buffer, function(index, audioData) {
                this.soundFx[index] = audioData;
              }.bind(this, sound));
          }
        }
      },
    
      /**
       * Sets the game speed. Adjust the speed accordingly if on a smaller screen.
       * @param {number} opt_speed
       */
      setSpeed: function(opt_speed) {
        var speed = opt_speed || this.currentSpeed;
        // Reduce the speed on smaller mobile screens.
        if (this.dimensions.WIDTH < DEFAULT_WIDTH) {
          var mobileSpeed = speed * this.dimensions.WIDTH / DEFAULT_WIDTH *
              this.config.MOBILE_SPEED_COEFFICIENT;
          this.currentSpeed = mobileSpeed > speed ? speed : mobileSpeed;
        } else if (opt_speed) {
          this.currentSpeed = opt_speed;
        }
      },
    
      /**
       * Game initialiser.
       */
      init: function() {
        // Hide the static icon.
        document.querySelector('.' + Runner.classes.ICON).style.visibility =
            'hidden';
        this.adjustDimensions();
        this.setSpeed();
        this.containerEl = document.createElement('div');
        this.containerEl.className = Runner.classes.CONTAINER;
        // Player canvas container.
        this.canvas = createCanvas(this.containerEl, this.dimensions.WIDTH,
            this.dimensions.HEIGHT, Runner.classes.PLAYER);
        this.canvasCtx = this.canvas.getContext('2d');
        this.canvasCtx.fillStyle = '#f7f7f7'; // does not change anything?
        this.canvasCtx.fill();
        Runner.updateCanvasScaling(this.canvas);
        // Horizon contains clouds, obstacles and the ground.
        this.horizon = new Horizon(this.canvas, this.spriteDef, this.dimensions,
            this.config.GAP_COEFFICIENT, this);
        // Distance meter
        this.distanceMeter = new DistanceMeter(this.canvas,
              this.spriteDef.TEXT_SPRITE, this.dimensions.WIDTH);
        // Draw t-rex
        this.tRex = new Trex(this.canvas, this.spriteDef.TREX);
        this.outerContainerEl.appendChild(this.containerEl);
        if (IS_MOBILE) {
          this.createTouchController();
        }
        this.startListening();
        this.update();
        window.addEventListener(Runner.events.RESIZE,
            this.debounceResize.bind(this));
      },
      /**
       * Create the touch controller. A div that covers whole screen.
       */
      createTouchController: function() {
        this.touchController = document.createElement('div');
        this.touchController.className = Runner.classes.TOUCH_CONTROLLER;
      },
      /**
       * Debounce the resize event.
       */
      debounceResize: function() {
        if (!this.resizeTimerId_) {
          this.resizeTimerId_ =
              setInterval(this.adjustDimensions.bind(this), 250);
        }
      },
      /**
       * Adjust game space dimensions on resize.
       */
      adjustDimensions: function() {
        clearInterval(this.resizeTimerId_);
        this.resizeTimerId_ = null;
        var boxStyles = window.getComputedStyle(this.outerContainerEl);
        var padding = Number(boxStyles.paddingLeft.substr(0,
            boxStyles.paddingLeft.length - 2));
        this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - padding * 2;
        this.dimensions.WIDTH = Math.min(DEFAULT_WIDTH, this.dimensions.WIDTH);
          
        // Redraw the elements back onto the canvas.
        if (this.canvas) {
          this.canvas.width = this.dimensions.WIDTH;
          this.canvas.height = this.dimensions.HEIGHT;
          Runner.updateCanvasScaling(this.canvas);
          this.distanceMeter.calcXPos(this.dimensions.WIDTH);
          this.clearCanvas();
          this.horizon.update(0, 0, true);
          this.tRex.update(0);
          // Outer container and distance meter.
          if (this.playing || this.crashed || this.paused) {
            this.containerEl.style.width = this.dimensions.WIDTH + 'px';
            this.containerEl.style.height = this.dimensions.HEIGHT + 'px';
            this.distanceMeter.update(0, Math.ceil(this.distanceRan));
            this.stop();
          } else {
            this.tRex.draw(0, 0);
          }
          // Game over panel.
          if (this.crashed && this.gameOverPanel) {
            this.gameOverPanel.updateDimensions(this.dimensions.WIDTH);
            this.gameOverPanel.draw();
          }
        }
      },
    
      /**
       * Play the game intro.
       * Canvas container width expands out to the full width.
       */
      playIntro: function() {
        if (!this.activated && !this.crashed) {
          console.log("playintro")
          if(!this.replaying) logger.addLog("playIntro");
          this.playingIntro = true;
          this.tRex.playingIntro = true;
          // CSS animation definition.
          var keyframes = '@-webkit-keyframes intro { ' +
                'from { width:' + Trex.config.WIDTH + 'px }' +
                'to { width: ' + this.dimensions.WIDTH + 'px }' +
              '}';
          document.styleSheets[0].insertRule(keyframes, 0);
          this.containerEl.addEventListener(Runner.events.ANIM_END,
              this.startGame.bind(this));
          this.containerEl.style.webkitAnimation = 'intro .4s ease-out 1 both';
          this.containerEl.style.width = this.dimensions.WIDTH + 'px';
          if (this.touchController) {
            this.outerContainerEl.appendChild(this.touchController);
          }
          this.playing = true;
          this.activated = true;
        } else if (this.crashed) {
          console.log("restart 1")
          this.restart();
        }
      },
    
    
            /**
             * Update the game status to started.
             */
            startGame: function () {
                this.isArcadeMode = 1;
                this.setArcadeMode = false;
                this.runningTime = 0;
                this.playingIntro = false;
                this.tRex.playingIntro = false;
                this.containerEl.style.webkitAnimation = '';
                this.playCount++;
    
        // Handle tabbing off the page. Pause the current game.
        document.addEventListener(Runner.events.VISIBILITY,
              this.onVisibilityChange.bind(this));
        window.addEventListener(Runner.events.BLUR,
              this.onVisibilityChange.bind(this));
        window.addEventListener(Runner.events.FOCUS,
              this.onVisibilityChange.bind(this));
      },
      clearCanvas: function() {
        this.canvasCtx.clearRect(0, 0, this.dimensions.WIDTH,
            this.dimensions.HEIGHT);
      },
      
      replay: function(params){
        if (this.replaying == false){
          this.replaying = true;
          console.log("REPLAY", params)
          var events = params.events;
          this.GAMEOVER_CLEAR_TIME = 0;
          this.replayEvents(events);
        }
      },

      replayEvents: function(events){
        console.log(events.map(x => [x[0].type, x[1]]))
        for(let event of events){
          setTimeout(() => {
            this.handleEvent(event[0]);
          }, event[1]);
        }
        
      },

      replayEvents2(events){
        var i = 0;
        this.restart()
        while( i < events.length){
          console.log(this.runningTime)
          if(this.runningtime >= events[i][1]){
            this.handleEvent(events[i][0]);
            i++;
          }
        }

      },
      /**
       * Update the game frame and schedules the next one.
       */
      update: function() {
        //console.log("update - time:", this.runningTime);
        this.updatePending = false;
        var now = getTimeStamp();
        var deltaTime = now - (this.time || now);
        this.time = now;
        if (this.playing) {
          this.clearCanvas();
          if (this.tRex.jumping) {
            this.tRex.updateJump(deltaTime);
          }
          this.runningTime += deltaTime;
          var hasObstacles = this.runningTime > this.config.CLEAR_TIME;

          // First jump triggers the intro.
          if (this.tRex.jumpCount == 1 && !this.playingIntro) {
            this.playIntro();
          }
          // The horizon doesn't move until the intro is over.
          if (this.playingIntro) {
            this.horizon.update(0, this.currentSpeed, hasObstacles);
          } else {
            deltaTime = !this.activated ? 0 : deltaTime;
            this.horizon.update(deltaTime, this.currentSpeed, hasObstacles,
                this.inverted);
          }
          // Check for collisions.
          var collision = hasObstacles &&
              checkForCollision(this.horizon.obstacles[0], this.tRex);
          if (!collision) {
            this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;
            if (this.currentSpeed < this.config.MAX_SPEED) {
              this.currentSpeed += this.config.ACCELERATION;
            }
          } else {
            this.gameOver();
          }
          var playAchievementSound = this.distanceMeter.update(deltaTime,
              Math.ceil(this.distanceRan));
          if (playAchievementSound) {
            this.playSound(this.soundFx.SCORE);
          }
    
          // Night mode.
          if(this.parameters.isNightModeEnabled()){
            if (this.invertTimer > this.config.INVERT_FADE_DURATION) {
              this.invertTimer = 0;
              this.invertTrigger = false;
              this.invert();
            } else if (this.invertTimer) {
              this.invertTimer += deltaTime;
            } else {
              var actualDistance =
                  this.distanceMeter.getActualDistance(Math.ceil(this.distanceRan));
              if (actualDistance > 0) {
                this.invertTrigger = !(actualDistance %
                    this.config.INVERT_DISTANCE);
                if (this.invertTrigger && this.invertTimer === 0) {
                  this.invertTimer += deltaTime;
                  this.invert();
                }
              }
            }
          }
        }
        if (this.playing || (!this.activated &&
            this.tRex.blinkCount < Runner.config.MAX_BLINK_COUNT)) {
          this.tRex.update(deltaTime);
          this.scheduleNextUpdate();
        }
      },
                    
      /**
       * Event handler.
       */
      handleEvent: function(e) {
        return (function(evtType, events) {
          if (!this.playing_replay) if(!this.replaying) logger.addEvent(e);
          console.log("TYPE", evtType);
          switch (evtType) {
            case events.KEYDOWN:
            case events.TOUCHSTART:
            case events.MOUSEDOWN:
              this.onKeyDown(e);
              break;
            case events.KEYUP:
            case events.TOUCHEND:
            case events.MOUSEUP:
              this.onKeyUp(e);
              break;
          }
        }.bind(this))(e.type, Runner.events);
      },	
      
       /**
       * Bind relevant key / mouse / touch listeners.
       */
      startListening: function() {
        // Keys.
        document.addEventListener(Runner.events.KEYDOWN, this);
        document.addEventListener(Runner.events.KEYUP, this);
        if (IS_MOBILE) {
          // Mobile only touch devices.
          this.touchController.addEventListener(Runner.events.TOUCHSTART, this);
          this.touchController.addEventListener(Runner.events.TOUCHEND, this);
          this.containerEl.addEventListener(Runner.events.TOUCHSTART, this);
        } else {
          // Mouse.
          document.addEventListener(Runner.events.MOUSEDOWN, this);
          document.addEventListener(Runner.events.MOUSEUP, this);
        }
      },
    
      /**
       * Remove all listeners.
       */
      stopListening: function() {
        document.removeEventListener(Runner.events.KEYDOWN, this);
        document.removeEventListener(Runner.events.KEYUP, this);
        if (IS_MOBILE) {
          this.touchController.removeEventListener(Runner.events.TOUCHSTART, this);
          this.touchController.removeEventListener(Runner.events.TOUCHEND, this);
          this.containerEl.removeEventListener(Runner.events.TOUCHSTART, this);
        } else {
          document.removeEventListener(Runner.events.MOUSEDOWN, this);
          document.removeEventListener(Runner.events.MOUSEUP, this);
        }
      },
      /**
       * Process keydown.
       * @param {Event} e
       */
      onKeyDown: function(e) {
        // Prevent native page scrolling whilst tapping on mobile.
        if (IS_MOBILE && this.playing) {
          e.preventDefault();
        }
        if (!this.crashed && !this.paused) {
          if (Runner.keycodes.JUMP[e.keyCode] ||
              e.type == Runner.events.TOUCHSTART) {
            e.preventDefault();
            // Starting the game for the first time.
            if (!this.playing) {
              this.loadSounds();
              this.playing = true;
              this.update();
              if (window.errorPageController) {
                errorPageController.track();
              }
            }
            // Start jump.
            if (!this.tRex.jumping && !this.tRex.ducking) {
              this.playSound(this.soundFx.BUTTON_PRESS);
              this.tRex.startJump(this.currentSpeed);
            }
          } else if (this.playing && Runner.keycodes.DUCK[e.keyCode]) {
            e.preventDefault();
            if (this.tRex.jumping) {
              // Speed drop, activated only when jump key is not pressed.
              this.tRex.setSpeedDrop();
            } else if (!this.tRex.jumping && !this.tRex.ducking) {
              // Duck.
              this.tRex.setDuck(true);
            }
          }
        } else if (this.crashed && e.type == Runner.events.TOUCHSTART &&
            e.currentTarget == this.containerEl) {
              console.log("restart 2")
          this.restart();
        }
      },
    
    
            /**
             * Process keydown.
             * @param {Event} e
             */
            onKeyDown: function (e) {
                // Prevent native page scrolling whilst tapping on mobile.
                if (IS_MOBILE && this.playing) {
                    e.preventDefault();
                }
    
                if (e.target != this.detailsButton) {
                    if (!this.crashed && (Runner.keycodes.JUMP[e.keyCode] ||
                        e.type == Runner.events.TOUCHSTART)) {
                        if (!this.playing) {
                            this.loadSounds();
                            this.playing = true;
                            this.update();
                            if (window.errorPageController) {
                                errorPageController.track();
                            }
                        }
                        //  Play sound effect and jump on starting the game for the first time.
                        if (!this.tRex.jumping && !this.tRex.ducking) {
                            this.playSound(this.soundFx.BUTTON_PRESS);
                            this.tRex.startJump(this.currentSpeed);
                        }
                    }
    
                    if (this.crashed && e.type == Runner.events.TOUCHSTART &&
                        e.currentTarget == this.containerEl) {
                        console.log("restart 3")
                        this.restart();
                    }
                }
    
                if (this.playing && !this.crashed && Runner.keycodes.DUCK[e.keyCode]) {
                    e.preventDefault();
                    if (this.tRex.jumping) {
                        // Speed drop, activated only when jump key is not pressed.
                        this.tRex.setSpeedDrop();
                    } else if (!this.tRex.jumping && !this.tRex.ducking) {
                        // Duck.
                        this.tRex.setDuck(true);
                    }
                }
            },
    
    
      /**
       * Process keydown.
       * @param {Event} e
       */
      onKeyDown: function(e) {
        // Prevent native page scrolling whilst tapping on mobile.
        if (IS_MOBILE && this.playing) {
          e.preventDefault();
        }
        if (!this.crashed && !this.paused) {
          if (Runner.keycodes.JUMP[e.keyCode] ||
              e.type == Runner.events.TOUCHSTART) {
            e.preventDefault();
            // Starting the game for the first time.
            if (!this.playing) {
              this.loadSounds();
              this.playing = true;
              this.update();
              if (window.errorPageController) {
                errorPageController.track();
              }
            }
            // Start jump.
            if (!this.tRex.jumping && !this.tRex.ducking) {
              this.playSound(this.soundFx.BUTTON_PRESS);
              this.tRex.startJump(this.currentSpeed);
            }
          } else if (this.playing && Runner.keycodes.DUCK[e.keyCode]) {
            e.preventDefault();
            if (this.tRex.jumping) {
              // Speed drop, activated only when jump key is not pressed.
              this.tRex.setSpeedDrop();
            } else if (!this.tRex.jumping && !this.tRex.ducking) {
              // Duck.
              this.tRex.setDuck(true);
            }
          }
        } else if (this.crashed && e.type == Runner.events.TOUCHSTART &&
            e.currentTarget == this.containerEl) {
            console.log("restart 5")
          this.restart();
        }
      },
      /**
       * Process key up.
       * @param {Event} e
       */
      onKeyUp: function(e) {
        var keyCode = String(e.keyCode);
        var isjumpKey = Runner.keycodes.JUMP[keyCode] ||
           e.type == Runner.events.TOUCHEND ||
           e.type == Runner.events.MOUSEDOWN;
        if (this.isRunning() && isjumpKey) {
          this.tRex.endJump();
        } else if (Runner.keycodes.DUCK[keyCode]) {
          this.tRex.speedDrop = false;
          this.tRex.setDuck(false);
        } else if (this.crashed) {
          // Check that enough time has elapsed before allowing jump key to restart.
          var deltaTime = getTimeStamp() - this.time;
          if (Runner.keycodes.RESTART[keyCode] || this.isLeftClickOnCanvas(e) ||
              (deltaTime >= this.config.GAMEOVER_CLEAR_TIME &&
              Runner.keycodes.JUMP[keyCode])) {
            console.log("restart 7")
            this.restart();
          }
        } else if (this.paused && isjumpKey) {
          // Reset the jump state
          this.tRex.reset();
          this.play();
        }
      },
      /**
       * Returns whether the event was a left click on canvas.
       * On Windows right click is registered as a click.
       * @param {Event} e
       * @return {boolean}
       */
      isLeftClickOnCanvas: function(e) {
        return e.button != null && e.button < 2 &&
            e.type == Runner.events.MOUSEUP && e.target == this.canvas;
      },
      /**
       * RequestAnimationFrame wrapper.
       */
      scheduleNextUpdate: function() {
        
        if (!this.updatePending) {
          this.updatePending = true;
          this.raqId = requestAnimationFrame(this.update.bind(this));
        }
      },
      /**
       * Whether the game is running.
       * @return {boolean}
       */
      isRunning: function() {
        return !!this.raqId;
      },
      /**
       * Game over state.
       */
      gameOver: function() {
        if(!this.replaying) logger.gameOver(this.horizon.obstacles[0], this, this.tRex, this.parameters);
        this.playSound(this.soundFx.HIT);
        vibrate(200);
        
        this.stop();
        this.crashed = true;
        this.distanceMeter.acheivement = false;
        
        this.tRex.update(100, Trex.status.CRASHED);
        
        // Game over panel.
        if (!this.gameOverPanel) {
          this.gameOverPanel = new GameOverPanel(this.canvas,
              this.spriteDef.TEXT_SPRITE, this.spriteDef.RESTART,
              this.dimensions);
        } else {
          this.gameOverPanel.draw();
        }
        // Update the high score.
        if (this.distanceRan > this.highestScore) {
          if(!this.replaying) logger.store("newHighScore", true);
          this.highestScore = Math.ceil(this.distanceRan);
          this.distanceMeter.setHighScore(this.highestScore);
        }
        // Reset the time clock.
        this.time = getTimeStamp();

        var evt = document.createEvent("Event");
        evt.initEvent("GAMEOVER", true, true);
        document.dispatchEvent(evt);
      },
      stop: function() {
        this.playing = false;
        this.paused = true;
        cancelAnimationFrame(this.raqId);
        this.raqId = 0;
      },
      play: function() {
        if (!this.crashed) {
          this.playing = true;
          this.paused = false;
          this.tRex.update(0, Trex.status.RUNNING);
          this.time = getTimeStamp();
          this.update();
        }
      },
      restart: function() {
        console.log("restart")
        if (!this.raqId) {
          this.playCount++;
          this.runningTime = 0;
          this.playing = true;
          this.paused = false;
          this.crashed = false;
          this.distanceRan = 0;
          this.setSpeed(this.config.SPEED);
          this.time = getTimeStamp();
          this.containerEl.classList.remove(Runner.classes.CRASHED);
          this.clearCanvas();
          this.distanceMeter.reset(this.highestScore);
          this.horizon.reset();
          this.tRex.reset();
          this.playSound(this.soundFx.BUTTON_PRESS);
          this.invert(true);
          this.update();
        }
      },
    
      /**
       * Pause the game if the tab is not in focus.
       */
      onVisibilityChange: function(e) {
        if (document.hidden || document.webkitHidden || e.type == 'blur' ||
          document.visibilityState != 'visible') {
          this.stop();
        } else if (!this.crashed) {
          this.tRex.reset();
          this.play();
        }
      },
      /**
       * Play a sound.
       * @param {SoundBuffer} soundBuffer
       */
      playSound: function(soundBuffer) {
        if (soundBuffer) {
          var sourceNode = this.audioContext.createBufferSource();
          sourceNode.buffer = soundBuffer;
          sourceNode.connect(this.audioContext.destination);
          sourceNode.start(0);
        }
      },
      /**
       * Inverts the current page / canvas colors.
       * @param {boolean} Whether to reset colors.
       */
      invert: function(reset) {
        if (reset) {
          document.body.classList.toggle(Runner.classes.INVERTED, false);
          this.invertTimer = 0;
          this.inverted = false;
        } else {
          if(!this.replaying) logger.addLog("invert");
          this.inverted = document.body.classList.toggle(Runner.classes.INVERTED,
              this.invertTrigger);
        }
      }
    };
    
    
     /**
     * Updates the canvas size taking into
     * account the backing store pixel ratio and
     * the device pixel ratio.
     *
     * See article by Paul Lewis:
     * http://www.html5rocks.com/en/tutorials/canvas/hidpi/
     *
     * @param {HTMLCanvasElement} canvas
     * @param {number} opt_width
     * @param {number} opt_height
     * @return {boolean} Whether the canvas was scaled.
     */
    Runner.updateCanvasScaling = function(canvas, opt_width, opt_height) {
      var context = canvas.getContext('2d');
      // Query the various pixel ratios
      var devicePixelRatio = Math.floor(window.devicePixelRatio) || 1;
      var backingStoreRatio = Math.floor(context.webkitBackingStorePixelRatio) || 1;
      var ratio = devicePixelRatio / backingStoreRatio;
      // Upscale the canvas if the two ratios don't match
      if (devicePixelRatio !== backingStoreRatio) {
        var oldWidth = opt_width || canvas.width;
        var oldHeight = opt_height || canvas.height;
        canvas.width = oldWidth * ratio;
        canvas.height = oldHeight * ratio;
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        // Scale the context to counter the fact that we've manually scaled
        // our canvas element.
        context.scale(ratio, ratio);
        return true;
      } else if (devicePixelRatio == 1) {
        // Reset the canvas width / height. Fixes scaling bug when the page is
        // zoomed and the devicePixelRatio changes accordingly.
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
      }
      return false;
    };
    /**
     * Get random number.
     * @param {number} min
     * @param {number} max
     * @param {number}
     */
    function getRandomNum(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /**
     * Get random number in gaussian distribution
     * @param {number} min
     * @param {number} max
     */
    function getRandomGaussian(min, max) {
      return Math.floor(min + gaussianRand() * (min - max + 1));
    }
    function gaussianRand() {
      var rand = 0;
    
      for (var i = 0; i < 6; i += 1) {
        rand += Math.random();
      }
    
      return rand / 6;
    }
    
    /**
     * Get random from (1-) squared stochastic variable
     * Higher chance to get values closer to max
     * CDF: sqrt(x)
     * PDF: 1/(2*sqrt(x))
     * @param {number} min 
     * @param {number} max 
     */
    function getRandomSquared(pow, min, max){
      var rand = Math.random();
      var sq = 1-Math.pow(rand, pow);
      return Math.floor(sq * (max - min + 1)) + min;
    }

    /**
     * 
     * @param {number} spec distribution e.g. {'CACTUS_LARGE' : 0.35, 'CACTUS_SMALL': 0.35, 'PTERODACTYL': 0.3}
     */
    function getRandomWeighted(spec){
      var i, j, table=[];
      for (i in spec) {
        // The constant 10 below should be computed based on the
        // weights in the spec for a correct and optimal table size.
        // E.g. the spec {0:0.999, 1:0.001} will break this impl.
        for (j=0; j<spec[i]*10; j++) {
          table.push(i);
        }
      }
      return table[Math.floor(Math.random() * table.length)];
      
    }
    /**
     * Vibrate on mobile devices.
     * @param {number} duration Duration of the vibration in milliseconds.
     */
    function vibrate(duration) {
      if (IS_MOBILE && window.navigator.vibrate) {
        window.navigator.vibrate(duration);
      }
    }
    /**
     * Create canvas element.
     * @param {HTMLElement} container Element to append canvas to.
     * @param {number} width
     * @param {number} height
     * @param {string} opt_classname
     * @return {HTMLCanvasElement}
     */
    function createCanvas(container, width, height, opt_classname) {
      var canvas = document.createElement('canvas');
      canvas.className = opt_classname ? Runner.classes.CANVAS + ' ' +
          opt_classname : Runner.classes.CANVAS;
      canvas.width = width;
      canvas.height = height;
      container.appendChild(canvas);
      return canvas;
    }
    /**
     * Decodes the base 64 audio to ArrayBuffer used by Web Audio.
     * @param {string} base64String
     */
    function decodeBase64ToArrayBuffer(base64String) {
      var len = (base64String.length / 4) * 3;
      var str = atob(base64String);
      var arrayBuffer = new ArrayBuffer(len);
      var bytes = new Uint8Array(arrayBuffer);
      for (var i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i);
      }
      return bytes.buffer;
    }
    /**
     * Return the current timestamp.
     * @return {number}
     */
    function getTimeStamp() {
      return IS_IOS ? new Date().getTime() : performance.now();
    }

    function sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
          break;
        }
      }
    }
    
    window["Logger"] = Logger;
    //var logger = new Logger();

    //******************************************************************************
    /**
     * Game over panel.
     * @param {!HTMLCanvasElement} canvas
     * @param {Object} textImgPos
     * @param {Object} restartImgPos
     * @param {!Object} dimensions Canvas dimensions.
     * @constructor
     */
    function GameOverPanel(canvas, textImgPos, restartImgPos, dimensions) {
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');
      this.canvasDimensions = dimensions;
      this.textImgPos = textImgPos;
      this.restartImgPos = restartImgPos;
      this.draw();
    };
    /**
     * Dimensions used in the panel.
     * @enum {number}
     */
    GameOverPanel.dimensions = {
      TEXT_X: 0,
      TEXT_Y: 13,
      TEXT_WIDTH: 191,
      TEXT_HEIGHT: 11,
      RESTART_WIDTH: 36,
      RESTART_HEIGHT: 32
    };
    GameOverPanel.prototype = {
      /**
       * Update the panel dimensions.
       * @param {number} width New canvas width.
       * @param {number} opt_height Optional new canvas height.
       */
      updateDimensions: function(width, opt_height) {
        this.canvasDimensions.WIDTH = width;
        if (opt_height) {
          this.canvasDimensions.HEIGHT = opt_height;
        }
      },
      /**
       * Draw the panel.
       */
      draw: function() {
        var dimensions = GameOverPanel.dimensions;
        var centerX = this.canvasDimensions.WIDTH / 2;
        // Game over text.
        var textSourceX = dimensions.TEXT_X;
        var textSourceY = dimensions.TEXT_Y;
        var textSourceWidth = dimensions.TEXT_WIDTH;
        var textSourceHeight = dimensions.TEXT_HEIGHT;
        var textTargetX = Math.round(centerX - (dimensions.TEXT_WIDTH / 2));
        var textTargetY = Math.round((this.canvasDimensions.HEIGHT - 25) / 3);
        var textTargetWidth = dimensions.TEXT_WIDTH;
        var textTargetHeight = dimensions.TEXT_HEIGHT;
        var restartSourceWidth = dimensions.RESTART_WIDTH;
        var restartSourceHeight = dimensions.RESTART_HEIGHT;
        var restartTargetX = centerX - (dimensions.RESTART_WIDTH / 2);
        var restartTargetY = this.canvasDimensions.HEIGHT / 2;
        if (IS_HIDPI) {
          textSourceY *= 2;
          textSourceX *= 2;
          textSourceWidth *= 2;
          textSourceHeight *= 2;
          restartSourceWidth *= 2;
          restartSourceHeight *= 2;
        }
        textSourceX += this.textImgPos.x;
        textSourceY += this.textImgPos.y;
        // Game over text from sprite.
        this.canvasCtx.drawImage(Runner.imageSprite,
            textSourceX, textSourceY, textSourceWidth, textSourceHeight,
            textTargetX, textTargetY, textTargetWidth, textTargetHeight);
        // Restart button.
        this.canvasCtx.drawImage(Runner.imageSprite,
            this.restartImgPos.x, this.restartImgPos.y,
            restartSourceWidth, restartSourceHeight,
            restartTargetX, restartTargetY, dimensions.RESTART_WIDTH,
            dimensions.RESTART_HEIGHT);
      }
    };
    //******************************************************************************
    /**
     * Check for a collision.
     * @param {!Obstacle} obstacle
     * @param {!Trex} tRex T-rex object.
     * @param {HTMLCanvasContext} opt_canvasCtx Optional canvas context for drawing
     *    collision boxes.
     * @return {Array<CollisionBox>}
     */
    function checkForCollision(obstacle, tRex, opt_canvasCtx) {
      var obstacleBoxXPos = Runner.defaultDimensions.WIDTH + obstacle.xPos;
      // Adjustments are made to the bounding box as there is a 1 pixel white
      // border around the t-rex and obstacles.
      var tRexBox = new CollisionBox(
          tRex.xPos + 1,
          tRex.yPos + 1,
          tRex.config.WIDTH - 2,
          tRex.config.HEIGHT - 2);
      var obstacleBox = new CollisionBox(
          obstacle.xPos + 1,
          obstacle.yPos + 1,
          obstacle.typeConfig.width * obstacle.size - 2,
          obstacle.typeConfig.height - 2);
      // Debug outer box
      if (opt_canvasCtx) {
        drawCollisionBoxes(opt_canvasCtx, tRexBox, obstacleBox);
      }
      // Simple outer bounds check.
      if (boxCompare(tRexBox, obstacleBox)) {
        var collisionBoxes = obstacle.collisionBoxes;
        var tRexCollisionBoxes = tRex.ducking ?
            Trex.collisionBoxes.DUCKING : Trex.collisionBoxes.RUNNING;
        // Detailed axis aligned box check.
        for (var t = 0; t < tRexCollisionBoxes.length; t++) {
          for (var i = 0; i < collisionBoxes.length; i++) {
            // Adjust the box to actual positions.
            var adjTrexBox =
                createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox);
            var adjObstacleBox =
                createAdjustedCollisionBox(collisionBoxes[i], obstacleBox);
            var crashed = boxCompare(adjTrexBox, adjObstacleBox);
            // Draw boxes for debug.
            if (opt_canvasCtx) {
              drawCollisionBoxes(opt_canvasCtx, adjTrexBox, adjObstacleBox);
            }
            if (crashed) {
              return [adjTrexBox, adjObstacleBox];
            }
          }
        }
      }
      return false;
    };
    /**
     * Adjust the collision box.
     * @param {!CollisionBox} box The original box.
     * @param {!CollisionBox} adjustment Adjustment box.
     * @return {CollisionBox} The adjusted collision box object.
     */
    function createAdjustedCollisionBox(box, adjustment) {
      return new CollisionBox(
          box.x + adjustment.x,
          box.y + adjustment.y,
          box.width,
          box.height);
    };
    /**
     * Draw the collision boxes for debug.
     */
    function drawCollisionBoxes(canvasCtx, tRexBox, obstacleBox) {
      canvasCtx.save();
      canvasCtx.strokeStyle = '#f00';
      canvasCtx.strokeRect(tRexBox.x, tRexBox.y, tRexBox.width, tRexBox.height);
      canvasCtx.strokeStyle = '#0f0';
      canvasCtx.strokeRect(obstacleBox.x, obstacleBox.y,
          obstacleBox.width, obstacleBox.height);
      canvasCtx.restore();
    };
    /**
     * Compare two collision boxes for a collision.
     * @param {CollisionBox} tRexBox
     * @param {CollisionBox} obstacleBox
     * @return {boolean} Whether the boxes intersected.
     */
    function boxCompare(tRexBox, obstacleBox) {
      var crashed = false;
      var tRexBoxX = tRexBox.x;
      var tRexBoxY = tRexBox.y;
      var obstacleBoxX = obstacleBox.x;
      var obstacleBoxY = obstacleBox.y;
      // Axis-Aligned Bounding Box method.
      if (tRexBox.x < obstacleBoxX + obstacleBox.width &&
          tRexBox.x + tRexBox.width > obstacleBoxX &&
          tRexBox.y < obstacleBox.y + obstacleBox.height &&
          tRexBox.height + tRexBox.y > obstacleBox.y) {
        crashed = true;
      }
      return crashed;
    };
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
    function Obstacle(canvasCtx, type, spriteImgPos, dimensions,
        gapCoefficient, speed, opt_xOffset, runner) {
        this.runner = runner;
        this.canvasCtx = canvasCtx;
        this.spritePos = spriteImgPos;
        this.typeConfig = type;
        this.gapCoefficient = gapCoefficient;
        this.size = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH);
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
        this.init(speed);
      
    };
    /**
     * Coefficient for calculating the maximum gap.
     * @const
     */
    Obstacle.MAX_GAP_COEFFICIENT = 1.5;
    /**
     * Maximum obstacle grouping count.
     * @const
     */
    Obstacle.MAX_OBSTACLE_LENGTH = (typeof Obstacle.MAX_OBSTACLE_LENGTH == 'undefined') ? 3 : Obstacle.MAX_OBSTACLE_LENGTH,
    Obstacle.prototype = {
      /**
       * Initialise the DOM for the obstacle.
       * @param {number} speed
       */
      init: function(speed) {
        this.cloneCollisionBoxes();
        // Only allow sizing if we're at the right speed.
        if (this.size > 1 && this.typeConfig.multipleSpeed > speed) { // size is random but since pterodactyl has multipleSpeed 900 -> always size reset to 1
          this.size = 1;
        }
        this.width = this.typeConfig.width * this.size;
        // Check if obstacle can be positioned at various heights.
        if (Array.isArray(this.typeConfig.yPos))  {
          var yPosConfig = IS_MOBILE ? this.typeConfig.yPosMobile :
              this.typeConfig.yPos;
          this.yPos = yPosConfig[getRandomNum(0, yPosConfig.length - 1)];
        } else {
          this.yPos = this.typeConfig.yPos;
        }
        
        
        this.draw();
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
        // For obstacles that go at a different speed from the horizon.
        if (this.typeConfig.speedOffset) {
          this.speedOffset = Math.random() > 0.5 ? this.typeConfig.speedOffset :
              -this.typeConfig.speedOffset;
        } // either x times slower or x times faster than horizon (0.8 for pterodactyl)
        this.gap = this.getGap(this.gapCoefficient, speed);
        var param_obstacle = {
          "typeConfig" : this.typeConfig,
          "size": this.size, // for tree
          "yPos": this.yPos, // for pterodactyl
          "gap": this.gap,
          "speedOffset": this.speedOffset
        }
        if(!this.replaying) logger.addObstacle(param_obstacle);
      },

      /**
       * Draw and crop based on size.
       */
      draw: function() {
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
      },
      /**
       * Obstacle frame update.
       * @param {number} deltaTime
       * @param {number} speed
       */
      update: function(deltaTime, speed) {
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
      },
      /**
       * Calculate a random gap size.
       * - Minimum gap gets wider as speed increses
       * @param {number} gapCoefficient
       * @param {number} speed
       * @return {number} The gap size.
       */
      getGap: function(gapCoefficient, speed) {
        if(this.runner.parameters.getUseGameGap()){
          var minGap = Math.round(this.width * speed +
                this.typeConfig.minGap * gapCoefficient);
          var maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
          var r =  getRandomNum(minGap, maxGap);
          return r
        } else {
          var minGap = this.runner.parameters.getMinGap();
          var maxGap = this.runner.parameters.getMaxGap();
          var r = getRandomSquared(this.runner.parameters.getGapDistributionPow(), minGap, maxGap);
          return r
        }
      },
      /**
       * Check if obstacle is visible.
       * @return {boolean} Whether the obstacle is in the game area.
       */
      isVisible: function() {
        return this.xPos + this.width > 0;
      },
      /**
       * Make a copy of the collision boxes, since these will change based on
       * obstacle type and size.
       */
      cloneCollisionBoxes: function() {
        var collisionBoxes = this.typeConfig.collisionBoxes;
        for (var i = collisionBoxes.length - 1; i >= 0; i--) {
          this.collisionBoxes[i] = new CollisionBox(collisionBoxes[i].x,
              collisionBoxes[i].y, collisionBoxes[i].width,
              collisionBoxes[i].height);
        }
      }
    };
    /**
     * Obstacle definitions.
     * minGap: minimum pixel space betweeen obstacles.
     * multipleSpeed: Speed at which multiples are allowed.
     * speedOffset: speed faster / slower than the horizon.
     * minSpeed: Minimum speed which the obstacle can make an appearance.
     */
    /*
    var minGap_default = (typeof minGap_default == 'undefined' ? 120 : minGap_default);
    var CACTUS_SMALL = {
      type: 'CACTUS_SMALL',
      width: 17,
      height: 35,
      yPos: 105,
      multipleSpeed: 4,
      minGap: minGap_default, //120,
      minSpeed: 0,
      collisionBoxes: [
        new CollisionBox(0, 7, 5, 27),
        new CollisionBox(4, 0, 6, 34),
        new CollisionBox(10, 4, 7, 14)
      ]
    }

    var CACTUS_LARGE = {
      type: 'CACTUS_LARGE',
      width: 25,
      height: 50,
      yPos: 90,
      multipleSpeed: 7,
      minGap: minGap_default, //120,
      minSpeed: 0,
      collisionBoxes: [
        new CollisionBox(0, 12, 7, 38),
        new CollisionBox(8, 0, 7, 49),
        new CollisionBox(13, 10, 10, 38)
      ]
    }

    var PTERODACTYL = {
      type: 'PTERODACTYL',
      width: 46,
      height: 40,
      yPos: Runner.parameters.getPterodactylYPOS(), //[ 100, 75, 50 ], // Variable height.
      yPosMobile: [ 100, 50 ], // Variable height mobile.
      multipleSpeed: 999,
      minSpeed: 8.5,
      minGap: minGap_default + 30, //150,
      collisionBoxes: [
        new CollisionBox(15, 15, 16, 5),
        new CollisionBox(18, 21, 24, 6),
        new CollisionBox(2, 14, 4, 3),
        new CollisionBox(6, 10, 4, 7),
        new CollisionBox(10, 8, 6, 9)
      ],
      numFrames: 2,
      frameRate: 1000/6,
      speedOffset: .8
    }
    Obstacle.types = []
    */


    /*Obstacle.types = [
       {
        type: 'CACTUS_SMALL',
        width: 17,
        height: 35,
        yPos: 105,
        multipleSpeed: 4,
        minGap: 120,
        minSpeed: 0,
        collisionBoxes: [
          new CollisionBox(0, 7, 5, 27),
          new CollisionBox(4, 0, 6, 34),
          new CollisionBox(10, 4, 7, 14)
        ]
      },
      {
        type: 'CACTUS_LARGE',
        width: 25,
        height: 50,
        yPos: 90,
        multipleSpeed: 7,
        minGap: 120,
        minSpeed: 0,
        collisionBoxes: [
          new CollisionBox(0, 12, 7, 38),
          new CollisionBox(8, 0, 7, 49),
          new CollisionBox(13, 10, 10, 38)
        ]
      },
      {
        type: 'PTERODACTYL',
        width: 46,
        height: 40,
        yPos: [ 100, 75, 50 ], // Variable height.
        yPosMobile: [ 100, 50 ], // Variable height mobile.
        multipleSpeed: 999,
        minSpeed: 8.5,
        minGap: 150,
        collisionBoxes: [
          new CollisionBox(15, 15, 16, 5),
          new CollisionBox(18, 21, 24, 6),
          new CollisionBox(2, 14, 4, 3),
          new CollisionBox(6, 10, 4, 7),
          new CollisionBox(10, 8, 6, 9)
        ],
        numFrames: 2,
        frameRate: 1000/6,
        speedOffset: .8
      }
    ];*/
   
   /* var obstacleTypes = parameters.getObstacleTypes();
    var nr_ObstacleTypes = obstacleTypes.length;
    for(var i = 0; i < nr_ObstacleTypes; i++){
      var type = obstacleTypes[i];
      switch(type){
        case 'CACTUS_SMALL':
          Obstacle.types.push(CACTUS_SMALL);
          break;
        case 'CACTUS_LARGE':
          Obstacle.types.push(CACTUS_LARGE);
          break;
        case 'PTERODACTYL':
          if(nr_ObstacleTypes == 1){
            PTERODACTYL.minSpeed = 0;
          } else if (nr_ObstacleTypes == 2){
          Runner.config.MAX_OBSTACLE_DUPLICATION = 7;
          }
          Obstacle.types.push(PTERODACTYL)
          break;
      }
    }

    if(nr_ObstacleTypes == 1){
      Runner.config.MAX_OBSTACLE_DUPLICATION = Number.MAX_SAFE_INTEGER;
    }*/

    
  
    
    
    function onDocumentLoad() {
      
      var par = {
        SPEED: 10, 
        ACCELERATION: 0.002,  
        MIN_GAP: 400,
        OBSTACLE_TYPES: [ 'CACTUS_LARGE', 'CACTUS_SMALL', 'PTERODACTYL'], 
        OBSTACLE_TYPES_SPEC: {'CACTUS_LARGE' : 1, 'CACTUS_SMALL': 0, 'PTERODACTYL': 0}, 
        NIGHT_MODE_ENABLED: true, 
        NIGHT_MODE_DISTANCE: 700, 
        CLEAR_TIME: 0, 
        MAX_OBSTACLE_LENGTH: 1, 
        MAX_SPEED: 10, 
        PTERODACTYL_YPOS: [ 50, 75, 100 ], 
        CHECK_DUPLICATION: false,
        MAX_OBSTACLE_DUPLICATION: 2,
        USE_GAME_GAP: false,
        MAX_GAP: 400,
        GAP_DISTRIBUTION_POW: 2,
      }
      var r = new Runner('.interstitial-wrapper', par);
      var logger = new Logger();
      window.logger = logger;
      document.addEventListener("GAMEOVER", function(){
        var p = logger.getParams()
        r.replay(p)
      } ,false);

    }
    
    document.addEventListener('DOMContentLoaded', onDocumentLoad);
    