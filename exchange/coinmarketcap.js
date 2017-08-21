const axios = require('axios')

const CoinMarketCap = function(){
    if(!(this instanceof CoinMarketCap)) return new CoinMarketCap()

    let global_market_summary
    let timer

    this.get_coinmarketcap_global_data = function(){
        axios.get('https://api.coinmarketcap.com/v1/global/')
            .then((r) => {
                if(r.status == 200){
                    global_market_summary = r.data
                }
            }).catch(err => console.log(err))
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
        timer = undefined
    }
    this.getSummary = () => global_market_summary
}

module.exports.CoinMarketCap = CoinMarketCap