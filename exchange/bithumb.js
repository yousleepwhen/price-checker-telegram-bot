const request = require('request')
const _ = require('lodash')

const Bithumb = function(){
    if(!(this instanceof Bithumb)) return new Bithumb()

    let ticker
    let timer


    const bithum_ticker_parse = function(data){
        return _.each(data, (d) => d.last = d.closing_price)
    }

    this.get_bithumb_ticker = function(){
        request('https://api.bithumb.com/public/ticker/ALL', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log(body) // Print the google web page.
                ticker = bithum_ticker_parse(JSON.parse(body).data)
            }
        })
    }
    this.run = function(interval){
        if(timer !== undefined){
            console.log("Stop first")
            return
        }
        this.get_bithumb_ticker()
        timer = setInterval(this.get_bithumb_ticker, interval)
    }
    this.stop = function(){
        clearInterval(timer)
        timer = undefined
    }
    this.getTicker = () => ticker
}

module.exports.Bithumb = Bithumb