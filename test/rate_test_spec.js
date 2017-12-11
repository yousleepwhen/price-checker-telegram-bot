import { expect } from 'chai';
import Rate from '../lib/rate';
const assert = require('assert')
const _ = require('lodash')
const Rater = new Rate('KRW');
const Rater_CNY = new Rate('CNY');
Rater.getRate();
Rater_CNY.getRate();

describe('Get Rate Test', () => {
  it('should return latest KRW Rate', () => {

    return new Promise(function (resolve) {
      setTimeout(() => {
          expect(Rater.rate.base).equal('KRW')
            resolve();
        },1500)

      })
      .then();
  })
  it('should have KRW-USD Rate', () => {

    return new Promise(function (resolve) {
      setTimeout(() => {

        expect(Rater.rate.rates.USD).to.be.an('number');
        resolve();
      },100)

    })
      .then();
  })
  it('should have CNY-USD Rate', () => {

    return new Promise(function (resolve) {
      setTimeout(() => {
        expect(Rater_CNY.rate.base).equal('CNY')
        expect(Rater_CNY.rate.rates.USD).to.be.an('number');
        resolve();
      },100)

    })
      .then();
  })

})