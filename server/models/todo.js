var mongoose = require('mongoose');

// creates a new Mongoose model object
var Todo = mongoose.model('Todos', {
  text: {
    type: String,   // text is a String
    required: true,
    minlength: 1,   // minlength of String must be greater than one character
    trim: true      // removes any leading and trailing spaces
  },
  completed: {
    type: Boolean,  // completed is true/false
    default: false  // default value
  },
  completedAt: {
    type: Number,   // timestamp
    default: null
  }
});

module.exports = {
  Todo
};
