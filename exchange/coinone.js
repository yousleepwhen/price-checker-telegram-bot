const axios = require('axios')

const CoinOne = function(){
  this.getTicker = function(){
    return axios.get('https://api.coinone.co.kr/ticker?currency=all')
      .then((r) => {
        if(r.status == 200){
          return r.data
        }
      }).catch(err => console.log(err))
  }
}
export default CoinOne;