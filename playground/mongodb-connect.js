// need mongo client to connect to the mongo server
const MongoClient = require('mongodb').MongoClient;

// ObjectID lets us make unique ObjectID's on the fly
// const { MongoClient, ObjectID } = require('mongodb');
// // generates a brand new ObjectID
// var obj = new ObjectID();
// console.log(obj);

const localServerUrl = 'mongodb://localhost:27017/';
const dbName = 'TodoApp';    // represents database

// connecting to the server
MongoClient.connect(`${localServerUrl}${dbName}`, (err, client) =>  {
  // callback function is executed after the connection is attempted
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');
  // extract database reference from the Client
  const db = client.db(dbName);

  // // inserts a new document into your collection
  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed: false
  // }, (err, result) => {
  //   // err is called if something went wrong, result if everything is good
  //   if (err) {    // if err is defined, an error exists
  //     return console.log('Unable to insert todo', err)
  //   }
  //   // result.ops contains all documents that were inserted
  //   console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
  // });

  // insert new document into Users (name, age, location)
  db.collection('Users').insertOne({
    name: 'Russell',
    age: 19,
    location: 'Toronto'
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert user', err);
    }
    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  // closes connection with MongoDB server via the client
  client.close();
});
