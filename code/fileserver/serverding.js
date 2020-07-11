var http = require('http');

const server = http.createServer(function(request, response) {
    console.log("request", request.method);
    if (request.method == 'OPTIONS') {
        console.log('OPTIONS')
        response.writeHead(200, 
          {'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          })
        response.end('options received')
    } else if (request.method == 'POST') {
      console.log('POST')
      var body = ''
      request.on('data', function(data) {
        body += data
        console.log('Partial body: ' + body)
      })
      request.on('end', function() {
        console.log('Body: ' + body)
        response.writeHead(200, {'Content-Type': 'text/html'})
        response.end('post received')
        writeToFile(body);
      })
    } else {
      console.log('WRONG REQUEST', request.method)
    }
  })

fs = require('fs');

function writeToFile(data){
  var filename = "helloworld.txt";
  //var data = 'Hello World!';
  fs.writeFile(filename, data, function (err) {
    if (err){ 
      return console.log(err);
    }
    console.log('Hello World > helloworld.txt');
  });
}
  
  const port = 3000
  const host = '127.0.0.1'
  server.listen(port, host)
  console.log(`Listening at http://${host}:${port}`);