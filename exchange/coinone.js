const _ = require('lodash')
const axios = require('axios')

const Coinone = function(){
    if(!(this instanceof Coinone)) return new Coinone()

    let ticker
    let timer

    this.get_coinone_ticker= function(){

        axios.get('https://api.coinone.co.kr/ticker?currency=all')
            .then((r) => {
                if(r.status == 200){
                    ticker = r.data
                    console.log(ticker)
                }
            }).catch(err => console.log(err))
    }
    this.run = function(interval){
        if(timer !== undefined){
            console.log("Stop first")
            return
        }
        this.get_coinone_ticker()
        timer = setInterval(this.get_coinone_ticker, interval)
    }
    this.stop = function(){
        clearInterval(timer)
        timer = undefined
    }
    this.getTicker = () => ticker
}

module.exports.Coinone = Coinone