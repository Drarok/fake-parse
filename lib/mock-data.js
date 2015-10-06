var mockData = {};

function resolveClass(objectClass) {
  if (objectClass && objectClass.className) {
    objectClass = objectClass.className;
  }

  return objectClass;
}

function setData(objectClass, data) {
  var className = resolveClass(objectClass);
  mockData[className] = data;
}

function getData(objectClass) {
  var className = resolveClass(objectClass);

  if (!mockData[className]) {
    mockData[className] = [];
  }

  return mockData[className];
}

function clearData(objectClass) {
  var className = resolveClass(objectClass);

  if (className) {
    setData(className, null);
  } else {
    mockData = {};
  }
}

module.exports = {
  setData: setData,
  getData: getData,
  clearData: clearData
};
