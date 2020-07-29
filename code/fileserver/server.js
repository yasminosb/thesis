var http = require('http');
var fs = require('fs');
var file = 'jason.json'

var use_database = true;

const server = http.createServer(async function(request, response) {
    console.log(request.method, request.url);
    if (request.method == 'OPTIONS') {
      writeHeadersToResponse(response);
      response.end('options received')


    } else if (request.method == 'POST') {
      // get full request body
      var body = ''
      request.on('data', function(data) {
        body += data
      })
      // POST /gameplay
      if(request.url === '/gameplay'){
        request.on('end', function() {
          writeHeadersToResponse(response);
          insertJSONIntoDB("gameplays",JSON.parse(body))  ;
          response.end('post received')
        })
      }
      // POST /questionresponse
      else if(request.url === '/questionresponse'){
        request.on('end', function() {
          writeHeadersToResponse(response);
          insertJSONIntoDB("questionresponses",JSON.parse(body))  ;
          response.end('post received')
        })
      }


    } else if(request.method == 'GET'){
      // GET /lastgameplay
      if(request.url === '/lastgameplay'){
        writeHeadersToResponse(response);
        var lastentry = await getLastInsertedFromDB("gameplays");
        response.end(JSON.stringify(lastentry));
      
      // GET /Last2entryids
      } else if(request.url === '/last2gameplayids'){
        writeHeadersToResponse(response);
        var last2entryids = await getLast2EntryIdsFromDB("gameplays");
        response.end(JSON.stringify(last2entryids));
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

function insertJSONIntoDB(database, parameters){
  MongoClient.connect(url, { useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection(database).insertOne(parameters, function(err, res) {
      if (err) throw err;
      db.close();
    });
  });
}

function getLastInsertedFromDB(database){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true}, function(err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.find({}).toArray(function(err, docs) {
        if (err) throw err;
        var lastentry = docs[docs.length - 1];
        db.close();
        resolve(lastentry);
      });
    });
  })
} 

function getLast2EntryIdsFromDB(database){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true}, function(err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.find({}).toArray(function(err, docs) {
        if (err) throw err;
        var lastentry = docs[docs.length - 1];
        var secondlastentry = docs[docs.length -2];
        db.close();
        resolve({lastentry: lastentry._id, secondlastentry: secondlastentry._id});
      });
    });
  })
}





function writeHeadersToResponse(response){
  response.writeHead(200, {
    'Content-Type': 'text/html', 
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*'
  });
}




