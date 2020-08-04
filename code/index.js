// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
window['Runner'] = Runner;
Runner.parameters = new Parameters();
window["Logger"] = Logger;

function onDocumentLoad() {

    var par = {
        SPEED: 10,
        ACCELERATION: 0.002,
        MIN_GAP: 200,
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
        MAX_GAP: 400,
        GAP_DISTRIBUTION_POW: 2,
    }

    var r = new Runner('.interstitial-wrapper', par);
    var logger = new Logger(getCookie("UUID"));
    window.logger = logger;

    document.addEventListener("GAMEOVER", async function () {
        console.log("GAMEOVER triggered")
        // post game to server
        var serial = logger.serialize();
        postGameplayToServer(serial);

        // handle form only on ≥ second game
        var userHasPlayed2Games = await getUserHasPlayed2GamesFromServer();
        userHasPlayed2Games = (userHasPlayed2Games === "true");
        if(userHasPlayed2Games){
            await new Promise(r => setTimeout(r, 2000)); 
            r.stopListening();
            generate_form();
            hideGame_showForm();
        } else {
            Runner.config.GAMEOVER_CLEAR_TIME = 2000;
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

async function generate_form(){
    // dynamically generate form based on 2 past games
    console.log("generate form");
    var last2games = JSON.parse(await getLast2GameplaysFromServer());
    console.log(last2games);

    //TODO: load image from server intro form
    add_image_to_element(last2games.lastentry.gameOverScreen, "screenA");
    add_image_to_element(last2games.secondlastentry.gameOverScreen, "screenB");
    
    
}

function add_image_to_element(img_src, element_id){
    var img = document.createElement("img");
    img.src = img_src;
    var element = document.getElementById(element_id);
    element.innerHTML = "";
    element.append(img);
}


