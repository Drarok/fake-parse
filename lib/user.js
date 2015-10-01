var Promise = require('bluebird');

var backbone = require('./backbone');
var FakeObject = require('./object');

var currentUser = null;

var protoProps = {
  authenticated: function () {
    return true;
  }
};

var classProps = {
  current: function () {
    return currentUser;
  },
  logIn: function (username, password, options) {
    options = backbone(options);

    return new Promise(function (resolve, reject) {
      if (username === 'fake-user' && password === 'password') {
        currentUser = new User({
          email: 'fake-user@example.com',
          username: 'fake-user',
          sessionToken: 'fake-session-token'
        });
        currentUser.id = 'fake-user';
        resolve(currentUser);
      } else {
        reject(new Error('Invalid username or password'));
      }
    }).then(options.success, options.error);
  },
  logOut: function () {
    currentUser = null;
    return Promise.resolve();
  }
};

var User = FakeObject.extend('User', protoProps, classProps);

function getAttr(attr) {
  return function () {
    return this.get(attr);
  };
}

User.prototype.getEmail = getAttr('email');
User.prototype.getSessionToken = getAttr('sessionToken');
User.prototype.getUsername = getAttr('username');

module.exports = User;

/*
These methods aren't (yet) implemented:
  * currentAsync
  * disableUnsafeCurrentUser
  * enableRevocableSession
  * enableUnsafeCurrentUser
  * extend
  * getEmail
  * getSessionToken
  * getUsername
  * isCurrent
  * logIn
  * logIn
  * logOut
  * requestPasswordReset
  * setEmail
  * setPassword
  * setUsername
  * signUp
  * signUp
*/
