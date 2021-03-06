import Rate from "./lib/rate";
import _ from 'lodash';
import { getHowManyEmoji, numberWithCommas, getChange, getKeySymbol } from './util/common.js'
import TelegramBot from 'node-telegram-bot-api';
import exchanges from './exchange';
import BitFlyer from './exchange/bitflyer';
import Binance from './exchange/binance';
import Poloniex from './exchange/poloniex';
import CoinOne from './exchange/coinone';
import Bithumb from './exchange/bithumb';
import Korbit from './exchange/korbit';
import CoinMarketCap from './exchange/coinmarketcap';
if(!process.env.TELEGRAM_BOT_TOKEN ){
  throw "Telegram bot token missing"
}
const token = process.env.TELEGRAM_BOT_TOKEN
//
//
const bot = new TelegramBot(token, {polling: true})
const App = {};

// Rate Timer Set
App.Rater_KRW = new Rate('KRW');
App.Rater_CNY = new Rate('CNY');
App.Rater_KRW_TIMER = setInterval(() => App.Rater_KRW.getRate(), 5000);
App.Rater_CNY_TIMER = setInterval(() => App.Rater_CNY.getRate(), 5000);
App.Rater_KRW.getRate();
App.Rater_CNY.getRate();

// Exchanges Timer Set
App.Exchanges = {}
App.Exchanges.Binance = new Binance();
App.Exchanges.BitFlyer = new BitFlyer();
App.Exchanges.BitFlyer_TIMER = setInterval(() => App.Exchanges.BitFlyer.getTicker(), 5000);
App.Exchanges.BitFlyer.getTicker();
App.Exchanges.Bittrex = new exchanges.Bittrex();
App.Exchanges.Bittrex_TIMER = setInterval(() => {
  App.Exchanges.Bittrex.get_bittrex_market_info();
  App.Exchanges.Bittrex.get_bittrex_market_summary();
}, 4000);

App.Exchanges.Poloniex = new Poloniex();
App.Exchanges.CoinOne = new CoinOne();
App.Exchanges.Bithumb = new Bithumb();
App.Exchanges.Korbit = new Korbit();
App.Exchanges.CoinMarketCap = new CoinMarketCap();

// init headless browser
// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto('https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC',
//     { waitUntil: 'networkidle2',
//       timeout: 0,
//     });
//   await page.waitForSelector('.search');
//   App.Exchanges.UpBit = new Upbit(browser, page);
//
//   App.Exchanges.UpBit_TIMER = setInterval(async () => {
//     await App.Exchanges.UpBit.get_market_summary_async();
//   }, 10000);
// })()


bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    bot.sendMessage(chatId, resp);
});


const changeTextGenerate = (text, change) => {
  return `${text}: <b>${change}%</b>${getHowManyEmoji(change)}` + "\r\n"
}

