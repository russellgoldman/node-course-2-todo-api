// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect the MongoDB server');
  }
  console.log('Connected to MongoDB server');
  const db = client.db('TodoApp');

  // // deleteMany (removes many)
  // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
  //   console.log(result);
  // });

  // // deleteOne (removes one)
  // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {
  //   console.log(result);
  // });

  // // findOneAndDelete (returns and removes one)
  // db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
  //   console.log(result);
  // });

  // challenge
  db.collection('Users').deleteMany({name: 'Russell'});
  db.collection('Users').findOneAndDelete(
    {_id: new ObjectID('5ae7d858c712218f5eab381d')}
  ).then((results) => {
    console.log(JSON.stringify(results, undefined, 2));
  });

  client.close();
});
