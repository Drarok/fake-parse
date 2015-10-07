var FakeUser = require('./user');
var FakeRole = function () {
  // TODO
};

function FakeACL(user) {
  this.userAccess = {};
  this.roleAccess = {};

  if (user instanceof FakeUser) {
    this.userAccess[user.id] = {
      read: true,
      write: true
    };
  }
}

FakeACL.prototype.equals = function (other) {
  return JSON.stringify(this) === JSON.stringify(other);
};

FakeACL.prototype.getPublicReadAccess = function () {
  return this.getReadAccess('public');
};

FakeACL.prototype.getPublicWriteAccess = function () {
  return this.getWriteAccess('public');
};

FakeACL.prototype.getReadAccess = function (userId) {
  var access;

  if (userId instanceof FakeUser) {
    userId = userId.id;
    access = this.userAccess;
  } else if (userId instanceof FakeRole) {
    userId = userId.id;
    access = this.roleAccess;
  } else {
    access = this.userAccess;
  }

  return access[userId] && access[userId].read;
};

FakeACL.prototype.getRoleReadAccess = function (roleId) {
  if (roleId instanceof FakeRole) {
    roleId = roleId.id;
  }

  return this.roleAccess[roleId] && this.roleAccess[roleId].read;
};

FakeACL.prototype.getRoleWriteAccess = function (roleId) {
  if (roleId instanceof FakeRole) {
    roleId = roleId.id;
  }

  return this.roleAccess[roleId] && this.roleAccess[roleId].write;
};

FakeACL.prototype.getWriteAccess = function (userId) {
  var access;

  if (userId instanceof FakeUser) {
    userId = userId.id;
    access = this.userAccess;
  } else if (userId instanceof FakeRole) {
    userId = userId.id;
    access = this.roleAccess;
  } else {
    access = this.userAccess;
  }

  return access[userId] && access[userId].write;
};

FakeACL.prototype.setPublicReadAccess = function (allowed) {
  if (!this.userAccess.public) {
    this.userAccess.public = {
      read: allowed,
      write: false
    };
  } else {
    this.userAccess.public.read = allowed;
  }

  return this;
};

FakeACL.prototype.setPublicWriteAccess = function (allowed) {
  if (!this.userAccess.public) {
    this.userAccess.public = {
      read: false,
      write: allowed
    };
  } else {
    this.userAccess.public.write = allowed;
  }

  return this;
};

FakeACL.prototype.setReadAccess = function (userId, allowed) {
  if (userId instanceof FakeUser) {
    userId = userId.id;
  }

  if (!this.userAccess[userId]) {
    this.userAccess[userId] = {
      read: allowed,
      write: false
    };
  } else {
    this.userAccess[userId].read = allowed;
  }

  return this;
};

FakeACL.prototype.setRoleReadAccess = function (roleId, allowed) {
  if (roleId instanceof FakeRole) {
    roleId = roleId.id;
  }

  if (!this.roleAccess[roleId]) {
    this.roleAccess[roleId] = {
      read: allowed,
      write: false
    };
  } else {
    this.roleAccess[roleId].read = allowed;
  }

  return this;
};

FakeACL.prototype.setRoleWriteAccess = function (roleId, allowed) {
  if (roleId instanceof FakeRole) {
    roleId = roleId.id;
  }

  if (!this.roleAccess[roleId]) {
    this.roleAccess[roleId] = {
      read: false,
      write: allowed
    };
  } else {
    this.roleAccess[roleId].write = allowed;
  }

  return this;
};

FakeACL.prototype.setWriteAccess = function (userId, allowed) {
  var access;

  if (userId instanceof FakeUser) {
    userId = userId.id;
    access = this.userAccess;
  } else if (userId instanceof FakeRole) {
    userId = userId.id;
    access = this.roleAccess;
  } else {
    access = this.userAccess;
  }

  if (!access[userId]) {
    access[userId] = {
      read: false,
      write: allowed
    };
  } else {
    access[userId].write = allowed;
  }

  return this;
};

FakeACL.prototype.toJSON = function () {
  return {
    userAccess: this.userAccess,
    roleAccess: this.roleAccess
  };
};

module.exports = FakeACL;
