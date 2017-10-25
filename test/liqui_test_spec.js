const expect = require('expect')
const Liqui = require('../exchange/liqui')
const assert = require('assert')
const _ = require('lodash')
const liqui = new Liqui()


liqui.getTicker()

setTimeout(function(){
    describe('Liqui Test', () => {
        it('should return Liqui Kyber Network Summary', () => {
            let ticker = liqui.getMarketSummary()
            expect(ticker.hasOwnProperty('knc_eth')).toEqual(true)
            expect(ticker['knc_eth'].hasOwnProperty('updated')).toEqual(true)
            // console.log(ticker)
        })

        // it('should run Poloniex timer', () => {
        //     poloniex.run(1000)
        //     return new Promise(function (resolve) {
        //         setTimeout(() => {
        //             expect(poloniex.isRun()).toEqual(true)
        //             poloniex.stop()
        //             resolve();
        //         },1500)
        //
        //     })
        //         .then()
        //
        // })
        //
        // it('should stop Poloniex timer', () => {
        //     poloniex.run(1000)
        //     expect(poloniex.isRun()).toEqual(true)
        //     poloniex.stop()
        //     expect(poloniex.isRun()).toEqual(false)
        // })
    })
},1000)
