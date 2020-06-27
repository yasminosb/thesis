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
    MIN_GAP: 400,
    OBSTACLE_TYPES: ['CACTUS_LARGE', 'CACTUS_SMALL', 'PTERODACTYL'],
    OBSTACLE_TYPES_SPEC: { 'CACTUS_LARGE': 1, 'CACTUS_SMALL': 0, 'PTERODACTYL': 0 },
    NIGHT_MODE_ENABLED: true,
    NIGHT_MODE_DISTANCE: 100,
    CLEAR_TIME: 0,
    MAX_OBSTACLE_LENGTH: 1,
    MAX_SPEED: 10,
    PTERODACTYL_YPOS: [50, 75, 100],
    CHECK_DUPLICATION: false,
    MAX_OBSTACLE_DUPLICATION: 2,
    USE_GAME_GAP: false,
    MAX_GAP: 400,
    GAP_DISTRIBUTION_POW: 2,
  }

  var events_3jumps = [[{"isTrusted":true},206.9599999995262],[{"isTrusted":true},274.45999999872583],[{"isTrusted":true},312.08999999944353],[{"isTrusted":true},406.3899999982823],[{"isTrusted":true},2006.7399999988993],[{"isTrusted":true},2134.569999998348],[{"isTrusted":true},2854.779999999664],[{"isTrusted":true},3022.6549999988492],[{"isTrusted":true},3705.1049999990937],[{"isTrusted":true},3862.439999998969]];
  var replay = false;
  if(replay){
    var r = new ReplayRunner('.interstitial-wrapper', par, events_3jumps);
  } else {
    var r = new Runner('.interstitial-wrapper', par);
  }
  var logger = new Logger();
  window.logger = logger;
  document.addEventListener("GAMEOVER", function () {
    var p = logger.getParams()
    console.log(p)
    console.log(JSON.stringify(p.events));
    r = new Runner('.interstitial-wrapper', par, p.events);
  }, false);
}

document.addEventListener('DOMContentLoaded', onDocumentLoad);
