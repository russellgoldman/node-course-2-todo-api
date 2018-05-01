const expect = require('expect');
const request = require('supertest');

// .. is for going backwards relatively
var { app } = require('./../server');
var { Todo } = require('./../models/todo');

// beforeEach is included in Mocha, has the done function built-in as a parameter
// beforeEach runs before ANY requests, and terminates when done() is called
beforeEach((done) => {
  Todo.remove({}).then(() => done());    // wipes all Todos
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
        Todo.find().then((todos) => {     // todo documents included as a callback parameter
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
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
          expect(todos.length).toBe(0);   // if bad data is sent, then no Todo should be made, hence lenght would be 0
          done();
        }).catch((err) => done(err));     // if query failed, return error message and exit
      })
  })
});
