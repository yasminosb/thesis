var server_url = "http://161.35.92.218/proxy/";
//var server_url = "http://127.0.0.1:3001/";

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

function getAllGameplaysFromServer(){
  console.log("GET ALLGAMEPLAYS FROM SERVER");
  var url = server_url.concat('allgameplays/');
  return getUrlFromServer(url);
}

function getGameplayFromServer(game_id){
  console.log("GET USERHASPLAYED2GAMES FROM SERVER");
  var url = server_url.concat('gameplay/', game_id);
  return getUrlFromServer(url);
}

function getNumberOfGameplaysFromServer(){
  console.log("GET NUMBEROF GAMEPLAYS FROM SERVER");
  var url = server_url.concat('numberofgameplays/');
  return getUrlFromServer(url);
}

function getNumberOfQuestionResponsesFromServer(){
  console.log("GET NUMBEROF QUESTIONRESPONSES FROM SERVER");
  var url = server_url.concat('numberofquestionresponses/');
  return getUrlFromServer(url);
}

function getAllScoresFromServer(){
  console.log("GET ALLSCORES FROM SERVER");
  var url = server_url.concat('allscores/');
  return getUrlFromServer(url);
}

function getAllCollisionObstaclesFromServer(){
  console.log("GET ALLCOLLISIONOBSTACLES FROM SERVER");
  var url = server_url.concat('collisionobstacles/');
  return getUrlFromServer(url);
}

function getAllInvertedGameOversFromServer(){
  console.log("GET ALLINVERTEDGAMEOVERS FROM SERVER");
  var url = server_url.concat('invertedgameovers/');
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
