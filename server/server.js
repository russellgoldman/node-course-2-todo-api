const _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');

var { ObjectID } = require('mongodb');
var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

// create an express app
var app = express();
// process.env.PORT sets a custom port for Heroku
const port = process.env.PORT || 3000;

// tack middleware onto the express app
app.use(bodyParser.json());

// Actions to perform when a POST request is sent to the server on /todos
app.post('/todos', (req, res) => {
  // instantiating the Todo model
  var todo = new Todo({
    text: req.body.text,
    completed: req.body.completed
  });

  // saves todo model to the database using Mongoose
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

// GET /todos/12341232 (gets any id after the /todos/)
app.get('/todos/:id', (req, res) => {
  // key/value pair for :id
  var id = req.params.id;
  // validate id using isValid
    // 404 if invalid - send back empty body (send())
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      // todo not found
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((err) => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
    // get the id
  var id = req.params.id;

  // validate the id -> not valid? return 404
  if (!ObjectID.isValid(id)) {
    // 404 is not found
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      // todo doesn't exist, id is valid but can't be found (404 is not found)
      return res.status(404).send();
    }
    // no need to include status(200) as 200 is the default (OK)
    res.send({todo});
  }).catch((e) => {
    // 400 is bad request
    res.status(400).send();
  });
});

// allows us to update todo items
app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  // lodash takes an object and picks out the keys that you want to update
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  // use lodash to check if body.completed is a boolean AND body.completed is true
  if (_.isBoolean(body.completed) && body.completed) {
    // returns a JavaScript timestamp (number of milliseconds since Jan. 1st 1970 (A.K.A. UNIX Epoch))
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id,
    {
      $set: body  // MongoDB property
    }, {
      // without new: true, the method returns the unaltered object model
      new: true   // Mongoose property (changes default return to new object model)
    }
  ).then((todo) => {
    // if todo doesn't exist (null)
    if (!todo) {
      return res.status(404).send();
    }
    // otherwise todo is defined and we send it back
    res.send({todo});
  }).catch((e) => {
    // request failed
    res.status(400).send();
  })
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app
};
