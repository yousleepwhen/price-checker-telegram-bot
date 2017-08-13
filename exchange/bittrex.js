const request = require('request')
const _ = require('lodash')

const Bittrex = function() {
    if(!(this instanceof Bittrex)) return new Bittrex()

    let market_summary
    let market_info

    let timer

    this.get_bittrex_market_summary = function(){
        request('https://bittrex.com/api/v1.1/public/getmarketsummaries', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                market_summary = JSON.parse(body).result
            }
        })
    }
    this.get_bittrex_market_info = function(){
        request('https://bittrex.com/api/v1.1/public/getmarkets', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                market_info = JSON.parse(body).result
            }
        })
    }
    this.run = function(interval){
        if(timer !== undefined){
            console.log("Stop first")
            return
        }
        this.get_bittrex_market_summary()
        this.get_bittrex_market_info()
        timer = setInterval(() => {
            this.get_bittrex_market_summary()
            this.get_bittrex_market_info()
        },interval)
    }
    this.stop = function(){
        clearInterval(timer)
        timer = null
    }

    this.getMarketSummary = () => market_summary
    this.getMarkets = () => market_info
}

module.exports.Bittrex = Bittrex