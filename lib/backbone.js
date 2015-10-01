module.exports = function backbone (options) {
  options = options || {};

  var noop = function (result) {
    if (result instanceof Error) {
      throw result;
    } else {
      return result;
    }
  };

  return {
    success: options.success || noop,
    error: options.error || noop
  };
};
