// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect the MongoDB server');
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp');

  // // findOneAndCopy
  // db.collection('Todos').findOneAndUpdate({
  //   _id: new ObjectID('5ae55e4bb102cd2283befbaa'),
  // }, {
  //   $set: {
  //     // update operator
  //     completed: true
  //   }
  // }, {
  //   returnOriginal: false   // must be either true of false
  // }).then((result) => {
  //   console.log(result);
  // });

  // challenge
  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5ae43578eead197a3f1abf8b'),
  }, {
    $set: {
      // update operator
      name: 'Russell'
    },
    $inc: {
      age: 1    // increment the age key by 1
    }
  }, {
    returnOriginal: false   // must be either true of false
  }).then((result) => {
    console.log(result);
  })


  client.close();
});
