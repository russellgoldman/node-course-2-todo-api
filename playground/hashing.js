// import hashing function (SHA256)
const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id: 10
};

// returns a HS256 hash with a 'salt' of "123abc"
var token = jwt.sign(data, '123abc');
console.log(token);

// must pass in the EXACT same 'salt'
var decoded = jwt.verify(token, '123abc');
// returns the decoded data
console.log('decoded', decoded);

// var message = 'I am user number 3';
// // SHA256(foo) returns an object
// var hash = SHA256(message).toString();
//
// /*
// SHA256 is a one-way hashing algorithm. It allows for some form of unique data
// to always be represented by the same hash number. The unique hash number CANNOT
// be returned to the original data.
// */
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);
//
// var data = {
//   id: 4
// };
// var token = {
//   data,    // reference to above data
//   // 'somesecret' is an example of a 'salt', which is used to provide a truly UNIQUE hash
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }
//
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
// if (resultHash === token.hash) {
//   // data was not manipulated (because of our salt)
//   console.log('Data was not changed');
// } else {
//   console.log('Data was changed. Do not trust!');
// }
