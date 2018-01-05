const _ = require('lodash')
const axios = require('axios')

const Korbit = function() {
  this.getTicker = function(key){
    return axios.get('https://api.korbit.co.kr/v1/ticker?currency_pair='+ key +'_krw')
      .then((r) => {
        if(r.status == 200){
          return r.data;
          // market_summary[key] = Object.assign(market_summary[key], r.data)
        }
      }).catch(err => console.log(err))
  }
}

export default Korbit;