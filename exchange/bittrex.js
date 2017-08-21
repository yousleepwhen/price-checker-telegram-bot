const axios = require('axios')
const Bittrex = function() {
    if(!(this instanceof Bittrex)) return new Bittrex()

    let market_summary
    let market_info

    let timer

    this.get_bittrex_market_summary = function(){

        axios.get('https://bittrex.com/api/v1.1/public/getmarketsummaries')
            .then((r) => {
                if(r.status == 200){
                    market_summary = r.data.result
                }
            }).catch(err => console.log(err))
    }
    this.get_bittrex_market_info = function(){

        axios.get('https://bittrex.com/api/v1.1/public/getmarkets')
            .then((r) => {
                if(r.status == 200){
                    market_info = r.data.result
                }
            }).catch(err => console.log(err))
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
        timer = undefined
    }

    this.getMarketSummary = () => market_summary
    this.getMarkets = () => market_info
}

module.exports.Bittrex = Bittrex