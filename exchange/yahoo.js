const request = require('request')
const _ = require('lodash')

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
        // console.log('call get_rate :' + currency)
        request('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%3D%22' + c + '%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
            function(err, response, body){
                if (!err && response.statusCode == 200) {
                    // console.log(JSON.parse(body))
                    let data = JSON.parse(body)
                    // console.log(bittrex_ticker.result) // Print the google web page.
                    usdKrw = parseFloat(data['query']['results']['rate']['Rate']);
                    rates[currency].last = parseFloat(data['query']['results']['rate']['Rate']);
                }
            })
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