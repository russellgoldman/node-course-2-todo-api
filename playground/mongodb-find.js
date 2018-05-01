// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect the MongoDB server');
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp');

  // // converts the cursor of all documents to an array
  // db.collection('Todos').find({
  //   // query
  //   _id: new ObjectID('5ae4343dbabe0c7a3343f8e7')   // must convert string ID to ObjectID
  //   // completed: false    // only include documents with a specific key/value pair
  // }).toArray().then((docs) => {
  //   console.log('Todos');
  //   console.log(JSON.stringify(docs, undefined, 2));
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // });

  // // converts the cursor of all documents to the number of documents
  // db.collection('Todos').find().count().then((count) => {
  //   console.log('Todos');
  //   console.log(`Todos count: ${count}`);
  // }, (err) => {
  //   console.log('Unable to fetch todos', err);
  // });

  db.collection('Users').find({ name: 'Russell' }).toArray().then((docs) => {
    console.log(JSON.stringify(docs, undefined, 2));
  });

  client.close();
});
