var express = require('express');
var bodyParser = require('body-parser');

var { ObjectID } = require('mongodb');
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

// GET /todos/12341232
app.get('/todos/:id', (req, res) => {
  // key/value pair for :id
  var id = req.params.id;
  // validate id using isValid
    // 404 if invalid - send back empty body (send())
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  // findById
  Todo.findById(id).then((todo) => {
    if (!todo) {
      // todo not found
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((err) => res.status(400).send());
    // success
      // if todo - send it back
      // if no todo - send back 404 with empty body
    // error
      // 400 - send empty body back

})

app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = {
  app
};
