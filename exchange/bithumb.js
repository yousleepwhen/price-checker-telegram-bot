const axios = require('axios')

const Bithumb = function(){
  this.getTicker = function(){
    return axios.get('https://api.bithumb.com/public/ticker/ALL')
      .then((r) => {
        if(r.status == 200){
          return r.data.data
        }
      })
      .catch(err => {
        console.log(err)
    })
  }
}
export default Bithumb;