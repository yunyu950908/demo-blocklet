const HTTPBaseError = require('./http-base-error');

const ERROR_CODE = 40000;

class HTTPBadRequestError extends HTTPBaseError {
  constructor(errMsg) {
    super(400, ERROR_CODE, errMsg);
  }
}

module.exports = HTTPBadRequestError;
