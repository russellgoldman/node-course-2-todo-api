var mongoose = require('mongoose');

// add the global promise key onto the mongoose object
mongoose.Promise = global.Promise;
// wire the database connection onto Mongoose (online Mongo database)
mongoose.connect(process.env.MONGODB_URI);

module.exports = {
  mongoose
};
