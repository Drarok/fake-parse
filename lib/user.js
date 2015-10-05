var Promise = require('bluebird');

var backbone = require('./backbone');
var FakeObject = require('./object');
var FakeQuery = require('./query');

var protoProps = {
  authenticated: function () {
    return true;
  }
};

/* globals window: false */
var storage;
if (typeof window === 'undefined') {
  storage = (function () {
    var data = {};

    return {
      setItem: function (key, value) {
        data[key] = value;
      },
      getItem: function (key) {
        return data[key];
      },
      removeItem: function (key) {
        data[key] = undefined;
      }
    };
  }());
} else {
  storage = window.localStorage;
}

var classProps = {
  current: function () {
    try {
      var data = storage.getItem('Parse.User.current');
      if (!data) {
        return null;
      }
      return new User(JSON.parse(data));
    } catch (e) {
      return null;
    }
  },
  logIn: function (username, password, options) {
    options = backbone(options);

    return new FakeQuery('User')
      .find()
      .then(function (users) {
        var user;
        users.some(function (u) {
          if (u.get('username') === username && u.get('password') === password) {
            u.set('sessionToken', 'fake-session-token');
            user = u;
            return true;
          }
        });

        if (!user) {
          throw new Error('Invalid username or password');
        }

        storage.setItem('Parse.User.current', JSON.stringify(user.attributes));

        return user;
      }).then(options.success, options.error);
  },
  logOut: function () {
    storage.removeItem('Parse.User.current');
    return Promise.resolve();
  },
  signUp: function (username, password, attrs, options) {
    options = backbone(options);

    return new Promise(function (resolve, reject) {
      attrs = attrs || {};
      attrs.username = username;
      attrs.password = password;

      var user = new User(attrs);
      user.save();
      storage.setItem('Parse.User.current', JSON.stringify(user.attributes));
      resolve(user);
    }).then(options.success, options.error);
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
  * isCurrent
  * requestPasswordReset
  * setEmail
  * setPassword
  * setUsername
  * signUp
  * signUp
*/
