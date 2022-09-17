const querystring = require('node:querystring');
const axios = require('axios');
const cheerio = require('cheerio');

class EtherscanService {
  constructor() {
    this.init();
  }

  init() {
    this.cfg = {
      domain: 'etherscan.io',
      protocol: 'https',
      path: {
        tradeHistory: '/txs',
      },
    };
    this.cache = {};
  }

  /**
   * @returns {string} full url with query string
   */
  getUrl(path = '/', params = {}) {
    const qs = querystring.encode(params);
    const url = `${this.cfg.protocol}://${this.cfg.domain}${path}`;
    if (qs) {
      return `${url}?${qs}`;
    }
    return url;
  }

  /**
   * fetch rawHTML data from target website and return serialized data
   * @param {string} address
   * @param {number} page
   * @returns {Array<Object>} returns what formatter returns
   */
  async getTradeHistory(address = '', page = 1) {
    const rawHTML = await this.fetchRawHTML(address, page);
    const data = this.formatter(rawHTML);
    return data;
  }

  /**
   * fetch raw html
   * @param {string} address
   * @param {number} page
   * @returns {string} string of html structure
   */
  async fetchRawHTML(address, page) {
    const getTradeHistoryCfg = (url) => ({
      method: 'get',
      url,
      headers: {
        authority: 'etherscan.io',
        pragma: 'no-cache',
        'cache-control': 'no-cache',
        'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
        'sec-ch-ua-mobile': '?0',
        dnt: '1',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-user': '?1',
        'sec-fetch-dest': 'document',
        referer: url,
        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'sec-gpc': '1',
      },
    });
    const url = this.getUrl(this.cfg.path.tradeHistory, { a: address, p: page });
    const { data } = await axios(getTradeHistoryCfg(url));
    return data;
  }

  /**
   * format raw html to serialized data
   * @param {string} html
   * @returns {Array<{
   * TxnHash: string
   * Method: string
   * Block: string
   * UTCDateTime: string
   * From: string
   * Direction: string
   * To: string
   * Value: string
   * TxnFee: string
   * GasPrice: string}>}
   */
  formatter(html = '') {
    const result = [];

    const columnIdxMap = {
      TxnHash: 1,
      Method: 2,
      Block: 3,
      UTCDateTime: 4,
      // Age: 5,
      From: 6,
      Direction: 7,
      To: 8,
      Value: 9,
      TxnFee: 10,
      GasPrice: 11,
    };

    const $ = cheerio.load(html);
    const $tableRow = $('#paywall_mask tbody tr');

    $tableRow.each((idx, row) => {
      const $rowCell = $(row).children('td');

      const serializedCell = {};

      Object.entries(columnIdxMap).forEach(([k, v]) => {
        if (v === columnIdxMap.To) {
          // hash-tag will be set in a.href = /address/<hash-tag> or in <span> tag as text
          serializedCell[k] =
            $($rowCell).eq(v).find('a').eq(0).attr('href')?.split('/').at(-1) ||
            $($rowCell).eq(v).find('span.hash-tag').eq(0).text();
        } else {
          serializedCell[k] = $($rowCell).eq(v).text().trim();
        }
      });

      result.push(serializedCell);
    });

    return result;
  }
}

const etherscanService = new EtherscanService();

module.exports = etherscanService;
