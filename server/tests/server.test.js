const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

// .. is for going backwards relatively
var { app } = require('./../server');
var { Todo } = require('./../models/todo');

// beforeEach is included in Mocha, has the done function built-in as a parameter
// beforeEach runs before ANY requests, and terminates when done() is called

const todos = [{
  _id: new ObjectID(),    // create a valid Object ID on the fly
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo'
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    // convert all items in array into MongoDB object modals
    return Todo.insertMany(todos)      // each item in todos is an object which will be converted
  }).then(() => done());
})

// mocha
describe('POST /todos', () => {
  // you can include done() in ANY mocha function as a callback parameter
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    // supertest (test the API we built via the localhost server)
    request(app)
      .post('/todos')   // atach onto localhost://3000
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
      .send({})   // send invalid data - no text key/value pair which is REQUIRED for the Todo model
      .expect(400)   // expect a bad request, if so proceed, if everything is OK (200), throw a testing error
      .end((err, res) => {
        if (err) {
          return done(err);   // if request failed, return error message and exit
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);   // if bad data is sent, then no Todo should be made, hence lenght would be 0
          done();
        }).catch((err) => done(err));     // if query failed, return error message and exit
      })
  })
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)   // convert todo ObjectID to its' equivalent string
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
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    // /todos/123
    request(app)
      .get('/todos/123abc')   // example of a non-object id
      .expect(404)
      .end(done);
  })

});
