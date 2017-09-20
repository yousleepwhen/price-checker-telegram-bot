const expect = require('expect')
const Poloniex = require('../exchange/poloniex').Poloniex
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

        it('should run Poloniex timer', () => {
            poloniex.run(1000)
            return new Promise(function (resolve) {
                setTimeout(() => {
                    expect(poloniex.isRun()).toEqual(true)
                    poloniex.stop()
                    resolve();
                },1500)

            })
                .then()

        })

        it('should stop Poloniex timer', () => {
            poloniex.run(1000)
            expect(poloniex.isRun()).toEqual(true)
            poloniex.stop()
            expect(poloniex.isRun()).toEqual(false)
        })
    })
},1000)
