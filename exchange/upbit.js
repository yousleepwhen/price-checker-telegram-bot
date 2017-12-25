export default class Upbit {
  constructor(browser, page) {
    this.market_summary = null;
    this.market_info = {};
    this.browser = browser;
    this.page = page;
    this.refresh = false;
    this.last_date = {};
  }
  refresh = () => {
    // this.refresh = true;
    // console.log('REFRESH!');
    // const page = this.page.goto('https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC', { waitUntil: 'networkidle2'});
    // page
    //   .then(r => {
    //   return page.waitForSelector('.search');
    // }).then(r => {
    //   console.log(r);
    //   this.refresh = false;
    // })
  }
  get_market_summary = () => {
    if(this.refresh){
      return;
    }
    this.refresh = true;
    const page = this.page.goto('https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC', { waitUntil: 'networkidle2'});

    let assets = {};
    let price = {};
    let percent = {};

    page
      .then(r => this.page.waitForSelector('.search'))
      .then(r => {
        assets = this.page.evaluate(resultsSelector => {
          const anchors = Array.from(document.querySelectorAll(resultsSelector));
          return anchors.map(anchor => {
            const title = anchor.textContent.split('|')[0].trim();
            return `${title}`;
          });
        }, '.tit');

        price = this.page.evaluate(resultsSelector => {
          const anchors = Array.from(document.querySelectorAll(resultsSelector));
          return anchors.map(anchor => {
            const title = anchor.textContent.split('|')[0].trim();
            return `${title}`;
          });
        }, '.price');

        percent = this.page.evaluate(resultsSelector => {
          const anchors = Array.from(document.querySelectorAll(resultsSelector));
          return anchors.map(anchor => {
            const title = anchor.textContent.split('|')[0].trim();
            return `${title}`;
          });
        }, '.percent');

        Promise.all([assets, price, percent]).then(r => {
          // console.log(r);
          r[0].shift();
          r[1].shift(); //remove 주문가능
          r[1].shift(); //remove 0 KRW

          if(r[0].length === r[1].length && r[0].length === r[2].length) {
            const ticker = r[0].map((a, idx) => ({
              name: a,
              price: r[1][idx],
              percent: r[2][idx]
            }));
            this.market_summary =
              ticker.sort((a, b) => parseInt(b.price.replace(/,/gi, '')) - parseInt(a.price.replace(/,/gi,'')));
            this.last_date = new Date();
            // console.log(this.last_date.toUTCString())
          }
          this.refresh = false;
        });
      })
  }
}
