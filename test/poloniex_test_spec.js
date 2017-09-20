const expect = require('expect')
const Poloniex = require('../exchange/Poloniex').Poloniex
const assert = require('assert')
const _ = require('lodash')
const poloniex = new Poloniex()


poloniex.get_poloniex_ticker()

setTimeout(function(){
    describe('Poloniex Test', () => {
        it('should return Poloniex Market Summary', () => {
            let ticker = poloniex.getTicker()
            let t = expect(ticker.hasOwnProperty('USDT_BTC')).toEqual(true)
        })
    })
},1000)
