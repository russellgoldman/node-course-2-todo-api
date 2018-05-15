const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  // creates a valid authentication token using JWT and concatenate to the empty tokens array
  user.tokens = user.tokens.concat([{access, token}]);
  // saves the updated user instance to the database as a document
  return user.save().then(() => {
    // if we are returning an item from the function, we need to return from both the anonymous function
    // AND the outer function
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;

  // we MUST return the user.update() as it returns a Promise
  return user.update({
    $pull: {
      // remove ALL CONTENTS of the tokens array IFF the token paramater matches the token in the array
      tokens: { token }   // using ES6 Shorthand Property (token: token)
    }
  });
};

// model method
UserSchema.statics.findByToken = function (token) {
  // model methods have their this set to the Model
  var User = this;
  var decoded;

  try {
    // will throw an error if token + secret is invalid in JWT
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {   // if there was an error from the jwt.verify() method
    // we need to return a Promise because .then() requires it and User.findOne() also throws one (keep consistency)
    return Promise.reject();    // foo in reject(foo) is the error callback parameter when catch((error) => {}) is called
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
  }
  // if no error, lets find the User that matches the decoded id
  return User.findOne({   // if found, user is automatically returned from findOne()
    // decoded can be a valid JWT (created using JWT) but just not in the User list (gives us null for user, i.e. !user)
    _id: decoded._id,
    'tokens.token': token,   // query nested keys
    'tokens.access': 'auth'  // must have the 'auth' tag
  });
};

// model method
UserSchema.statics.findByCredentials = function (email, password) {
  // the password parameter is plain text

  // make User the this operator in the function
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      // reject the Promise, will invoke catch call where the method findByCredentials was called
      return Promise.reject();
    }

    // bcrypt doesn't support Promises, only callbacks, so let us return a new Promise with bcrypt in it
    return new Promise((resolve, reject) => {
      // password is plain text, user.password is the hashed password from the database
      bcrypt.compare(password, user.password, (err, res) => {
        // if result is true, resolve is called, otherwise reject
        res ? resolve(user) : reject();
      });
    });
  })
};


// (Mongoose Middleware used below)
/*
If the instance of the User model tries to save itself to the database
and has a password that has been modified, then either of the following
are possible causes:

  1. Password modified from NULL to plain text when document initially
     created
  2. Password modified from existing hash to plain text

Since both operations modify the password property to be plain text,
we must HASH the plain text password to keep the database secure.
*/
UserSchema.pre('save', function (next) {
  // remember that functions have access to the this operator (hence what called the function)
  var user = this;    // called by the user instance

  // determines if any Mongoose model instance properties have been modified (returns true/false)
  if (user.isModified('password')) {    // if new password AND user, or modified password of existing user
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        // overwrite user.password (plain text) to be the hash (secure password)
        user.password = hash;
        next();   // complete middleware and save the document
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('Users', UserSchema);

module.exports = {
  User
};
