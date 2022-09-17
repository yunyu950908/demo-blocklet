const HTTPBaseError = require('./http-base-error');

const ERROR_CODE = 40400;

class HTTPNotFoundError extends HTTPBaseError {
  constructor(errMsg) {
    super(404, ERROR_CODE, errMsg);
  }
}

module.exports = HTTPNotFoundError;
