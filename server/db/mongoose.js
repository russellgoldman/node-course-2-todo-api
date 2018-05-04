var mongoose = require('mongoose');

// add the global promise key onto the mongoose object
mongoose.Promise = global.Promise;
// wire the database connection onto Mongoose
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = {
  mongoose
};
