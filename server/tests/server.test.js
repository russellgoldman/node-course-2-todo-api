const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

// .. is for going backwards relatively
const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user')
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

// beforeEach is included in Mocha, has the done function built-in as a parameter
// beforeEach runs before ANY requests, and terminates when done() is called

beforeEach(populateUsers);
// ALLOWS FOR DELETE TEST TO WORK
beforeEach(populateTodos);

// mocha
describe('POST /todos', () => {
  // you can include done() in ANY mocha function as a callback parameter
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    // supertest (test the API we built via the localhost server)
    request(app)
      .post('/todos')   // atach onto localhost://3000
      .set('x-auth', users[0].tokens[0].token)
      .send({
        text: text      // including the above text variable as a key/value pair
      })
      .expect(200)      // status must be 200 (OK)
      .expect((res) => {
        expect(res.body.text).toBe(text);    // response text must be the same as the text sent
      })
      .end((err, res) => {
        if (err) {
          return done(err);      // if there is an error with the request, return the error and end
        }
        // query the MongoDB database and confirm the Todo was saved
        Todo.find({text}).then((todos) => {     // todo documents included as a callback parameter
          expect(todos.length).toBe(1);   // we are deleting all existing Todo's before adding so the length should be 1
          expect(todos[0].text).toBe(text); // Todo value should be same as one sent via POST
          done();   // exit asynchronously
        }).catch((err) => done(err));    // if there is an error querying the database, return the error and end
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})   // send invalid data - no text key/value pair which is REQUIRED for the Todo model
      .expect(400)   // expect a bad request, if so proceed, if everything is OK (200), throw a testing error
      .end((err, res) => {
        if (err) {
          return done(err);   // if request failed, return error message and exit
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);   // if bad data is sent, then no Todo should be made, hence length would be 0
          done();
        }).catch((err) => done(err));     // if query failed, return error message and exit
      })
  })
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)   // convert todo ObjectID to its' equivalent string
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    // make sure you get a 404 back
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    // /todos/123
    request(app)
      .get('/todos/123abc')   // example of a non-object id
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not return todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)   // convert todo ObjectID to its' equivalent string
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)  // todo2 can only be accessed by user2
      .expect(200)
      .expect((res) => {
        // res.body.todo._id returns the hexIdString
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        // this function block runs regardless of an error being present
        if (err) {
          // if error, request failed (res is null), return error message and exit
          return done(err);
        }
        // query database using findById, if null everything is good
        Todo.findById(hexId).then((todo) => {
          // todo should be removed if everything worked fine
          expect(todo).toBeFalsy();
          done();
        }).catch((err) => done(err));   // if query failed
      });
  });

  it('should not remove todo created by other user', (done) => {
    var hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)  // todo2 can only be accessed by user2
      .expect(404)
      .end((err, res) => {
        // this function block runs regardless of an error being present
        if (err) {
          // if error, request failed (res is null), return error message and exit
          return done(err);
        }
        Todo.findById(hexId).then((todo) => {
          // todo still exist if everything worked fine
          expect(todo).toBeTruthy();
          done();
        }).catch((err) => done(err));   // if query failed
      });
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)   // should return 404 if not found
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
     var hexId = '123abc';

     request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', (done) => {
  it('should update the todo', (done) => {
    // grab id of first item
    var hexId = todos[0]._id.toHexString();
    var text = 'This should be the new text';
    // update text, set completed true
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        // update the model
        completed: true,
        text    // ES6 key/value syntax (key and value are "text": text)
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);    // text assertion
        expect(res.body.todo.completed).toBe(true);   // completed assertion
        // completedAt assertion (automatically gets changed when completed is true)
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
  });

  it('should not update the todo created by other user', (done) => {
    // grab id of first item
    var hexId = todos[0]._id.toHexString();
    var text = 'This should be the new text';
    // update text, set completed true
    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        // update the model
        completed: true,
        text    // ES6 key/value syntax (key and value are "text": text)
      })
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var hexId = todos[1]._id.toHexString();
    var text = 'This should be the new text!!';

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        // update the model
        completed: false,
        text    // ES6 key/value syntax (key and value are "text": text)
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);    // text assertion
        expect(res.body.todo.completed).toBe(false);   // completed assertion
        // completedAt assertion (set to null when completed is false)
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
  });
});

/*
The GET /users/me request handles authentication. We just need to test if
the signs of authentication are present, and if not then the test failed.

Since the GET /users/me request sends back the collected user ONLY if everything
goes well within 'authenticate', then we can check to see if we receive the original
user with SAME properties as the o

*/
describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')   // just because we get the request back doesn't mean it worked
      // set header so authenticate can check if token (that represents the User instance) is in db
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)  // request should good, token must had been found in authenticate
      .expect((res) => {    // confirm the data received is the same of that sent
        // expect id's are the same (RES automatically converts id to hexString, need to match it)
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);   // if everything worked, then user is authenticated
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      // we didn't include a token so the request automatically fails
      .expect(401)    // 401 signifies "Unauthorized"
      .expect((res) => {
        // authentication should fail, thus no user is sent back in GET /users/me
        expect(res.body).toEqual({})
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    // assumes there is a unique and valid email and password
    var email = 'email@example.com';
    var password = '123mnb!';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        /* Since we have toJSON() in place as an instance method, everytime a user is returned
           by a request, only the _id and email properties are available for access. Thus the
           hashed password is ALWAYS hidden, except from the MongoDB database itself (which
           can only be viewed by a system administrator anyways).
        */
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();   // valid instance of User model must contain _id
        expect(res.body.email).toBe(email); // valid instance of User model must contain email
      })
      .end((err) => {
        if (err) {
          // if error, exit with error
          return done(err);
        }

        // otherwise query the database to determine more hidden properties not available to standard Users
        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy;  // the user must exist
          // hashed password should NOT be the same as our original plain text password (otherwise our password wasn't hashed)
          expect(user.password).not.toBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123'
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,     // email already in use by other User
        password: 'password123!'   // valid password
      })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        /*
          We are trying to test to see if the 'x-auth' header is set to the found
          user. Since there is a predefined object in tokens at index 0 from seed.js,
          the 'x-auth' header token should be at index 1. As such, we must expect
          that user.tokens[1] has { 'access': 'auth', 'token': user.tokens[1].token }.
        */
        User.findById(users[1]._id).then((user) => {
          // confirm auth token is correct

          // tokens object (user.tokens[0]) has AT LEAST these properties
          expect(user.tokens[1]).toHaveProperty('access', 'auth');
          expect(user.tokens[1]).toHaveProperty('token', user.tokens[1].token);
          // if all goes well...
          done();
        }).catch((e) => done(e));   // otherwise return the error
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'   // should be an invalid password
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          // confirm auth token is correct
          /*
            If the tokens array is 1, the user is not logged in with 'x-auth'.
            This is a byproduct of presetting the second User instance to have
            an x-auth token, so we must disregard it in testing and start at 1.
          */
          expect(user.tokens.length).toBe(1);
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));   // otherwise return the error
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)  // simulate an authorized session with a valid User token
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          // tokens array should be empty, thus the length would be 0
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
