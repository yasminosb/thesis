var server_url = "http://127.0.0.1:3000/"

// -------------------------
// ***** POST REQUESTS *****
// -------------------------

function postGameplayToServer(value) {
  console.log("POST GAME TO SERVER");
  var xhr = new XMLHttpRequest();
  var yourUrl = server_url.concat('gameplay/',getUserCookie());
  xhr.open("POST", yourUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(value);
}

function postQuestionResponseToServer(value) {
  console.log("POST QUESTIONRESPONSE TO SERVER");
  var xhr = new XMLHttpRequest();
  var yourUrl = server_url.concat('questionresponse/', getUserCookie());
  xhr.open("POST", yourUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(value);
}

// ------------------------
// ***** GET REQUESTS *****
// ------------------------

function getLastGameFromServer() {
  console.log("GET LASTGAME FROM SERVER");
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    var yourUrl = server_url.concat('lastgameplay/',getUserCookie());

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        resolve(xhr.response);
      }
    }

    xhr.open("GET", yourUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send('');
  });
}


function handleServerGameplayResponse(response) {
  var response = JSON.parse(response);
  response.events = fixEventsObjects(response.events);
  r = new ReplayRunner('.interstitial-wrapper', response.parameters, response.events, response.obstacles);
}

function getLast2GameplayIdsFromServer() {
  console.log("GET LASTGAME2GAMEPLAYIDS FROM SERVER");
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    var yourUrl = server_url.concat('last2gameplayids/', getUserCookie());

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        resolve(xhr.response);
      }
    }

    xhr.open("GET", yourUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send('');
  });
}

function getUserHasPlayed2GamesFromServer(){
  console.log("GET USERHASPLAYED2GAMES FROM SERVER");
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    var yourUrl = server_url.concat('hasplayed2games/', getUserCookie());

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        resolve(xhr.response);
      }
    }

    xhr.open("GET", yourUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send('');
  });
}



// -----------------
// ***** UTILS *****
// -----------------

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