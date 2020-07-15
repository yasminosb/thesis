
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
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        var yourUrl = 'http://127.0.0.1:3000';

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

  function handleServerResponse(response){
    var response = JSON.parse(response);
    response.events = fixEvents(response.events);
    r = new ReplayRunner('.interstitial-wrapper', response.parameters, response.events, response.obstacles);
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
        return {time: ev.time, event: new MouseEvent(ev.event.type)};
      }
    })
  }