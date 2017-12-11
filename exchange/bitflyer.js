import axios from 'axios';

class BitFlyer {
  constructor(){
    this.ticker = {};
  }
  getTicker() {
    return axios.get(`https://api.bitflyer.jp/v1/ticker?product_code=BTC_JPY`)
      .then(r => {
        if(r.status === 200){
          this.ticker = r.data;
          return r.data;
        }
      })
      .catch(err => {
        throw err;
      })
  }
}

export default BitFlyer;