var mongoose = require('mongoose');

// add the global promise key onto the mongoose object
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {
  mongoose
};
