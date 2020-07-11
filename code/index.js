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
    OBSTACLE_TYPES_SPEC: { 'CACTUS_LARGE': 0, 'CACTUS_SMALL': 0, 'PTERODACTYL': 1 },
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

  var events = [];
  var replay = false;
  if(replay){
    var r = new ReplayRunner('.interstitial-wrapper', par, events);
  } else {
    var r = new Runner('.interstitial-wrapper', par);
  }
  var logger = new Logger();
  window.logger = logger;
  document.addEventListener("GAMEOVER", function () {
    var p = logger.getParams(); 
    console.log(p);
    var serial = logger.serialize();
    console.log(p.events);
    console.log(p.obstacles);
    r = new ReplayRunner('.interstitial-wrapper', par, p.events, p.obstacles);
    postToServer(serial);
  }, false);
}

function postToServer(value){
  console.log("POSTING TO SERVER")
  console.log(value)
  var xhr = new XMLHttpRequest();
  var yourUrl = 'http://127.0.0.1:3000';
  //var value = "value";
  xhr.open("POST", yourUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(value);
}

document.addEventListener('DOMContentLoaded', onDocumentLoad);