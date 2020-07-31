var http = require('http');
var fs = require('fs');
var file = 'jason.json'

var use_database = true;

const server = http.createServer(async function (request, response) {
  console.log(request.method, request.url)
  var url = parseUrl(request.url);

  if (request.method == 'OPTIONS') {
    writeHeadersToResponse(response);
    response.end('options received')


  } else if (request.method == 'POST') {
    // get full request body
    var body = ''
    request.on('data', function (data) {
      body += data
    })

    if (url.length < 2 || url[1] === '') {
      console.log("USERID UNDEFINED: format should be POST /<request>/USERID")
    }
    var USERID = url[1];

    switch (url[0]) {
      // POST /gameplay/USERID
      case "gameplay":
        request.on('end', function () {
          writeHeadersToResponse(response);
          var json = parseJSON_addUSERID(body, USERID);
          insertJSONIntoDB("gameplays", json);
          response.end('post received')
        })

        break;
      // POST /questionresponse/USERID
      case "questionresponse":
        request.on('end', function () {
          writeHeadersToResponse(response);
          var json = parseJSON_addUSERID(body, USERID);
          insertJSONIntoDB("questionresponses", json);
          response.end('post received')
        })

        break;
      default:
        console.log("WRONG POST REQUEST")
    }
  } else if (request.method == 'GET') {

    if (url.length < 2 || url[1] === '') {
      console.log("USERID UNDEFINED: format should be GET /<request>/USERID")
    }
    var USERID = url[1];

    switch (url[0]) {
      // GET /lastgameplay/USERID
      case "lastgameplay":
        writeHeadersToResponse(response);
        var lastentry = await getLastEntryFromDB("gameplays", USERID);
        response.end(JSON.stringify(lastentry));
        break;

      // GET /last2gameplayids/USERID
      case "last2gameplayids":
        writeHeadersToResponse(response);
        var last2entryids = await getLast2EntryIdsFromDB("gameplays", USERID);
        response.end(JSON.stringify(last2entryids));
        break;

      // GET /hasplayed2games/USERID
      case "hasplayed2games":
        writeHeadersToResponse(response);
        var result = await userHasPlayed2Games(USERID)
        response.end(result.toString());
        break;

      // GET /last2gameplays/USERID
      case "last2gameplays":
        writeHeadersToResponse(response);
        var last2entryids = await getLast2EntriesFromDB("gameplays", USERID);
        response.end(JSON.stringify(last2entryids));
        break;
      default:
        console.log("WRONG GET REQUEST")
    }


  } else {
    console.log('WRONG REQUEST:', request.method)
  }
})

const port = 3000
const host = '127.0.0.1'
server.listen(port, host)
console.log(`Listening at http://${host}:${port}`);

function writeToFile(data) {
  fs.writeFile(file, data, function (err) {
    if (err) {
      return console.log(err);
    }
  });
}

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

function insertJSONIntoDB(database, parameters) {
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    dbo.collection(database).insertOne(parameters, function (err, res) {
      if (err) throw err;
      db.close();
    });
  });
}

function getLastEntryFromDB(database, USERID) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.find({ USERID: USERID }).toArray(function (err, docs) {
        if (err) throw err;
        var lastentry = docs[docs.length - 1];
        db.close();
        resolve(lastentry);
      });
    });
  })
}

function getLast2EntryIdsFromDB(database, USERID) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.find({ USERID: USERID }).toArray(function (err, docs) {
        if (err) throw err;
        var lastentry = docs[docs.length - 1];
        var secondlastentry = docs[docs.length - 2];
        db.close();
        resolve({ lastentry: lastentry._id, secondlastentry: secondlastentry._id });
      });
    });
  })
}

function getLast2EntriesFromDB(database, USERID){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.find({ USERID: USERID }).toArray(function (err, docs) {
        if (err) throw err;
        var lastentry = docs[docs.length - 1];
        var secondlastentry = docs[docs.length - 2];
        db.close();
        resolve({ lastentry: lastentry, secondlastentry: secondlastentry});
      });
    });
  })
}

function userHasPlayed2Games(USERID){
  return has2EntriesInDB("gameplays", USERID);
}

function has2EntriesInDB(database, USERID){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.find({ USERID: USERID }).toArray(function (err, docs) {
        if (err) throw err;
        db.close();
        resolve(docs.length >= 2);
      });
    });
  })
}





function writeHeadersToResponse(response) {
  response.writeHead(200, {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*'
  });
}

function parseUrl(url) {
  var split = url.split("/");
  split.shift();
  return split;
}

function parseJSON_addUSERID(json_string, USERID) {
  var json = JSON.parse(json_string);
  json["USERID"] = USERID;
  return json;
}


