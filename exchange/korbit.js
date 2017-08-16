const request = require('request')
const _ = require('lodash')

const Korbit = function() {
    if(!(this instanceof Korbit)) return new Korbit()

    let market_summary = {
        eth:{
            MarketName:'KRW-ETH',
            Symbol:'ETH'
        },
        btc:{
            MarketName:'KRW-BTC',
            Symbol:'BTC'
        },
        bch:{
            MarketName:'KRW-BCH',
            Symbol:'BCH'
        },
        xrp:{
            MarketName:'KRW-XRP',
            Symbol:'XRP'
        },
        etc:{
            MarketName:'KRW-ETC',
            Symbol:'ETC'
        }
    }

    let timer

    const get_korbit_ticker = function(name){
        // console.log(name)
        request('https://api.korbit.co.kr/v1/ticker?currency_pair='+ name.toLowerCase() +'_krw', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                market_summary[name.toLowerCase()] = Object.assign(market_summary[name.toLowerCase()], JSON.parse(body))
            }
        })
    }


    this.get_korbit_market_summary = function(){
        _.each(market_summary, m => get_korbit_ticker(m.Symbol))
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