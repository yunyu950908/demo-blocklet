const express = require('express');
const etherscanRouter = require('./routers/etherscan');
const logger = require('./libs/logger');

const app = express();

const port = process.env.BLOCKLET_PORT || process.env.PORT || 3030;

app.get('/', (req, res) => {
  res.send('Hello World, Blocklet!');
});

app.use('/etherscan', etherscanRouter);

app.listen(port, () => {
  console.log(`Blocklet app listening on port ${port}`);
});

process.on('uncaughtException', (err) => {
  logger.error('uncaught exception', { err });
});

process.on('unhandledReject', (reason, p) => {
  logger.error('unhandledRejection', { reason, p });
});
