const request = require('request')
const _ = require('lodash')

const Korbit = function() {
    if(!(this instanceof Korbit)) return new Korbit()

    let market_summary = {
        eth:{},
        btc:{},
        bcc:{},
        xrp:{},
        etc:{}
    }

    let timer

    let market = ['xrp','btc','eth','etc','bcc']

    const get_korbit_ticker = function(name){
        request('https://api.korbit.co.kr/v1/ticker?currency_pair='+ name +'_krw', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                market_summary[name] = JSON.parse(body)
            }
        })
    }


    this.get_korbit_market_summary = function(){
        _.each(market, m => get_korbit_ticker(m))
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
        timer = null
    }
    this.getMarketSummary = () => market_summary
}

module.exports.Korbit = Korbit