function bittrextStringParse(tickerData){
  const { market_summary, market_info } = App.Exchanges.Bittrex;
    if(tickerData !== undefined){
        let marketTitle = tickerData.MarketName

        let change = getChange(tickerData.Last, tickerData.PrevDay, 2)

        let key = getKeySymbol(marketTitle,"-")

        let usdt_btc_market = _.find(market_summary,{'MarketName':'USDT-BTC'})
        let usdt_eth_market = _.find(market_summary,{'MarketName':'USDT-ETH'})

        let lastUSD;
        let prevUSD;
        let usdChange;

        if(key==="BTC"){
            lastUSD = " $" + (parseFloat(tickerData.Last) * usdt_btc_market.Last).toFixed(4)
            prevUSD = " $" + (parseFloat(tickerData.PrevDay)* usdt_btc_market.PrevDay).toFixed(4)

            usdChange = getChange(tickerData.Last * usdt_btc_market.Last, tickerData.PrevDay * usdt_btc_market.PrevDay, 2)
        }
        else if(key==="ETH"){
            lastUSD = " $" + (parseFloat(tickerData.Last) * usdt_eth_market.Last).toFixed(4)
            prevUSD = " $" + (parseFloat(tickerData.PrevDay) * usdt_eth_market.PrevDay).toFixed(4)
            usdChange = getChange(parseFloat(tickerData.Last) * usdt_eth_market.Last,parseFloat(tickerData.PrevDay)* usdt_eth_market.PrevDay ,2)
        }
        else if(key==="USDT"){
            lastUSD =" $" + parseFloat(tickerData.Last).toFixed(4)
            prevUSD =" $" + parseFloat(tickerData.PrevDay).toFixed(4)
            usdChange = getChange(tickerData.Last, tickerData.PrevDay,2)

        }
        else if (key ==="BITCNY"){
            let cny_rate = App.Rater_CNY.rate.rates.USD
            // console.log(tickerData.Last * cny_rate)
            lastUSD = " $" + parseFloat(tickerData.Last * cny_rate).toFixed(4)
            prevUSD = " $" + parseFloat(tickerData.PrevDay * cny_rate).toFixed(4)
            usdChange = "???"
        }


        const changeText = changeTextGenerate('Change', change);
        const usdChangeText = changeTextGenerate('USD Change', usdChange);




        let msg = "" +
            "최근 BTC: 💲<b>" + numberWithCommas(usdt_btc_market.Last.toFixed(2)) + "</b>\r\n" +
            "어제 BTC: 💲<b>" + numberWithCommas(usdt_btc_market.PrevDay.toFixed(2)) + "</b>\r\n" +
            "BTC USD Change: " + getChange(usdt_btc_market.Last, usdt_btc_market.PrevDay, 2) + "%\r\n" +
            "\r\n" +
            "최근 ETH: 💲<b>" + numberWithCommas(usdt_eth_market.Last.toFixed(2)) + "</b>\r\n" +
            "어제 ETH: 💲<b>" + numberWithCommas(usdt_eth_market.PrevDay.toFixed(2)) + "</b>\r\n" +
            "ETH USD Change: " + getChange(usdt_eth_market.Last, usdt_eth_market.PrevDay, 2) + "%\r\n"+

            "=============\r\n" +
            "Market: <b>" +tickerData.MarketName + "</b>\r\n" +
            "최근: <b>" + parseFloat(tickerData.Last).toFixed(8) + ` ${key}` + lastUSD +"</b>\r\n" +
            "어제: <b>" + parseFloat(tickerData.PrevDay).toFixed(8) +` ${key}`+ prevUSD +"</b>\r\n" +
            changeText  +"" +
            usdChangeText + "" +
            "Volume: " + parseFloat(tickerData.Volume).toFixed(2) + "\r\n" +
            "OpenBuyOrders: "+ tickerData.OpenBuyOrders +"\r\n" +
            "OpenSellOrders: "+ tickerData.OpenSellOrders +"\r\n" +
            "=============\r\n"

        return msg
    } else {
        return "Can not find market"
    }
}

async function calcKoreanPremium(){
  if(App.Rater_KRW.rate.rates.USD === undefined || App.Rater_KRW.rate.rates.USD === null){
    return;
  }
  const usd_krw_rate = App.Rater_KRW.rate.rates.USD
  const krw_jpy_rate = App.Rater_KRW.rate.rates.JPY

  const bittrex_market_summary = App.Exchanges.Bittrex.market_summary
  if(bittrex_market_summary === null){
    return;
  }

  const bithumb_ticker = await App.Exchanges.Bithumb.getTicker();
  let usdDash = parseFloat(_.find(bittrex_market_summary, {'MarketName':'USDT-DASH'}).Last)
  let krwDash = parseFloat(bithumb_ticker.DASH.closing_price)

  let usdBtc = parseFloat(_.find(bittrex_market_summary, {'MarketName':'USDT-BTC'}).Last)
  let usdEth = parseFloat(_.find(bittrex_market_summary, {'MarketName':'USDT-ETH'}).Last)
  let krwEth = parseFloat(bithumb_ticker.ETH.closing_price)
  let krwBtc = parseFloat(bithumb_ticker.BTC.closing_price)

  let usdKrwDash = usdDash * usd_krw_rate
  let usdKrwEth = usdEth * usd_krw_rate
  let usdKrwBtc = usdBtc * usd_krw_rate

  const krw_jpy_btc = krw_jpy_rate * App.Exchanges.BitFlyer.ticker.ltp;


  const dashRate = getChange(krwDash, usdKrwDash, 2)
  const ethRate = getChange(krwEth ,usdKrwEth ,2)
  const btcRate = getChange(krwBtc , usdKrwBtc,2)

  const btc_krw_jpy_rate = getChange(krwBtc , krw_jpy_btc,2);

  const getIcon = function(rate){
    if(rate > 0.0){
      return rate + "%"
    }
    else if( rate < 0.0){
      return rate + "%"
    } else return rate +"%"
  }

  const message = `
  환율 조회: https://api.fixer.io/
날짜: ${App.Rater_KRW.rate.date}
KRW USD 환율: 1$ = ${usd_krw_rate.toFixed(4)}원
KRW JPY 환율: 1￥ = ${App.Rater_KRW.rate.rates.JPY.toFixed(4)}원
대상: Bittrex : Bithumb
BTC:<b>${getIcon(btcRate)}</b>
ETH:<b>${getIcon(ethRate)} </b>
ETH-USD(Bittrex):<b>$ ${usdEth}(₩ ${numberWithCommas((usdEth * usd_krw_rate).toFixed(0))})</b>
ETH-KRW(Bithumb):<b>₩ ${numberWithCommas(krwEth)}</b>
DASH:<b>${getIcon(dashRate)}</b>

대상: Bithumb : Bitflyer
BitFlyerBTC: ￥ ${App.Exchanges.BitFlyer.ticker.ltp} X ${App.Rater_KRW.rate.rates.JPY.toFixed(4)}
BTC: <b>${btc_krw_jpy_rate}%</b>
  `;
  return message;
}

