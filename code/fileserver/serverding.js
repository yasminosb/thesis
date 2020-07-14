var http = require('http');
var fs = require('fs');
var file = 'jason.json'

const server = http.createServer(function(request, response) {
    console.log("request", request.method);
    if (request.method == 'OPTIONS') {
        console.log('OPTIONS')
        response.writeHead(200, {
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          });
        response.end('options received')
    } else if (request.method == 'POST') {
      console.log('POST')
      var body = ''
      request.on('data', function(data) {
        body += data
        //console.log('Partial body: ' + body)
      })
      request.on('end', function() {
        //console.log('Body: ' + body)
        response.writeHead(200, {
          'Content-Type': 'text/html', 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        });
        response.end('post received')
        writeToFile(body);
      })
    } else if(request.method == 'GET'){
      response.writeHead(200, { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
        });
        var obj;
        fs.readFile(file, 'utf8', function (err, data) {
          if (err) throw err;
          obj = JSON.parse(data);
          response.end(JSON.stringify(obj));
        });
    } else {
      console.log('WRONG REQUEST', request.method)
    }
})



function writeToFile(data){
  fs.writeFile(file, data, function (err) {
    if (err){ 
      return console.log(err);
    }
    console.log('data written to jason.json');
  });
}
  
  const port = 3000
  const host = '127.0.0.1'
  server.listen(port, host)
  console.log(`Listening at http://${host}:${port}`);