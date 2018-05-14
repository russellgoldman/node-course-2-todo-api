var { User } = require('./../models/user');

var authenticate = (req, res, next) => {
  // fetches the token from the post request above
  var token = req.header('x-auth');

  // find appropriate user associated with the token
  User.findByToken(token).then((user) => {
    if (!user) {  // valid JWT not in user list
      // immediately stops the function and goes to the catch() clause,
      // notice that the catch body is the same as what we're sending back here
      return Promise.reject();
      // res.status(401).send();
    }
    // setting up user and token properties for use in other routes
    req.user = user;
    req.token = token;
    // must be called in order to continue to another function that has called it (e.g. middleware usage)
    next();
  }).catch((e) => {
    // authentication failed, invalid JWT or valid JWT not in user list
    res.status(401).send();
  });
};

module.exports = {
  authenticate
};