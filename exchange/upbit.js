import chunk from 'lodash/chunk';
const puppeteer = require('puppeteer');

export default class Upbit {
  constructor(browser, page) {
    this.market_summary = null;
    this.market_info = {};
    this.browser = browser;
    this.page = page;
    this.refresh = false;
    this.last_date = {};
    this.count = 0;
    this.page.once('load', () => console.log('Page loaded!'));
    this.page.on('error', (err) => {
      console.log('ERROR', err);
    })

    process.on("unhandledRejection", async (reason, p) => {
      console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
      // await this.browser.close();
      // this.browser = await puppeteer.launch();
      // this.page = await this.browser.newPage();
      // this.pause = true;
    });
  }
  async get_market_summary_async() {
    if(this.count > 15){
      await this.page.close();
      this.page = await this.browser.newPage();
      this.page.once('load', () => console.log('Page loaded!'));
      this.page.on('error', (err) => {
        console.log('ERROR', err);
      })
      this.count = 0;
    }

    await this.page.goto('https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC', { waitUntil: 'networkidle2'});
    await this.page.waitForSelector('.search');
    const assets = await this.page.evaluate(resultsSelector => {
      const anchors = Array.from(document.querySelectorAll(resultsSelector));
      return anchors.map(anchor => {
        const title = anchor.textContent.split('|')[0].trim();
        return `${title}`;
      });
    }, '.tit, .price, .percent');
    const m = chunk(assets, 3);
    m.shift();

    const ticker = m.map(a => ({
      name: a[0],
      price: a[1],
      percent: a[2]
    }));
    this.market_summary =
      ticker.sort((a, b) => parseInt(b.price.replace(/,/gi, '')) - parseInt(a.price.replace(/,/gi,'')));
    this.count++;
    // this.last_date = new Date();
    // console.log(this.last_date.toUTCString())
  }
}
