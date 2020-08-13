var server_url = "http://127.0.0.1:3000/"

// -------------------------
// ***** POST REQUESTS *****
// -------------------------

function postGameplayToServer(value) {
  console.log("POST GAME TO SERVER");
  var url = server_url.concat('gameplay/',getUserCookie());
  return postJSONtoServer(value, url);
}

function postQuestionResponseToServer(value) {
  console.log("POST QUESTIONRESPONSE TO SERVER");
  var url = server_url.concat('questionresponse/', getUserCookie());
  return postJSONtoServer(value, url);
}

function postJSONtoServer(json, url){
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        resolve(xhr.response);
      }
    }
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(json);
  });
}

// ------------------------
// ***** GET REQUESTS *****
// ------------------------

function getLastGameFromServer() {
  console.log("GET LASTGAME FROM SERVER");
  var url = server_url.concat('lastgameplay/',getUserCookie());
  return getUrlFromServer(url);
}

function handleServerGameplayResponse(response) {
  var response = JSON.parse(response);
  response.events = fixEventsObjects(response.events);
  return response;
//  r = new ReplayRunner('.interstitial-wrapper', response.parameters, response.events, response.obstacles);
}

function getLast2GameplayIdsFromServer() {
  console.log("GET LASTGAME2GAMEPLAYIDS FROM SERVER");
  var url = server_url.concat('last2gameplayids/', getUserCookie());
  return getUrlFromServer(url);
}

function getLast2GameplaysFromServer() {
  console.log("GET LASTGAME2GAMEPLAYS FROM SERVER");
  var url = server_url.concat('last2gameplays/', getUserCookie());
  return getUrlFromServer(url);
}

function getUserHasPlayed2GamesFromServer(){
  console.log("GET USERHASPLAYED2GAMES FROM SERVER");
  var url = server_url.concat('hasplayed2games/', getUserCookie());
  return getUrlFromServer(url);
}

function getGameplayFromServer(game_id){
  console.log("GET USERHASPLAYED2GAMES FROM SERVER");
  var url = server_url.concat('gameplay/', game_id);
  return getUrlFromServer(url);
}

function getUrlFromServer(url){
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        resolve(xhr.response);
      }
    }

    xhr.open("GET", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send('');
  });
}

// ---------------------
// ******* UTILS *******
// ---------------------

function fixEventsObjects(events) {
  return events.map(ev => {
    if (ev.event.keyCode) {
      var keyboardevent = new KeyboardEvent(ev.event.type);
      Object.defineProperty(keyboardevent, 'keyCode', {
        get: () => ev.event.keyCode
      });
      return { time: ev.time, event: keyboardevent };
    } else {
      var mouseevent = new MouseEvent(ev.event.type)
      return { time: ev.time, event: mouseevent };
    }
  })
}