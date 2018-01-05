const axios = require('axios')

const Bithumb = function(){
  let ticker = null;
  this.getTicker = function(){
    return axios.get('https://api.bithumb.com/public/ticker/ALL')
      .then((r) => {
        if(r.status == 200){
          return r.data.data
        }
      })
      .catch(err => {
        console.log(err)
        ticker = null;
    })
  }
}
export default Bithumb;