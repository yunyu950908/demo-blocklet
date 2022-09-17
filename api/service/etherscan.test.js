const { readFileSync } = require('node:fs');
const { resolve } = require('node:path/posix');
const axios = require('axios');
const etherscanService = require('./etherscan');
const HTTPBadRequestError = require('../errors/http-bad-request-error');

jest.mock('axios');

const pageMockHtml = readFileSync(resolve(__dirname, './mocks/page.mock.html'), { encoding: 'utf-8' });
const emptyMockHtml = readFileSync(resolve(__dirname, './mocks/empty.mock.html'), { encoding: 'utf-8' });
const dataMockJson = require('./mocks/data.mock.json');

axios.mockResolvedValue({
  data: pageMockHtml,
});

const protocol = 'https';
const domain = 'etherscan.io';
const path = {
  tradeHistory: '/txs',
};
const validAddress = '0xe592427a0aece92de3edee1f18e0157c05861564';

describe('test service/etherscan', () => {
  test('etherscanService.init should be called', () => {
    expect(etherscanService.cfg).toBeDefined();
    expect(etherscanService.cfg.protocol).toMatch(protocol);
    expect(etherscanService.cfg.domain).toMatch(domain);
    expect(etherscanService.cfg.path.tradeHistory).toMatch(path.tradeHistory);
  });

  describe('test etherscanService.getUrl', () => {
    test('should return valid url', () => {
      expect(etherscanService.getUrl()).toMatch(`${protocol}://${domain}/`);
      expect(etherscanService.getUrl(path.tradeHistory)).toMatch(`${protocol}://${domain}${path.tradeHistory}`);
    });

    test('should return valid url with valid querystring', () => {
      expect(etherscanService.getUrl('/', { name: 'John', age: 18 })).toMatch(
        `${protocol}://${domain}/?name=John&age=18`
      );
    });
  });

  describe('test etherscanService.getTradeHistory', () => {
    test('address length out of range', async () => {
      expect.assertions(1);
      try {
        await etherscanService.getTradeHistory(validAddress.padEnd(43, 'a'));
      } catch (error) {
        expect(error).toBeInstanceOf(HTTPBadRequestError);
      }
    });
    test('address should start with 0x', async () => {
      expect.assertions(1);
      try {
        await etherscanService.getTradeHistory(validAddress.substring(2).padStart(42, 'a'));
      } catch (error) {
        expect(error).toBeInstanceOf(HTTPBadRequestError);
      }
    });
    test('page should be a positive integer', async () => {
      expect.assertions(1);
      try {
        await etherscanService.getTradeHistory(validAddress, 0);
      } catch (error) {
        expect(error).toBeInstanceOf(HTTPBadRequestError);
      }
    });

    test('should return array of object', async () => {
      expect.assertions(1);

      const data = await etherscanService.getTradeHistory(validAddress);
      expect(data).toEqual(dataMockJson);
    });
  });

  describe('test etherscanService.fetchRawHTML', () => {
    test('should resolve text of html', async () => {
      expect.assertions(1);

      const data = await etherscanService.fetchRawHTML(validAddress);
      expect(data).toEqual(pageMockHtml);
    });
  });

  describe('test etherscanService.formatter', () => {
    test('should return array of object', () => {
      const result = etherscanService.formatter(pageMockHtml);
      expect(Array.isArray(result)).toBeTruthy();
      expect(result).toEqual(dataMockJson);
    });

    test('should return empty array', () => {
      const result = etherscanService.formatter(emptyMockHtml);
      expect(Array.isArray(result)).toBeTruthy();
      expect(result).toEqual([]);
    });
  });
});
