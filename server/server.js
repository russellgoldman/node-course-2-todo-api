var express = require('express');
var bodyParser = require('body-parser');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

// create an express app
var app = express();
// tack middleware onto the express app
app.use(bodyParser.json());

// Actions to perform when a POST request is sent to the server on /todos
app.post('/todos', (req, res) => {
  // instantiating the Todo model
  var todo = new Todo({
    text: req.body.text,
    completed: req.body.completed
  });

  // saves todo to the database using Mongoose
  todo.save().then((doc) => {
    // sends the saved document back to the user if the save worked
    res.send(doc);
  }, (err) => {
    // sends the error back to the user if the save failed
    res.status(400).send(err);    // sends the status 400 (Bad Request)
  });
});

// Actions to perform when a GET request is sent to the server on /todos
app.get('/todos', (req, res) => {
  // Todo object model inherits Mongoose which has the connection route tacked onto it from mongoose.js
  Todo.find().then((todos) => {
    res.send({todos});    // send the todos documents
  }, (err) => {
    res.status(400).send(err);
  });
});

app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = {
  app
};
