var http = require('http');
// var fs = require('fs');
// var file = 'jason.json'

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


    switch (url[0]) {
      // GET /lastgameplay/USERID
      case "lastgameplay":
        writeHeadersToResponse(response);
        var USERID = url[1];
        var lastentry = await getLastEntryFromDB("gameplays", { USERID: USERID });
        response.end(JSON.stringify(lastentry));
        break;

      // GET /last2gameplayids/USERID
      case "last2gameplayids":
        writeHeadersToResponse(response);
        var USERID = url[1];
        var last2entryids = await getLast2EntryIdsFromDB("gameplays", { USERID: USERID });
        response.end(JSON.stringify(last2entryids));
        break;

      // GET /hasplayed2games/USERID
      case "hasplayed2games":
        writeHeadersToResponse(response);
        var USERID = url[1];
        var result = await userHasPlayed2Games(USERID)
        response.end(result.toString());
        break;

      // GET /last2gameplays/USERID
      case "last2gameplays":
        writeHeadersToResponse(response);
        var USERID = url[1];
        var last2entryids = await getLast2EntriesFromDB("gameplays", { USERID: USERID });
        response.end(JSON.stringify(last2entryids));
        break;

      // GET /gameplay/GAMEID
      case "gameplay":
        writeHeadersToResponse(response);
        var GAMEID = url[1];
        var gameplay = await getEntryFromDB("gameplays", GAMEID);
        response.end(JSON.stringify(gameplay));
        break;
      // GET /dashboardinfo
      case "dashboardinfo":
        writeHeadersToResponse(response);
        var gameplays = await getDashboardInfo()
        response.end(JSON.stringify(gameplays)); 
        break;
      // GET /numberofgameplays
      case "numberofgameplays":
        writeHeadersToResponse(response);
        var number = await getNumberOfEntriesFromDB("gameplays")
        response.end(JSON.stringify(number)); 
        break;
      default:
        console.log("WRONG GET REQUEST")
    }


  } else {
    console.log('WRONG REQUEST:', request.method)
  }
})

function verify_get(get_url){
  if (url.length < 2 || url[1] === '') {
    console.log("USERID UNDEFINED: format should be GET /<request>/USERID")
  }
}

const port = 3001
const host = '127.0.0.1'
server.listen(port, host)
console.log(`Listening at http://${host}:${port}`);

// function writeToFile(data) {
//   fs.writeFile(file, data, function (err) {
//     if (err) {
//       return console.log(err);
//     }
//   });
// }

//var MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');
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

function getLastEntryFromDB(database, requirement) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.find(requirement).toArray(function (err, docs) {
        if (err) throw err;
        var lastentry = docs[docs.length - 1];
        db.close();
        resolve(lastentry);
      });
    });
  })
}

function getLast2EntryIdsFromDB(database, requirement) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.find(requirement).toArray(function (err, docs) {
        if (err) throw err;
        var lastentry = docs[docs.length - 1];
        var secondlastentry = docs[docs.length - 2];
        db.close();
        resolve({ lastentry: lastentry._id, secondlastentry: secondlastentry._id });
      });
    });
  })
}

function getLast2EntriesFromDB(database, requirement){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.find(requirement).toArray(function (err, docs) {
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
  return has2EntriesInDB("gameplays", { USERID: USERID });
}

function has2EntriesInDB(database, requirement){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.find(requirement).toArray(function (err, docs) {
        if (err) throw err;
        db.close();
        resolve(docs.length >= 2);
      });
    });
  })
}

function getEntryFromDB(database, id){
  console.log("getEntryFromDB", database, id)
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.findOne({_id: ObjectID(id) }, function(err, docs) {
        if (err) throw err;
        db.close();
        resolve(docs);
      });
    });
  })
}

function getDashboardInfo(){
  return getAllEntriesFromDB("gameplays", 
    {
      _id: 1, 
      actualDistance: 1, 
      gameOverScreen: 1, 
      dateTime: 1,
      invertedGameOver: 1
    }
  );
}

function getAllEntriesFromDB(database, projection){
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      var query = get_required_fields_from_projection(projection);
      collection.find(query,{fields: projection}).sort({_id: -1}).toArray(function(err, docs) {
        if (err) throw err;
        db.close();
        resolve(docs);
      });
    });
  })
}

function getNumberOfEntriesFromDB(database){
  console.log("getNumberOfEntriesFromDB", database)
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      var dbo = db.db("mydb");
      var collection = dbo.collection(database);
      collection.find({}).count(function(err, result) {
        if (err) throw err;
        db.close();
        resolve(result);
      });
    });
  })
}

function get_required_fields_from_projection(projection){
  var required_fields = Object.keys(projection);
  var query = {}
  for(field of required_fields){
    query[field] = {$exists: 1};
  }
  return query
}

function writeHeadersToResponse(response) {
  response.writeHead(200, {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
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


