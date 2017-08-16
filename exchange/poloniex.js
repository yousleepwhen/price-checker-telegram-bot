const request = require('request')

const Poloniex = function(){
    if(!(this instanceof Poloniex)) return new Poloniex()

    let ticker
    let markets
    let timer

    this.get_poloniex_ticker = function(){
        request('https://poloniex.com/public?command=returnTicker', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let data = JSON.parse(body)
                ticker = data
                markets = Object.keys(data)
            }
        })
    }
    this.run = function(interval){
        if(timer !== undefined){
            console.log("Stop first")
            return
        }
        this.get_poloniex_ticker()
        timer = setInterval(this.get_poloniex_ticker, interval)
    }
    this.stop = function(){
        clearInterval(timer)
        timer = undefined
    }
    this.getTicker = () => ticker
}

module.exports.Poloniex = Poloniex