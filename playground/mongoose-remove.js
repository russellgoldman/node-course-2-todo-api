const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//   console.log(result);
// });

Todo.findOneAndRemove({_id: '5af60e69f2460934f14fdc2a'}).then((todo) => {

});

Todo.findByIdAndRemove('5af60e69f2460934f14fdc2a').then((todo) => {
  console.log(todo);
});
