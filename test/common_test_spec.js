const expect = require('expect')
const {getChange, getKeySymbol, numberWithCommas} = require('../util/common')

describe('common utility test', () => {
    it('getChange function test', () => {
        expect(getChange(120.0, 100.0, 1)).toEqual('20.0')
    })

    it('getKeySymbol function test', () => {
        expect(getKeySymbol('USDT_BTC', '_')).toEqual('USDT')
    })

    it('numberWithCommas function test', () => {
        expect(numberWithCommas('1000000')).toEqual('1,000,000')
    })
})