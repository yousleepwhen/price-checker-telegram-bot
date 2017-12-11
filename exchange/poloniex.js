const axios = require('axios')
const isUndefined = require('lodash/isUndefined')

const Poloniex = function(){
    if(!(this instanceof Poloniex)) return new Poloniex()

    let ticker
    let markets
    let timer
    let global_market_summary

    this.get_poloniex_ticker = function(){

        axios.get('https://poloniex.com/public?command=returnTicker')
            .then((r) => {
                if(r.status == 200){
                    global_market_summary = r.data
                    ticker = r.data
                    markets = Object.keys(r.data)
                }
            }).catch(err => console.log(err))
    }
    this.run = function(interval){
        if(timer !== undefined){
            return
        }
        this.get_poloniex_ticker()
        timer = setInterval(this.get_poloniex_ticker, interval)
    }
    this.stop = function(){
        clearInterval(timer)
        timer = undefined
    }
    this.getTicker = () => ticker

    this.isRun = () => !isUndefined(timer)
}

module.exports.Poloniex = Poloniex