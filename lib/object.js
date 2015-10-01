var util = require('util');

var Promise = require('bluebird');

var backbone = require('./backbone');
var MockData = require('./mock-data');

var DIRECT_PROPERTIES = ['id', 'createdAt', 'updatedAt'];

function generateId() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4();
}

function FakeObject(className, attributes) {
  this.className = className;
  this.attributes = {};
  this.set(attributes || {});
  this.dirtyAttributes = {};
}

/* Static methods */

FakeObject.destroyAll = function (list, options) {
  options = backbone(options);

  var destroyPromises = list.map(function (obj) {
    return obj.destroy();
  });

  return Promise.all(destroyPromises)
    .then(options.success, options.error);
};

FakeObject.extend = function (className, protoProps, classProps) {
  function FakeObjectSubclass(attributes) {
    FakeObject.call(this, className, attributes);
  }

  util.inherits(FakeObjectSubclass, FakeObject);

  /* Static properties / methods */
  FakeObjectSubclass.className = className;

  FakeObjectSubclass.createWithoutData = function (id) {
    var instance = new FakeObjectSubclass();
    instance.id = id;
    return instance;
  };

  var k;

  if (protoProps) {
    for (k in protoProps) {
      if (!protoProps.hasOwnProperty(k)) {
        continue;
      }

      FakeObjectSubclass.prototype[k] = protoProps[k];
    }
  }

  if (classProps) {
    for (k in classProps) {
      if (!classProps.hasOwnProperty(k)) {
        continue;
      }

      FakeObjectSubclass[k] = classProps[k];
    }
  }

  return FakeObjectSubclass;
};

FakeObject.fetchAll = function (list, options) {
  options = backbone(options);

  var fetchPromises = list.map(function (obj) {
    return obj.fetch();
  });

  return Promise.all(fetchPromises)
    .then(options.success, options.error);
};

FakeObject.fetchAllIfNeeded = FakeObject.fetchAll;

FakeObject.saveAll = function (list, options) {
  options = backbone(options);

  var savePromises = list.map(function (obj) {
    return obj.save();
  });

  return Promise.all(savePromises)
    .then(options.success, options.error);
};

/* Instance methods */

FakeObject.prototype.add = function (attr, item) {
  if (this.attributes[attr] === undefined) {
    this.attributes[attr] = [];
  }

  this.attributes[attr].push(item);

  return this;
};

FakeObject.prototype.addUnique = function (attr, item) {
  if (this.attributes[attr] === undefined) {
    this.attributes[attr] = [];
  }

  if (Array.isArray(this.attributes[attr])) {
    var arr = this.attributes[attr];

    if (typeof item === 'object' && item instanceof FakeObject) {
      arr = arr.map(function (obj) {
        return obj.id;
      });

      if (arr.indexOf(item.id) === -1) {
        this.add(attr, item);
      }
    } else {
      if (arr.indexOf(item) === -1) {
        this.add(attr, item);
      }
    }
  }

  return this;
};

FakeObject.prototype.clear = function () {
  this.attributes = {};
  this.dirtyAttributes = {};
  return this;
};

FakeObject.prototype.clone = function () {
  return new this.constructor(this.attributes);
};

FakeObject.prototype.set = function (attr, value) {
  if (typeof attr === 'string') {
    this.attributes[attr] = value;
    if (this.dirtyAttributes) {
      this.dirtyAttributes[attr] = true;
    }
  } else {
    for (var k in attr) {
      if (!attr.hasOwnProperty(k)) {
        continue;
      }
      if (DIRECT_PROPERTIES.indexOf(k) === -1) {
        this.set(k, attr[k]);
      } else {
        this[k] = attr[k];
      }
    }
  }

  return this;
};

FakeObject.prototype.get = function (attr) {
  return this.attributes[attr];
};

FakeObject.prototype.destroy = function (options) {
  var _this = this;

  options = backbone(options);

  return new Promise(function (resolve, reject) {
      var data = MockData.getData(_this.constructor.name);
      MockData.setData(_this.constructor.name, data.filter(function (obj) {
        return obj.id !== _this.id;
      }));
    })
    .then(options.success, options.error);
};

