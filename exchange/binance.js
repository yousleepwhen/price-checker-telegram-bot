import axios from 'axios';

class Binance {
  constructor(){
    this.ticker = {};
  }
  getTicker() {
    return axios.get('https://api.binance.com/api/v1/ticker/24hr')
      .then(r => {
        if(r.status === 200){
          this.ticker.btc_market = r.data.filter(r => r.symbol.match(/([a-zA-Z]+)BTC/g))
          this.ticker.eth_market = r.data.filter(r => r.symbol.match(/([a-zA-Z]+)ETH/g))
          return this.ticker;
        }
      })
      .catch(err => {
        throw err;
      })
  }
}

export default Binance;