describe('User', function () {
  var User = require('../lib/user');
  var MockData = require('../lib/mock-data');

  describe('logIn', function () {
    beforeEach(function () {
      MockData.setData('User', [
        new User({ id: 'fake-user-1', username: 'fake-user-1', password: 'password' }),
        new User({ id: 'fake-user-2', username: 'fake-user-2', password: 'password' })
      ]);
    });

    afterEach(function (done) {
      MockData.clearData();
      User.logOut()
        .then(done, done.fail);
    });

    it('current() should start as null', function () {
      expect(User.current()).toBe(null);
    });

    it('should reject invalid details', function (done) {
      User.logIn('wrong', 'wrong')
        .catch(function (err) {
          expect(err.message).toEqual('Invalid username or password');
          throw err;
        }).then(done.fail, done);
    });

    it('should resolve with valid details', function (done) {
      User.logIn('fake-user-1', 'password')
        .then(function (user) {
          expect(user).toEqual(jasmine.any(User));
          expect(user.get('username')).toEqual('fake-user-1');
        })
        .then(done, done.fail);
    });

    it('current() should return a user only when logged in', function (done) {
      User.logIn('fake-user-1', 'password')
        .then(function () {
          expect(User.current()).toEqual(jasmine.any(User));
          return User.logOut();
        }).then(function () {
          expect(User.current()).toBe(null);
        }).then(done, done.fail);
    });
  });

  describe('signUp', function () {
    it('should create a User object', function (done) {
      User.signUp('fake-user', 'password')
        .then(function (user) {
          expect(user).toEqual(jasmine.any(User));
          expect(user.getUsername()).toEqual('fake-user');
        }).then(done, done.fail);
    });

    it('should set current user', function (done) {
      User.signUp('fake-user', 'password')
        .then(function () {
          var user = User.current();
          expect(user).toEqual(jasmine.any(User));
          expect(user.getUsername()).toEqual('fake-user');
        }).then(done, done.fail);
    });
  });

  describe('accessors', function () {
    var user;

    beforeEach(function () {
      user = new User({
        email: 'fake-user@example.com',
        sessionToken: 'fake-session-token',
        username: 'fake-user'
      });
    });

    it('should return data', function () {
      expect(user.getEmail()).toEqual('fake-user@example.com');
      expect(user.getSessionToken()).toEqual('fake-session-token');
      expect(user.getUsername()).toEqual('fake-user');
    });
  });
});
