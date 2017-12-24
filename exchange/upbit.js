
export default class Upbit {
  constructor(browser, page) {
    this.market_summary = {};
    this.market_info = {};
    this.browser = browser;
    this.page = page;
  }
  get_market_summary = () => {
    const getTitle = result => {
      const anchors = Array.from(document.querySelectorAll(result));
      return anchors.map(anchor => {
        const title = anchor.textContent.split('|')[0].trim();
        return `${title}`;
      });
    }
    const assets = this.page.evaluate(resultsSelector => {
      return getTitle(resultsSelector);
    }, '.tit');

    const price = this.page.evaluate(resultsSelector => {
      return getTitle(resultsSelector);
    }, '.price');

    const percent = this.page.evaluate(resultsSelector => {
      return getTitle(resultsSelector);
    }, '.percent');

    Promise.all([assets, price, percent]).then(r => {
      r[0].shift();
      r[1].shift(); //remove 주문가능
      r[1].shift(); //remove 0 KRW

      if(r[0].length === r[0].length && r[0].length === r[2].length) {
        const ticker = r[0].map((a, idx) => ({
          name: a,
          price: r[1][idx],
          percent: r[2][idx]
        }));
        this.market_summary =
          ticker.sort((a, b) => parseInt(b.price.replace(/,/gi, '')) - parseInt(a.price.replace(/,/gi,'')));
      }
    });
  }
}
