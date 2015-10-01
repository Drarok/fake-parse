var mockData = {};

function setData(className, data) {
  mockData[className] = data;
}

function getData(className) {
  if (!mockData[className]) {
    mockData[className] = [];
  }

  return mockData[className];
}

function clearData(className) {
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
