/**
 * Parameters that we want to be adjustable
 * default config
 */
Parameters.default_config = {
    SPEED: 6,
    ACCELERATION: 0.002,
    MIN_GAP: 120,
    OBSTACLE_TYPES: ['CACTUS_LARGE', 'CACTUS_SMALL', 'PTERODACTYL'],
    OBSTACLE_TYPES_SPEC: { 'CACTUS_LARGE': 0.33, 'CACTUS_SMALL': 0.33, 'PTERODACTYL': 0.33 },
    NIGHT_MODE_ENABLED: true,
    NIGHT_MODE_DISTANCE: 700,
    CLEAR_TIME: 3000,
    MAX_OBSTACLE_LENGTH: 3,
    MAX_SPEED: 10,
    PTERODACTYL_YPOS: [100, 75, 50],
    CHECK_DUPLICATION: false,
    MAX_DUPLICATION: 2,
    USE_GAME_GAP: false,
    MAX_GAP: 400,
    GAP_DISTRIBUTION_POW: 2
}

function Parameters(opt_config) {
    this.config = opt_config ? opt_config : Parameters.default_config;
}

Parameters.prototype = {
    initialise() {
        this.generateObstacleTypes();
        this.setParameters();
    },
    generateObstacleTypes() {
        /**
         * Obstacle definitions.
         * minGap: minimum pixel space betweeen obstacles.
         * multipleSpeed: Speed at which multiples are allowed.
         * speedOffset: speed faster / slower than the horizon.
         * minSpeed: Minimum speed which the obstacle can make an appearance.
         */
        var minGap_default = this.getMinGap();
        /** declarations of possible obstacle types */
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
            yPos: this.getPterodactylYPOS(), //[ 100, 75, 50 ], // Variable height.
            yPosMobile: [100, 50], // Variable height mobile.
            multipleSpeed: 999,
            minSpeed: 0, //8.5,
            minGap: minGap_default + 30, //150,
            collisionBoxes: [
                new CollisionBox(15, 15, 16, 5),
                new CollisionBox(18, 21, 24, 6),
                new CollisionBox(2, 14, 4, 3),
                new CollisionBox(6, 10, 4, 7),
                new CollisionBox(10, 8, 6, 9)
            ],
            numFrames: 2,
            frameRate: 1000 / 6,
            speedOffset: .8
        }
        Obstacle.types = []

        /* dynamically used obstacletypes */
        var obstacleTypes = this.getObstacleTypes();
        var nr_ObstacleTypes = obstacleTypes.length;
        for (var i = 0; i < nr_ObstacleTypes; i++) {
            var type = obstacleTypes[i];
            switch (type) {
                case 'CACTUS_SMALL':
                    Obstacle.types.push(CACTUS_SMALL);
                    break;
                case 'CACTUS_LARGE':
                    Obstacle.types.push(CACTUS_LARGE);
                    break;
                case 'PTERODACTYL':
                    if (nr_ObstacleTypes == 1) {
                        PTERODACTYL.minSpeed = 0;
                    } else if (nr_ObstacleTypes == 2) {
                        Runner.config.MAX_OBSTACLE_DUPLICATION = 7;
                    }
                    Obstacle.types.push(PTERODACTYL)
                    break;
            }
        }

        if (nr_ObstacleTypes == 1) {
            Runner.config.MAX_OBSTACLE_DUPLICATION = Number.MAX_SAFE_INTEGER;
        }

        /**
         * 3 types : max obstacle duplication = 2 (default)
         * 2 types : max obstacle duplication = 7
         * 1 type  : max obstacle duplication = infinite
         */
    },
    setParameters: function () {
        /**
         * Overwrite necessary parameters:
         * - Runner.config specific parameters
         * - Obstacle.types
         * - minGap_default
         * - Night mode l500
         * - Obstacle.MAX_OBSTACLE_LENGTH
         * TODO: update all parameters in this function, instead of hardcoded
         */
        Runner.config.SPEED = this.getSpeed();
        Runner.config.ACCELERATION = this.getAcceleration();
        Runner.config.INVERT_DISTANCE = this.getNightModeDistance();
        Runner.config.CLEAR_TIME = this.getClearTime();
        Runner.config.MAX_SPEED = this.getMaxSpeed();
        Obstacle.MAX_OBSTACLE_LENGTH = this.getMaxObstacleLength();
        Obstacle.MAX_OBSTACLE_DUPLICATION = this.getMaxObstacleDuplication();
    },
    getSpeed() {
        return this.config.SPEED;
    },
    getAcceleration() {
        return this.config.ACCELERATION;
    },
    getMinGap() {
        return this.config.MIN_GAP;
    },
    getObstacleTypes() {
        return this.config.OBSTACLE_TYPES;
    },
    isNightModeEnabled() {
        return this.config.NIGHT_MODE_ENABLED;
    },
    getNightModeDistance() {
        return this.config.NIGHT_MODE_DISTANCE;
    },
    getClearTime() {
        return this.config.CLEAR_TIME;
    },
    getMaxObstacleLength() {
        return this.config.MAX_OBSTACLE_LENGTH;
    },
    getMaxSpeed() {
        return this.config.MAX_SPEED;
    },
    getPterodactylYPOS() {
        return this.config.PTERODACTYL_YPOS;
    },
    getObstacleTypesSpec() {
        return this.config.OBSTACLE_TYPES_SPEC;
    },
    getMaxGap() {
        return this.config.MAX_GAP;
    },
    getUseGameGap() {
        return this.config.USE_GAME_GAP;
    },
    getGapDistributionPow() {
        return this.config.GAP_DISTRIBUTION_POW;
    },
    getMaxObstacleDuplication() {
        return this.config.MAX_OBSTACLE_DUPLICATION;
    },
    checkDuplication() {
        return this.config.CHECK_DUPLICATION;
    }
}