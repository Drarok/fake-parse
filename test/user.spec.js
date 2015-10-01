describe('User', function () {
  var User = require('../lib/user');

  describe('logIn', function () {
    afterEach(function (done) {
      User.logOut()
        .then(done, done.fail);
    });

    it('current() should start as null', function () {
      expect(User.current()).toBe(null);
    });

    it('should reject invalid details', function (done) {
      User.logIn('wrong', 'wrong')
        .then(done.fail, done);
    });

    it('should resolve with valid details', function (done) {
      User.logIn('fake-user', 'password')
        .then(done, done.fail);
    });

    it('current() should return a user only when logged in', function (done) {
      User.logIn('fake-user', 'password')
        .then(function () {
          expect(User.current()).toEqual(jasmine.any(User));
          return User.logOut();
        }).then(function () {
          expect(User.current()).toBe(null);
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
