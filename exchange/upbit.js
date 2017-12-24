export default class Upbit {
  constructor(browser, page) {
    this.market_summary = null;
    this.market_info = {};
    this.browser = browser;
    this.page = page;
  }
  get_market_summary = () => {
    const assets = this.page.evaluate(resultsSelector => {
      const anchors = Array.from(document.querySelectorAll(resultsSelector));
      console.log(anchors);
      return anchors.map(anchor => {
        const title = anchor.textContent.split('|')[0].trim();
        return `${title}`;
      });
    }, '.tit');

    const price = this.page.evaluate(resultsSelector => {
      const anchors = Array.from(document.querySelectorAll(resultsSelector));
      return anchors.map(anchor => {
        const title = anchor.textContent.split('|')[0].trim();
        return `${title}`;
      });
    }, '.price');

    const percent = this.page.evaluate(resultsSelector => {
      const anchors = Array.from(document.querySelectorAll(resultsSelector));
      return anchors.map(anchor => {
        const title = anchor.textContent.split('|')[0].trim();
        return `${title}`;
      });
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
