// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
window['Runner'] = Runner;
Runner.parameters = new Parameters();
window["Logger"] = Logger;

// wait 2 seconds before form is shown
// or next game is started (only on first 2 games)
var form_timeout = 2500;

function onDocumentLoad() {

    // debug parameters
    var par = {
        SPEED: 10,
        ACCELERATION: 0.002,
        MIN_GAP: 240,
        OBSTACLE_TYPES: ['CACTUS_LARGE', 'CACTUS_SMALL', 'PTERODACTYL'],
        OBSTACLE_TYPES_SPEC: { 'CACTUS_LARGE': 0.35, 'CACTUS_SMALL': 0.35, 'PTERODACTYL': 0.3 },
        NIGHT_MODE_ENABLED: true,
        NIGHT_MODE_DISTANCE: 100,
        CLEAR_TIME: 0,
        MAX_OBSTACLE_LENGTH: 3,
        MAX_SPEED: 10,
        PTERODACTYL_YPOS: [50, 75, 100],
        MAX_GAP: 240,
    }

    var show_form = true; // FOR DEBUG

    // get random parameters
    var par = generate_random_parameters();
    
    // init runner
    console.log("parameters", par)
    var r = new Runner('.interstitial-wrapper', par);

    // init logger
    var logger = new Logger(getCookie("UUID"));
    window.logger = logger;

    document.addEventListener("GAMEOVER", async function () {
        console.log("GAMEOVER triggered")
        // post game to server
        var serial = logger.serialize();
        await postGameplayToServer(serial);

        if(show_form){

            // handle form only on ≥ second game
            var userHasPlayed2Games = await getUserHasPlayed2GamesFromServer();
            userHasPlayed2Games = (userHasPlayed2Games === "true");

            if(userHasPlayed2Games){
                var last2games = JSON.parse(await getLast2GameplaysFromServer());
                var time_between_games = get_time_between_games(last2games.secondlastentry, last2games.lastentry);
            } else {
                var time_between_games = Number.MAX_SAFE_INTEGER;
            }

            // only show form when the time between last 2 games is not more than 1 hour
            var milliseconds_in_hour = 3600000;
            if(userHasPlayed2Games && time_between_games < milliseconds_in_hour){
                try {
                    // stop handling events when the form is displayed
                    r.stopListening();
                    // wait a few secs before showing form
                    await new Promise(r => setTimeout(r, form_timeout)); 
                    // show form
                    generate_form();
                    hideGame_showForm();
                    start_form_timer();
                } catch (error) {
                    console.error("An error occured while generating form:", error);
                    console.error("restarting game now");
                    new_game();
                }
            } else {
                await new Promise(r => setTimeout(r, form_timeout)); 
                new_game();
            }
        } else {
            logger.reset();
            // new game instance
            new_game();
        }
    }, false);

    document.addEventListener("FORMSUBMIT", function(){
        // display form again
        hideForm_showGame();    
        logger.reset();
        // new game instance
        new_game(); 
    }, false)

    function new_game(){
        // new game instance
        r.stopListening();
        var par = generate_random_parameters();
        console.log("new parameters", par);
        r = new Runner('.interstitial-wrapper', par);
        r.startListening();
    }


    document.getElementById("submitbutton").addEventListener("click", submitForm, false);
}

document.addEventListener('DOMContentLoaded', onDocumentLoad);

function get_time_between_games(firstgame, secondgame){
    var endtime = secondgame.dateTime;
    var starttime = firstgame.dateTime;
    return new Date(endtime) - new Date(starttime);
}