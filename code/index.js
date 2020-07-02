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
    r = new ReplayRunner('.interstitial-wrapper', par, p.events, p.obstacles);
  }, false);
}

document.addEventListener('DOMContentLoaded', onDocumentLoad);