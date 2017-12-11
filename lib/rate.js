import axios from 'axios';

class Rate {
  constructor(base){
    this.base = base;
    this.rate = {};
  }
  getRate() {
    return axios.get(`https://api.fixer.io/latest?base=${this.base}`)
      .then(r => {
        if(r.status === 200){
          for(let key in r.data.rates){
            if (r.data.rates.hasOwnProperty(key)) {
              r.data.rates[key] = 1.0 / r.data.rates[key]
            }
          }
          this.rate = r.data;
          return r;
        }
      })
      .catch(err => {
      throw err;
    })
  }
}

export default Rate;