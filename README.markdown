# Fake Parse [![Build Status](https://travis-ci.org/Drarok/fake-parse.svg?branch=develop)](https://travis-ci.org/Drarok/fake-parse)

Simple fake implementations of the Parse.com JavaScript API.

## Usage

This is designed to be used with the excellent [Karma test runner][karma].

It allows you to easily setup fake data on a model-by-model basis.

The following is a contrived example using [Jasmine][jasmine]:

```js
/* controllers/home.js */
angular.module('yourApp', [])
  .controller('HomeController', function () {
    var _this = this;

    this.usernames = [];

    this.loadUsernames = function () {
      return new Parse.Query('User')
        .find()
        .then(function (users) {
          _this.usernames = users.map(function (user) {
            return user.getUsername();
          });
          return _this.usernames;
        });
    };
  });

/* test/controllers/home.spec.js */
describe('HomeController', function () {
  var controller;

  beforeEach(inject(function ($controller) {
    controller = $controller('HomeController');
  }));

  it('should get usernames', function (done) {
    Parse.MockData.setData('User', [
      new Parse.User({
        id: 'fake-1',
        username: 'fake-user-1',
        email: 'fake-user-1@example.com'
      }),
      new Parse.User({
        id: 'fake-2',
        username: 'fake-user-2',
        email: 'fake-user-2@example.com'
      })
    ]);

    controller.loadUsers()
      .then(function (usernames) {
        expect(controller.usernames).toEqual(['fake-user-1', 'fake-user-2']);
      }).then(done, done.fail);
  });
});
```

[jasmine]: http://jasmine.github.io
[karma]: http://karma-runner.github.io/0.13/index.html
