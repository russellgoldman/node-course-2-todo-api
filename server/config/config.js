// on Heroku, otherwise 'development' on local
var env = process.env.NODE_ENV || 'development';

// won't be able to run locally without config.json (won't be included in the GitHub repository)
if (env === 'development' || env === 'test') {
  // when requiring JSON files, JS automatically turns it into a JavaScript object
  var config = require('./config.json');
  var envConfig = config[env]   // grabs either the "test" or "development" property in config.json

  // add all keys to the process.env object for use through the entire application
  Object.keys(envConfig).forEach((key) => {
    // key is either PORT, MONGODB_URI or JWT_SECRET
    process.env[key] = envConfig[key]
  });
}
