const request = require('request')
const _ = require('lodash')

const Korbit = function() {
    if(!(this instanceof Korbit)) return new Korbit()

    let market_summary = {
        eth:{
            MarketName:'KRW-ETH',
        },
        btc:{
            MarketName:'KRW-BTC',
        },
        bch:{
            MarketName:'KRW-BCH',
        },
        xrp:{
            MarketName:'KRW-XRP',
        },
        etc:{
            MarketName:'KRW-ETC',
        }
    }

    let timer

    const get_korbit_ticker = function(key){
        // console.log(name)
        request('https://api.korbit.co.kr/v1/ticker?currency_pair='+ key +'_krw', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                market_summary[key] = Object.assign(market_summary[key], JSON.parse(body))
            }
        })
    }


    this.get_korbit_market_summary = function(){
        _.each(Object.keys(market_summary), key => get_korbit_ticker(key))
    }

    this.run = function(interval){
        if(timer !== undefined){
            console.log("Stop first")
            return
        }
        this.get_korbit_market_summary()
        timer = setInterval(() => {
            this.get_korbit_market_summary()
        },interval)
    }
    this.stop = function(){
        clearInterval(timer)
        timer = undefined
    }
    this.getMarketSummary = () => market_summary
}

module.exports.Korbit = Korbit