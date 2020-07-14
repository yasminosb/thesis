var http = require('http');
var fs = require('fs');
var file = 'jason.json'

var use_database = true;

const server = http.createServer(async function(request, response) {
    console.log(request.method);
    if (request.method == 'OPTIONS') {
        response.writeHead(200, {
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          });
        response.end('options received')
    } else if (request.method == 'POST') {
      var body = ''
      request.on('data', function(data) {
        body += data
      })
      request.on('end', function() {
        response.writeHead(200, {
          'Content-Type': 'text/html', 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        });
        response.end('post received')
        if(use_database){
          insertParametersIntoDB(JSON.parse(body))  ;
        } else {
          writeToFile(body);
        }
      })
    } else if(request.method == 'GET'){
      response.writeHead(200, { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
        });
        if(use_database){
          var lastentry = await getLastInsertedFromDB();
          response.end(JSON.stringify(lastentry));
        } else {
          var obj;
          fs.readFile(file, 'utf8', function (err, data) {
            if (err) throw err;
            obj = JSON.parse(data);
            response.end(JSON.stringify(obj));
          });
        }
    } else {
      console.log('WRONG REQUEST:', request.method)
    }
})

const port = 3000
const host = '127.0.0.1'
server.listen(port, host)
console.log(`Listening at http://${host}:${port}`);

function writeToFile(data){
  fs.writeFile(file, data, function (err) {
    if (err){ 
      return console.log(err);
    }
  });
}
  
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

function insertParametersIntoDB(parameters){
  MongoClient.connect(url, { useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection("gameplays").insertOne(parameters, function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
}

 function getLastInsertedFromDB(){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true}, function(err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection("gameplays");
      collection.find({}).toArray(function(err, docs) {
        if (err) throw err;
        var lastentry = docs[docs.length - 1];
        db.close();
        resolve(lastentry);
      });
    });
  })
} 




