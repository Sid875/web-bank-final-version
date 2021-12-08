const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://sid:admin@web322server.uvzzz.mongodb.net/WebBank?retryWrites=true&w=majority";


MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    client.close();
  });
const db = client.db("WebBank");
  
var cursor = db.collection('Client Collection').find({ chequing: 1000001});

function iterateFunc(doc) {
    console.log(JSON.stringify(doc, null, 4));
 }
 
 function errorFunc(error) {
    console.log(error);
 }
 
 cursor.forEach(iterateFunc, errorFunc);


                      
 