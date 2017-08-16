const request = require('request')

const Yahoo = function(){
    if(!(this instanceof Yahoo)) return new Yahoo()

    let usdKrw = 0.0
    let timer

    this.get_yahoo_usd_krw_rate = function(){
        request('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%3D%22USDKRW%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
            function(err, response, body){
                if (!err && response.statusCode == 200) {
                    // console.log(JSON.parse(body))
                    let data = JSON.parse(body)
                    // console.log(bittrex_ticker.result) // Print the google web page.
                    usdKrw = parseFloat(data['query']['results']['rate']['Rate']);
                }
            })
    }
    this.run = function(interval){
        if(timer !== undefined){
            console.log("Stop first")
            return
        }
        this.get_yahoo_usd_krw_rate()
        timer = setInterval(this.get_yahoo_usd_krw_rate, interval)
    }
    this.stop = function(){
        clearInterval(timer)
        timer = undefined
    }
    this.getRate = () => usdKrw
}

module.exports.Yahoo = Yahoo