const express = require('express');
const etherscanService = require('../service/etherscan');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendStatus(200);
  res.end();
});

router.get('/txs', (req, res, next) => {
  (async () => {
    const { a, p } = req.query;
    const data = await etherscanService.getTradeHistory(a, p);
    return data;
  })()
    .then((d) => {
      res.json({
        code: 20000,
        data: d,
      });
    })
    .catch((e) => {
      next(e);
    });
});

module.exports = router;
