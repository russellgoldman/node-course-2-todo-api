const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// we use mongoose.Schema when we want to add methods (whereas in mongoose.model we cannot add methods)
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,      // removes any leading and trailing spaces
    unique: true,    // can't have two or more documents with the same email
    validate: {      // npm validator
      // takes passed in value and runs isEmail(value) - value is the "email" instance of the 'Users' model
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// instance method to determine what data is sent back to the user when a Model is converted into a JSON object
UserSchema.methods.toJSON = function () {
  var user = this;  // instance methods have their 'this' set to the instance of the model
  // takes Mongoose variable and converts into object that contains only key/value pairs that exist in the Model
  var userObject = user.toObject();

  // omit password and tokens are they are private and contain sensitive data
  return _.pick(userObject, ['_id', 'email']);
}

// instance method
UserSchema.methods.generateAuthToken = function () {
  // we need a this keyword to store the individual document (we cannot do this in arrow functions)
  var user = this;    // user is the instance
  var access = 'auth';    // sets the access type - we're using authentication
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  // creates a valid authentication token using JWT and saves it to the tokens array
  user.tokens = user.tokens.concat([{access, token}]);
  // saves the updated user instance to the database as a document
  return user.save().then(() => {
    // if we are returning an item from the function, we need to return from both the anonymous function
    // AND the outer function
    return token;
  });
};

// model method
UserSchema.statics.findByToken = function (token) {
  // model methods have their this set to the Model
  var User = this;
  var decoded;

  try {
    // will throw an error if token + secret is invalid in JWT
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {   // if there was an error from the jwt.verify() method
    // we need to return a Promise because .then() requires it and User.findOne() also throws one (keep consistency)
    return Promise.reject();    // foo in reject(foo) is the error callback parameter when catch((error) => {}) is called
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
  }
  // if no error, lets find the User that matches the decoded id
  return User.findOne({
    // decoded can be a valid JWT (created using JWT) but just not in the User list (gives us null for user, i.e. !user)
    _id: decoded._id,
    'tokens.token': token,   // query nested keys
    'tokens.access': 'auth'  // must have the 'auth' tag
  });
}

var User = mongoose.model('Users', UserSchema);

module.exports = {
  User
};
