const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'andrew@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    // we decided to store the JWT_SECRET (salt) in config.json and host it on process.env
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'jen@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];

const todos = [{
  _id: new ObjectID(),    // create a valid Object ID on the fly
  text: 'First test todo',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    // convert all items in array into Mongo object models AND saves them in our DB (new Todo + save())
    return Todo.insertMany(todos)      // each item in todos is an object which will be converted
  }).then(() => done());
};

// insertMany does not work with middleware, we must use individual instances instead
const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();    // insert into test db
    var userTwo = new User(users[1]).save();    // insert into test db

    // waits for ALL Promises to resolve (userOne AND userTwo)
    return Promise.all([userOne, userTwo]);   // Promise.all returns ONE final Promise
    // then callback handles the final Promise (Promise.all)
  }).then(() => done());     // done tells that we are DONE with a SUPERTEST operation
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
};
