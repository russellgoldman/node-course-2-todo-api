require('./config/config');

const _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');

var { ObjectID } = require('mongodb');
var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

// create an express app
var app = express();
// process.env.PORT sets a custom port for Heroku
const port = process.env.PORT || 3000;

// tack middleware onto the express app
app.use(bodyParser.json());

// Actions to perform when a POST request is sent to the server on /todos
app.post('/todos', authenticate, (req, res) => {
  // instantiating the Todo model
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id    // set _creator to the user id that created it
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
app.get('/todos', authenticate, (req, res) => {
  // Todo object model inherits Mongoose which has the connection route tacked onto it from mongoose.js
  Todo.find({
    _creator: req.user._id    // only return todos that the user (that is currently logged in) has created
  }).then((todos) => {
    res.send({todos});    // send the todos documents
  }, (err) => {
    res.status(400).send(err);
  });
});

// GET /todos/12341232 (gets any id after the /todos/)
app.get('/todos/:id', authenticate, (req, res) => {
  // key/value pair for :id
  var id = req.params.id;
  // validate id using isValid
    // 404 if invalid - send back empty body (send())
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      // todo not found
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((err) => res.status(400).send());
});

app.delete('/todos/:id', authenticate, (req, res) => {
    // get the id
  var id = req.params.id;

  // validate the id -> not valid? return 404
  if (!ObjectID.isValid(id)) {
    // 404 is not found
    return res.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
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
app.patch('/todos/:id', authenticate, (req, res) => {
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

  // Mongoose
  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  },
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

// POST /users (create user)
app.post('/users', (req, res) => {
  // THIS IS ONLY RUN IF THERE IS NO REQUEST ERROR
  // don't allow user to enter a tokens array
  var body = _.pick(req.body, ['email', 'password']);   // our body WILL display the password publically
  // converts body object to a User (email and password key/value pairs included)
  var user = new User(body);  // our User WON'T print the password (see .toJSON() in User Model)

  // saves user document to the database
  user.save().then((user) => {
    // user being called is the newly saved version
    return user.generateAuthToken();
  }).then((token) => {    // user.generateAuthToken() returns a Promise from the returned user.save() method
    // returns the modified user with the auth token
    res.header('x-auth', token).send(user);  // "x-auth" is a custom header name and we include the token as its value
  }).catch((e) => {
    // always end with a request error catch
    // error could had resulted from invalid email and/or password
    res.status(400).send(e);
  });
});

// POST /users/login {email, password}
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  // verify that a User exists with this email
  User.findByCredentials(body.email, body.password).then((user) => {
    // if user exists
    return user.generateAuthToken().then((token) => {
      // generate the token and assign it to the 'x-auth' header so we know they've been loggied in
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    // if user doesn't exist
    res.status(400).send();
  });
});

// implementing authenticate middleware
app.get('/users/me', authenticate, (req, res) => {
  // returns user object received from the req to authenticate
  res.send(req.user);   // inherits authenticate request object
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    // if successfull
    res.status(200).send();
  }, () => {
    // otherwise we have an error
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app
};
