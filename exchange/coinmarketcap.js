const request = require('request')

const CoinMarketCap = function(){
    if(!(this instanceof CoinMarketCap)) return new CoinMarketCap()

    let global_market_summary
    let timer

    this.get_coinmarketcap_global_data = function(){
        request('https://api.coinmarketcap.com/v1/global/', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                global_market_summary = JSON.parse(body)
                // console.log(global_market_summary)
            }
        })
    }
    this.run = function(interval){
        if(timer !== undefined){
            console.log("Stop first")
            return
        }
        this.get_coinmarketcap_global_data()
        timer = setInterval(this.get_coinmarketcap_global_data, interval)
    }
    this.stop = function(){
        clearInterval(timer)
        timer = null
    }
    this.getSummary = () => global_market_summary
}

module.exports.CoinMarketCap = CoinMarketCap