FakeObject.prototype.dirty = function (attr) {
  return !!this.dirtyAttributes[attr];
};

FakeObject.prototype.dirtyKeys = function () {
  return Object.keys(this.dirtyAttributes);
};

FakeObject.prototype.equals = function (obj) {
  var _this = this;

  if (this === obj) {
    return true;
  }

  if (obj.constructor.name !== this.constructor.name) {
    return false;
  }

  if (obj.id !== this.id) {
    return false;
  }

  var keys = Object.keys(this.attributes);
  Object.keys(obj.attributes).forEach(function (key) {
    if (keys.indexOf(key) === -1) {
      keys.push(key);
    }
  });

  return keys.every(function (key) {
    var thisVal = _this.get(key);
    var thatVal = obj.get(key);

    if (thisVal instanceof FakeObject && thatVal instanceof FakeObject) {
      return thisVal.equals(thatVal);
    } else {
      return thisVal === thatVal;
    }
  });
};

FakeObject.prototype.escape = function (attr) {
  var str = this.get(attr).toString();
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

FakeObject.prototype.existed = function () {
  return false;
};

FakeObject.prototype.fetch = function (options) {
  var _this = this;

  if (!this.id) {
    return Promise.reject(new Error('Object has no id'));
  }

  options = backbone(options);

  var data = MockData.getData(this.className);

  return new Promise(function (resolve, reject) {
    var result = data.some(function (obj) {
      if (obj.id === _this.id) {
        resolve(obj);
        return true;
      }
    });

    if (!result) {
      reject(new Error('Object with id ' + _this.id + ' not found'));
    }
  }).then(options.success, options.error);
};

FakeObject.prototype.has = function (attr) {
  var val = this.attributes[attr];
  return (val !== undefined && val !== null);
};

FakeObject.prototype.increment = function (attr, amount) {
  amount = amount || 1;

  if (typeof this.attributes[attr] === undefined) {
    this.attributes[attr] = 0;
  }

  if (typeof this.attributes[attr] !== 'number') {
    throw new Error(util.format('Attribute \'%s\' is not numeric.', attr));
  }

  this.attributes[attr] += amount;

  return this;
};

FakeObject.prototype.isNew = function () {
  return this.id === undefined;
};

FakeObject.prototype.isValid = function () {
  return true;
};

FakeObject.prototype.remove = function (attr, item) {
  if (!Array.isArray(this.attributes[attr])) {
    return this;
  }

  this.attributes[attr] = this.attributes[attr].filter(function (obj) {
    if (item instanceof FakeObject) {
      return obj.id !== item.id;
    } else {
      return obj !== item;
    }
  });

  return this;
};

/**
 * This is _extremely_ flexible. From the Parse.com docs:
 *
 * object.save();
 * object.save(null, options);
 * object.save(attrs, options);
 * object.save(key, value, options);
 */
FakeObject.prototype.save = function () {
  var args = Array.prototype.slice.call(arguments);

  var options;

  if (args.length) {
    if (args.length === 1) {
      this.set(args[0]);
    } else if (args.length === 2) {
      this.set(args[0]);
      options = args[1];
    } else if (args.length === 3) {
      this.set(args[0], args[1]);
      options = args[2];
    } else {
      throw new Error('Invalid parameters');
    }
  }

  options = backbone(options);

  if (this.id === undefined) {
    this.id = generateId();
    this.createdAt = new Date();
  }

  this.updatedAt = new Date();

  var data = MockData.getData(this.className);
  if (data.indexOf(this) === -1) {
    data.push(this);
  }

  return Promise.resolve(this);
};

FakeObject.prototype.toJSON = function () {
  return this.attributes;
};

FakeObject.prototype.toPointer = function () {
  return { __type: this.className, objectId: this.id };
};

FakeObject.prototype.unset = function (attr) {
  if (this.attributes[attr] !== undefined) {
    delete this.attributes[attr];
  }

  return this;
};

/*
These are not (yet) implemented:
  * disableSingleInstance
  * enableSingleInstance
  * fromJSON
  * getACL
  * op
  * registerSubclass
  * relation
  * setACL
  * validate
*/

module.exports = FakeObject;