function defaultKeyboard(chatId) {
    bot.sendMessage(chatId, "What can I do for you? Stay a while and listen.", {
        "reply_markup": {
            "keyboard": [
                ["TOP", "CAP","USDT-ETH", "USDT-BTC"],
                ["ETH-BAT", "ETH-SNT", "USDT-BCC"],
                ["코빗","빗썸","코인원","김프"],
              ["바이낸스"],
              ["POLO"],["BITTREX"]]
        }
    });
}

bot.onText(/\/start/, (msg) => {
    defaultKeyboard(msg.chat.id)
});

function getBittrexChange(m) {
    return {
        MarketName: m.MarketName,
        Change: (m.Last / m.PrevDay * 100 - 100).toFixed(2)
    }
}



bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  console.log(msg)
  const {market_summary, market_info} = App.Exchanges.Bittrex;
  switch(msg.text) {
    case 'TOP' :{
      let top = _.take(_.sortBy(_.map(market_summary, getBittrexChange), (a, b) => {
          return parseFloat(a.Change)
      }).reverse(), 10)
      let bottom = _.take(_.sortBy(_.map(market_summary, getBittrexChange), (a, b) => {
          return parseFloat(a.Change)
      }), 10)

      let m = top.map(m => `MarketName: ${m.MarketName} Change: ${m.Change}%`).join('\r\n')
      let b = bottom.map(m => `MarketName: ${m.MarketName} Change: ${m.Change}%`).join('\r\n')
      bot.sendMessage(msg.chat.id, "<b>Bittrex Top 10 Change 🔥</b> \r\n".concat(m) + "\r\n==\r\n".concat(b),{parse_mode:"HTML"})
      break;
    }
    case '바이낸스': {
      const ticker = await App.Exchanges.Binance.getTicker();
      const btc_top_ten =
        _.take(ticker .btc_market.sort((a,b) =>
          parseInt(b.priceChangePercent, 10) - parseInt(a.priceChangePercent, 10))
          , 15)
      // const eth_top_ten = _.take(r.eth_market.sort((a,b) => parseInt(b.priceChangePercent, 10) - parseInt(a.priceChangePercent, 10)), 10)
      const m = btc_top_ten.map(m => `MarketName: ${m.symbol} Change: ${m.priceChangePercent}% Last: ${m.lastPrice} BTC`).join('\r\n')
      bot.sendMessage(msg.chat.id, m);
      break;
    }
    case 'Cancel': {
        defaultKeyboard(msg.chat.id)
        break
    }
    case 'BITTREX': {
        let arr = _.sortBy(market_summary,(market) => parseFloat(market.Last))
        let market_array = _.chunk(_.map(_(arr).reverse().value(),'MarketName'),3)
        // let market_array = _.map(_(arr).reverse().value(),'MarketName').chunk_inefficient(3)
        market_array.push(['Cancel'])
        bot.sendMessage(msg.chat.id, "Which one?", {
            "reply_markup": {
                "keyboard":market_array

        }
      })
      break
    }
    case '/korbit':
    case '/코빗':
    case '코빗': {
      const market_summary = {
        eth:{
          MarketName:'KRW-ETH',
          ...await App.Exchanges.Korbit.getTicker('eth'),
        },
        btc:{
          MarketName:'KRW-BTC',
          ...await App.Exchanges.Korbit.getTicker('btc'),
        },
        bch:{
          MarketName:'KRW-BCH',
          ...await App.Exchanges.Korbit.getTicker('bch'),
        },
        xrp:{
          MarketName:'KRW-XRP',
          ...await App.Exchanges.Korbit.getTicker('xrp'),
        },
        etc:{
          MarketName:'KRW-ETC',
          ...await App.Exchanges.Korbit.getTicker('etc'),
        }
      };
      const strArr = _.map(market_summary, market => {
        return "Korbit " + market.MarketName + ": ￦" + numberWithCommas(market.last || 0)
      })
      bot.sendMessage(chatId, strArr.join("\r\n"))
      break
    }
    case 'COINONE':
    case '코인원': {
      const ticker = await App.Exchanges.CoinOne.getTicker();
      if(ticker !== undefined) {
        let keys = Object.keys(ticker)//
        keys = new Set(keys)
        keys.delete('result')
        keys.delete('errorCode')
        keys.delete('timestamp')
        keys = Array.from(keys)
        const strArr = _.map(keys, (key) => "CoinOne KRW-"+ key.toUpperCase() + ": ￦" + numberWithCommas(parseInt(ticker[key].last,10)))
        bot.sendMessage(chatId, strArr.join("\r\n"))
      } else {
        bot.sendMessage(chatId, "CoinOne - Something Wrong!");
      }
      break;
    }
    case 'POLO':{
      const result = await App.Exchanges.Poloniex.getTicker();
      if(result !== undefined) {
        const usdtTickerKey = _.filter(Object.keys(result.ticker), (t) =>  t.match(/^USDT_[a-z0-9A-Z]{3,6}$/))
        const usdtTickers = _.sortBy(_.map(usdtTickerKey, (key) => {return {'name':key, 'ticker': result.ticker[key]}}), (m) => parseFloat(m.ticker.last,3)).reverse()
        const strArr = _.map(usdtTickers, (m) => `Poloniex ${m.name}: $${parseFloat(m.ticker.last,10).toFixed(3)} Change: ${(parseFloat(m.ticker.percentChange,10) * 100).toFixed(4)}%`)
        bot.sendMessage(chatId, strArr.join("\r\n"))
      } else {
        bot.sendMessage(chatId, "Poloniex - Something Wrong!");
      }

      break
    }
    case '빗썸': {
      const bithumb_ticker = await App.Exchanges.Bithumb.getTicker();
      if(bithumb_ticker !== undefined) {
        const keys = Object.keys(_.omit(bithumb_ticker, 'date'))// date??
        const strArr = _.map(keys, (key) => "Bithumb KRW-"+ key + ": ￦" + numberWithCommas(parseInt(bithumb_ticker[key].closing_price,10)))
        bot.sendMessage(chatId, strArr.join("\r\n"))
      } else {
        bot.sendMessage(chatId, "Bithumb - Something Wrong!");
      }
      break;
    }
    case '김프': {
        bot.sendMessage(chatId, await calcKoreanPremium(), {parse_mode : "HTML"})
        break
    }
    case 'CAP':{
      const cap_data = await App.Exchanges.CoinMarketCap.getTotalCap();
      const top_market = await App.Exchanges.CoinMarketCap.getTopCoins();

      const marketCap = numberWithCommas(cap_data.total_market_cap_usd);
      const bitPercentage = cap_data.bitcoin_percentage_of_market_cap;

      const m = "Total Market Cap Usd: $" + marketCap + "\r\n" +
          "BTC Dominance: " + bitPercentage + "%"
      const top_m = top_market.map(market =>
      `Rank: ${market.rank} ${market.symbol} ${market.name} MarketCap: $${numberWithCommas(parseInt(market.market_cap_usd, 10))}`
      ).join('\r\n');
      const top_ten_sum = top_market.map(m => parseInt(m.market_cap_usd, 10)).reduce((a, b) => a + b, 0);
      bot.sendMessage(chatId, m)
      bot.sendMessage(chatId, top_m + '\r\n' + `Top 10 MarketCap: $${numberWithCommas(top_ten_sum)}`)
      break;
    }
    default :{
      const selected_market = _.find(market_info,{'MarketName':msg.text.replace('/','').toUpperCase()})
      if(selected_market === undefined){
          break
      }
      const selected_market_summary = _.find(market_summary, {'MarketName':msg.text.replace('/','').toUpperCase()})
      const returnMsg = bittrextStringParse(selected_market_summary)
      bot.sendMessage(chatId, returnMsg,{parse_mode : "HTML"})
      defaultKeyboard(msg.chat.id)
      break
    }
  }
});

module.exports.bittrexMarketParse = bittrextStringParse
module.exports.calcKoreanPremium = calcKoreanPremium
