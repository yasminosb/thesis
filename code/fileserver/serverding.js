var http = require('http');

const server = http.createServer(function(request, response) {
    console.dir(request.param)
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
      })
    } else {
      console.log('TIS GENE JUSTE REQUEST')
    }
  })
  
  const port = 3000
  const host = '127.0.0.1'
  server.listen(port, host)
  console.log(`Listening at http://${host}:${port}`);