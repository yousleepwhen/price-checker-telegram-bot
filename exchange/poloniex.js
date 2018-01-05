const axios = require('axios')

const Poloniex = function(){
  this.getTicker = function(){
    return axios.get('https://poloniex.com/public?command=returnTicker')
      .then((r) => {
        if(r.status == 200){
          return {
            global_market_summary: r.data,
            ticker: r.data,
            markets: Object.keys(r.data),
          }
        }
    }).catch(err => console.log('POLONIEX ERR', err))
  }
};

export default Poloniex;