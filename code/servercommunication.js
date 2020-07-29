
  function postGameplayToServer(value){
    console.log("POST GAME TO SERVER");
    var xhr = new XMLHttpRequest();
    var yourUrl = 'http://127.0.0.1:3000/gameplay';
    xhr.open("POST", yourUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(value);
  }

  function postQuestionResponseToServer(value){
    console.log("POST QUESTIONRESPONSE TO SERVER");
    var xhr = new XMLHttpRequest();
    var yourUrl = 'http://127.0.0.1:3000/questionresponse';
    xhr.open("POST", yourUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(value);
  }

  function getLastGameFromServer(){
    console.log("GET LASTGAME FROM SERVER");
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        var yourUrl = 'http://127.0.0.1:3000/lastgameplay';

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                resolve(xhr.response);
            }
        }

        xhr.open("GET", yourUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send('');
    });
  }

  function getLast2GameplayIdsFromServer(){
    console.log("GET LASTGAME2GAMEPLAYIDS FROM SERVER");
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        var yourUrl = 'http://127.0.0.1:3000/last2gameplayids';

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                resolve(xhr.response);
            }
        }

        xhr.open("GET", yourUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send('');
    });
  }



  function handleServerGameplayResponse(response){
    var response = JSON.parse(response);
    response.events = fixEventsObjects(response.events);
    r = new ReplayRunner('.interstitial-wrapper', response.parameters, response.events, response.obstacles);
  }

  function fixEventsObjects(events){
    return events.map(ev => {
      if(ev.event.keyCode){
        var keyboardevent = new KeyboardEvent(ev.event.type);
        Object.defineProperty(keyboardevent, 'keyCode', {
          get : () => ev.event.keyCode
        });
        return {time: ev.time, event: keyboardevent};
      } else {
        var mouseevent = new MouseEvent(ev.event.type)
        return {time: ev.time, event: mouseevent};
      }
    })
  }