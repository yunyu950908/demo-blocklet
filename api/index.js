const express = require('express');
const etherscanRouter = require('./routers/etherscan');
const logger = require('./libs/logger');

const app = express();

const port = process.env.BLOCKLET_PORT || process.env.PORT || 3030;

app.use('/api/etherscan', etherscanRouter);

app.use((err, req, res, next) => {
  res.status(err.httpStatusCode);
  res.json({
    code: err.errCode,
    message: err.message,
  });
  next();
});

app.listen(port, () => {
  console.log(`Blocklet app listening on port ${port}`);
});

process.on('uncaughtException', (err) => {
  logger.error('uncaught exception', { err });
});

process.on('unhandledReject', (reason, p) => {
  logger.error('unhandledRejection', { reason, p });
});
