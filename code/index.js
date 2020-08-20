// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
window['Runner'] = Runner;
Runner.parameters = new Parameters();
window["Logger"] = Logger;

var form_timeout = 1000;

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
        CHECK_DUPLICATION: false,
        MAX_OBSTACLE_DUPLICATION: 2,
        USE_GAME_GAP: false,
        MAX_GAP: 240,
        GAP_DISTRIBUTION_POW: 2,
    }

    var show_form = false; // FOR DEBUG

    // get random parameters
    var par = generate_random_parameters();
    
    console.log("parameters", par)

    var r = new Runner('.interstitial-wrapper', par);
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
                // stop handling events when the form is displayed
                r.stopListening();
                // wait a few secs before showing form
                await new Promise(r => setTimeout(r, form_timeout)); 
                // show form
                generate_form();
                hideGame_showForm();
                start_form_timer();
            }
        } else {
            logger.reset();
        }
    }, false);

    document.addEventListener("FORMSUBMIT", function(){
        hideForm_showGame();    
        r.startListening();
        logger.reset();
    }, false)


    document.getElementById("submitbutton").addEventListener("click", submitForm, false);
}

document.addEventListener('DOMContentLoaded', onDocumentLoad);




