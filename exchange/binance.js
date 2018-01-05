import axios from 'axios';

const Binance = function() {
  this.getTicker = function() {
    return axios.get('https://api.binance.com/api/v1/ticker/24hr')
      .then(r => {
        if(r.status === 200){
          return {
            btc_market: r.data.filter(r => r.symbol.match(/([a-zA-Z]+)BTC/g)),
            eth_market: r.data.filter(r => r.symbol.match(/([a-zA-Z]+)ETH/g)),
          }
        }
      })
      .catch(err => {
        throw err;
      })
  }
}

export default Binance;