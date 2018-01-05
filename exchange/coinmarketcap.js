const axios = require('axios')

const CoinMarketCap = function(){
  this.getTopCoins = function() {
    return axios.get('https://api.coinmarketcap.com/v1/ticker/?limit=10')
      .then((r) => {
        if(r.status == 200){
          return r.data
        }
      }).catch(err => console.log(err))
  }
  this.getTotalCap = function(){
    return axios.get('https://api.coinmarketcap.com/v1/global/')
      .then((r) => {
        if(r.status == 200){
          return r.data
        }
      }).catch(err => console.log(err))
  }
}

export default CoinMarketCap;