// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';
window['Runner'] = Runner;
Runner.parameters = new Parameters();
window["Logger"] = Logger;

async function onDocumentLoad() {
  // get game id from url
  var url = window.location.href;
  var game_id = new URL(url).searchParams.get("id")

  // get optional jump delay from url
  var delay = parseInt(new URL(url).searchParams.get("delay"));

  // fetch game from server by id
  var response = await getGameplayFromServer(game_id);
  var game = handleServerGameplayResponse(response);
  console.log("game", game);

  // start replay runner
  var r = new ReplayRunner('.interstitial-wrapper', game.parameters, game.events, game.obstacles, delay);

}

document.addEventListener('DOMContentLoaded', onDocumentLoad);