var express = require('express');
var bodyParser = require('body-parser');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

// create express app
var app = express();
// tacks middleware onto the express app
app.use(bodyParser.json());

// POST receives information from another client over the server
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

app.listen(3000, () => {
  console.log('Started on port 3000');
});
