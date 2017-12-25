const axios = require('axios')
class Bittrex {
  constructor(){
    this.market_summary = null;
    this.market_info = {};
  }
  get_bittrex_market_summary = () => {

    axios.get('https://bittrex.com/api/v1.1/public/getmarketsummaries')
      .then((r) => {
        if(r.status == 200){
          this.market_summary = r.data.result
          return r.data.result
        }
      }).catch(err => console.log(err))
  }
  get_bittrex_market_info = () => {

    axios.get('https://bittrex.com/api/v1.1/public/getmarkets')
      .then((r) => {
        if(r.status == 200){
          this.market_info = r.data.result
        }
      }).catch(err => console.log(err))
  }
}

module.exports.Bittrex = Bittrex