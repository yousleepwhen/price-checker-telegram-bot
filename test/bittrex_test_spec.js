const expect = require('expect')
const Bittrex = require('../exchange/bittrex').Bittrex
const assert = require('assert')
const _ = require('lodash')
const bittrex = new Bittrex()

bittrex.get_bittrex_market_summary()
bittrex.get_bittrex_market_info()
describe('Bittrex Test', () => {
    it('should return bittrex Market Summary', () => {

        // bittrex.get_bittrex_market_summary()

        return new Promise(function (resolve) {
            setTimeout(() => {
                let m = bittrex.market_summary
                let f = m.filter(market => market.MarketName === 'USDT-BTC')
                expect(f[0].MarketName).toEqual('USDT-BTC')
                expect(f.length).toEqual(1)
                resolve();
            },1500)

        })
            .then();
    })

    it('should return bittrex Market Info', () => {


        return new Promise(function (resolve) {
            setTimeout(() => {
                let m = bittrex.market_info
                let f = m.filter(market => market.MarketName === 'USDT-BTC')
                expect(f[0].MarketName).toEqual('USDT-BTC')
                expect(f.length).toEqual(1)
                resolve();
            },1500)

        })
            .then()
    })
})