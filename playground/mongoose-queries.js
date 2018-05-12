const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

var id = '5aea94a03b08f3983db7697111';
id = '5ae823a4b228c2926325fbbf';

// // check if value is not valid
// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid')
// }

// Todo.find({
//   _id: id   // mongoose can convert string ID's to object ID's
// }).then((todos) => {
//   console.log('Todos', todos);
// });
//
// Todo.findOne({
//   _id: id   // mongoose can convert string ID's to object ID's
// }).then((todo) => {
//   console.log('Todo', todo);
// });

// finds the document with the matching id string
// Todo.findById(id).then((todo) => {
//   if (!todo) {
//     // document doesn't exist, Object ID not in database
//     return console.log('ID not found')
//   }
//   console.log('Todo By Id', todo);
// }).catch((err) => console.log(err));   // ID value is not valid in its form (too many characters to be an Object ID)

// User.findById()
User.findById(id).then((user) => {
  if (!user) {
    return console.log('User not found')
  }
  console.log('Todo By Id', user);
}).catch((err) => console.log(err));
