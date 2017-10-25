const _ = require('lodash')
const axios = require('axios')

const Liqui = function() {
    if(!(this instanceof Liqui)) return new Liqui()

    let market_summary = {
        knc_eth:{
        },
    }

    let timer

    //Kyber Network ETH Market
    const get_knc_ticker = function(){
        axios.get('https://api.liqui.io/api/3/ticker/knc_eth')
            .then((r) => {
                if(r.status == 200){
                    market_summary['knc_eth'] = r.data['knc_eth']
                }
            }).catch(err => console.log(err))
    }
    this.getTicker = function(){
        get_knc_ticker()
    }

    this.run = function(interval){
        if(timer !== undefined){
            console.log("Stop first")
            return
        }
        get_knc_ticker()
        timer = setInterval(() => {
            get_knc_ticker()
        },interval)
    }
    this.stop = function(){
        clearInterval(timer)
        timer = undefined
    }
    this.getMarketSummary = () => market_summary
}

module.exports = Liqui