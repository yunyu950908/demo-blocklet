class HTTPBaseError extends Error {
  constructor(httpStatusCode = 200, errCode = 20000, errMsg = '') {
    super(`HTTP ERROR: ${errMsg}`);
    this.httpStatusCode = httpStatusCode;
    this.errCode = errCode;
  }
}

module.exports = HTTPBaseError;
