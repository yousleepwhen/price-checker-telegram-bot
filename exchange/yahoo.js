const _ = require('lodash')
const axios = require('axios')

const Yahoo = function(){
    if(!(this instanceof Yahoo)) return new Yahoo()

    let rates = {
        USD_KRW:{},
        CNY_USD:{}
    }

    let timer

    const queryRate = function(){
        Object.keys(rates).forEach((key, i) => {
            _.delay(() => get_rate(key),i * 5000)
        })
    }

    const get_rate = function(currency){
        let c = currency.replace('_','')

        axios.get(`http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%3D%22${c}%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`)
            .then((r) => {
                if(r.status == 200){
                    // let usdKrw = parseFloat(r.data['query']['results']['rate']['Rate']);
                    rates[currency].last = parseFloat(r.data['query']['results']['rate']['Rate']);

                }
            }).catch(err => console.log(err))

    }
    this.run = function(interval){
        if(timer !== undefined){
            console.log("Stop first")
            return
        }
        queryRate()
        // console.log(rates)
        // this.get_yahoo_usd_krw_rate()

        // _.debounce()
        timer = setInterval(() =>{
            queryRate()
            console.log(rates)
            // this.get_yahoo_usd_krw_rate()
        }, interval)
    }
    this.stop = function(){
        clearInterval(timer)
        timer = undefined
    }
    this.getRate = () => rates
}

module.exports.Yahoo = Yahoo