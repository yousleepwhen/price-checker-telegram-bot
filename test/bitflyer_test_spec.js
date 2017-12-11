import { expect } from 'chai';
import BF from '../exchange/bitflyer';
const assert = require('assert')
const _ = require('lodash')
const BitFlyer = new BF();

BitFlyer.getTicker();

describe('BitFlyer Test', () => {
  it('should return latest ticker of BTC-JPY', () => {

    return new Promise(function (resolve) {
      setTimeout(() => {
        expect(BitFlyer.ticker.product_code).equal('BTC_JPY')
        resolve();
      },1500)

    })
      .then();
  })
})