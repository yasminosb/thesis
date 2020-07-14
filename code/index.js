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
    console.log("GAMEOVER triggered")
    var p = logger.getParams();
    console.log("params", p)

    if(true){
      var serial = logger.serialize();
      postToServer(serial);
      getFromServer();
    } else {
      r = new ReplayRunner('.interstitial-wrapper', par, p.events, p.obstacles);
    }
  }, false);


  function postToServer(value){
    console.log("POST TO SERVER");
    var xhr = new XMLHttpRequest();
    var yourUrl = 'http://127.0.0.1:3000';
    xhr.open("POST", yourUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(value);
  }

  function getFromServer(){
    console.log("GET FROM SERVER");
    var xhr = new XMLHttpRequest();
    var yourUrl = 'http://127.0.0.1:3000';

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        handleServerResponse(xhr.response);
      }
    }

    xhr.open("GET", yourUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send('');
  }

  function handleServerResponse(response){
    console.log("HANDLE SERVER RESPONSE")
    console.log(response)
    var response = JSON.parse(response);
    response.events = fixEvents(response.events);
    console.log(response);
    r = new ReplayRunner('.interstitial-wrapper', par, response.events, response.obstacles);
  }

  function fixEvents(events){
    return events.map(ev => {
      if(ev.event.keyCode){
        var keyboardevent = new KeyboardEvent(ev.event.type);
        Object.defineProperty(keyboardevent, 'keyCode', {
          get : () => ev.event.keyCode
        });
        return {time: ev.time, event: keyboardevent};
      } else {
        return {time: ev.time, event: new MouseEvent(ev.event)};
      }
    })
  }


}

document.addEventListener('DOMContentLoaded', onDocumentLoad);