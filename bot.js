import Rate from "./lib/rate";
import _ from 'lodash';
import commonUtil from './util/common.js'
import TelegramBot from 'node-telegram-bot-api';
import exchanges from './exchange';
import BitFlyer from './exchange/bitflyer';


if(!process.env.TELEGRAM_BOT_TOKEN ){
  throw "Telegram bot token missing"
}
//
const token = process.env.TELEGRAM_BOT_TOKEN



const App = {};

App.Rater_KRW = new Rate('KRW');
App.Rater_CNY = new Rate('CNY');
App.Rater_KRW_TIMER = setInterval(() => App.Rater_KRW.getRate(), 5000);
App.Rater_CNY_TIMER = setInterval(() => App.Rater_CNY.getRate(), 5000);
App.Rater_KRW.getRate();
App.Rater_CNY.getRate();
App.Exchanges = {}
App.Exchanges.BitFlyer = new BitFlyer();
App.Exchanges.BitFlyer_TIMER = setInterval(() => App.Exchanges.BitFlyer.getTicker(), 5000);
App.Exchanges.BitFlyer.getTicker();
//


const bot = new TelegramBot(token, {polling: true})


const bittrex = new exchanges.Bittrex()
bittrex.run(5000)

const korbit = new exchanges.Korbit()
korbit.run(10000)

const coinMarketCap = new exchanges.CoinMarketCap()
coinMarketCap.run(5000)

const poloniex = new exchanges.Poloniex()
poloniex.run(5000)

const bithumb = new exchanges.Bithumb()
bithumb.run(5000)

const coinone = new exchanges.Coinone()
coinone.run(5000)

const liqui = new exchanges.Liqui()
liqui.run(5000)


bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

// send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

function getHowManyEmoji(e, v){
    if(Math.abs(v) >= 0 && 9.999 > Math.abs(v) ){
        return e
    }
    else if(Math.abs(v) >= 10 && 19.999 > Math.abs(v)){
        return e + e
    }
    else if(Math.abs(v) > 20.0)
        return e + e + "🔥"
    else
        return "UNKNOWN"
}

function bittrextStringParse(tickerData){
    if(tickerData !== undefined){
        let marketTitle = tickerData.MarketName

        let change = commonUtil.getChange(tickerData.Last, tickerData.PrevDay, 2)

        let key = commonUtil.getKeySymbol(marketTitle,"-")

        let usdt_btc_market = _.find(bittrex.getMarketSummary(),{'MarketName':'USDT-BTC'})
        let usdt_eth_market = _.find(bittrex.getMarketSummary(),{'MarketName':'USDT-ETH'})

        let lastUSD;
        let prevUSD;
        let usdChange;

        if(key==="BTC"){
            lastUSD = " $" + (parseFloat(tickerData.Last) * usdt_btc_market.Last).toFixed(4)
            prevUSD = " $" + (parseFloat(tickerData.PrevDay)* usdt_btc_market.PrevDay).toFixed(4)

            usdChange = commonUtil.getChange(tickerData.Last * usdt_btc_market.Last, tickerData.PrevDay * usdt_btc_market.PrevDay, 2)
        }
        else if(key==="ETH"){
            lastUSD = " $" + (parseFloat(tickerData.Last) * usdt_eth_market.Last).toFixed(4)
            prevUSD = " $" + (parseFloat(tickerData.PrevDay) * usdt_eth_market.PrevDay).toFixed(4)
            usdChange = commonUtil.getChange(parseFloat(tickerData.Last) * usdt_eth_market.Last,parseFloat(tickerData.PrevDay)* usdt_eth_market.PrevDay ,2)
        }
        else if(key==="USDT"){
            lastUSD =" $" + parseFloat(tickerData.Last).toFixed(4)
            prevUSD =" $" + parseFloat(tickerData.PrevDay).toFixed(4)
            usdChange = commonUtil.getChange(tickerData.Last, tickerData.PrevDay,2)

        }
        else if (key ==="BITCNY"){
            let cny_rate = App.Rater_CNY.rate.rates.USD
            // console.log(tickerData.Last * cny_rate)
            lastUSD = " $" + parseFloat(tickerData.Last * cny_rate).toFixed(4)
            prevUSD = " $" + parseFloat(tickerData.PrevDay * cny_rate).toFixed(4)
            usdChange = "???"
        }



        let changeText;
        if( change < 0.0 ){
            changeText = "Change: <b>" +change+ "%</b>"+getHowManyEmoji("😭", change)+"\r\n"
        }else{
            changeText = "Change: <b>" +change+ "%</b>" +getHowManyEmoji("🤑", change)+"\r\n"
        }

        let usdChangeText;
        if(usdChange < 0.0){
            usdChangeText = "USD Change: <b>" +usdChange+ "%</b>" +getHowManyEmoji("😭", usdChange) +"\r\n"
        }else{
            usdChangeText = "USD Change: <b>" +usdChange+ "%</b>"+getHowManyEmoji("🤑", usdChange)+"\r\n"
        }



        let msg = "" +
            "최근 BTC: 💲<b>" + commonUtil.numberWithCommas(usdt_btc_market.Last.toFixed(2)) + "</b>\r\n" +
            "어제 BTC: 💲<b>" + commonUtil.numberWithCommas(usdt_btc_market.PrevDay.toFixed(2)) + "</b>\r\n" +
            "BTC USD Change: " + commonUtil.getChange(usdt_btc_market.Last, usdt_btc_market.PrevDay, 2) + "%\r\n" +
            "\r\n" +
            "최근 ETH: 💲<b>" + commonUtil.numberWithCommas(usdt_eth_market.Last.toFixed(2)) + "</b>\r\n" +
            "어제 ETH: 💲<b>" + commonUtil.numberWithCommas(usdt_eth_market.PrevDay.toFixed(2)) + "</b>\r\n" +
            "ETH USD Change: " + commonUtil.getChange(usdt_eth_market.Last, usdt_eth_market.PrevDay, 2) + "%\r\n"+

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

let last_koreanPremium = {
    dash:{
    },
    eth:{
    },
    btc:{

    }
}
function calcKoreanPremium(){
  if(App.Rater_KRW.rate.rates.USD === undefined || App.Rater_KRW.rate.rates.USD === null){
    return;
  }
  const usd_krw_rate = App.Rater_KRW.rate.rates.USD
  const krw_jpy_rate = App.Rater_KRW.rate.rates.JPY

  const bittrex_market_summary = bittrex.getMarketSummary()
  const bithumb_ticker = bithumb.getTicker()


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


  console.log(App.Exchanges.BitFlyer.ticker.ltp);

  let dashRate = commonUtil.getChange(krwDash, usdKrwDash, 2)
  let ethRate = commonUtil.getChange(krwEth ,usdKrwEth ,2)
  let btcRate = commonUtil.getChange(krwBtc , usdKrwBtc,2)

  let btc_krw_jpy_rate = commonUtil.getChange(krwBtc , krw_jpy_btc,2);

  const getIcon = function(rate){
      if(rate > 0.0){
          return rate + "%"
      }
      else if( rate < 0.0){
          return rate + "%"
      } else return rate +"%"
  }
  last_koreanPremium.eth = ethRate
  last_koreanPremium.btc = btcRate
  last_koreanPremium.dash = dashRate


  const message = `
  환율 조회: https://api.fixer.io/
날짜: ${App.Rater_KRW.rate.date}
KRW USD 환율: 1$ = ${usd_krw_rate.toFixed(4)}원
KRW JPY 환율: 1￥ = ${App.Rater_KRW.rate.rates.JPY.toFixed(4)}원
대상: Bittrex : Bithumb
BTC:<b>${getIcon(btcRate)}</b>
ETH:<b>${getIcon(ethRate)} </b>
ETH-USD(Bittrex):<b>$ ${usdEth}(₩ ${commonUtil.numberWithCommas((usdEth * usd_krw_rate).toFixed(0))})</b>
ETH-KRW(Bithumb):<b>₩ ${commonUtil.numberWithCommas(krwEth)}</b>
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
                ["ETH-BAT", "ETH-SNT","ETH-OMG", "ETH-KNC"],
                ["코빗","빗썸","코인원","김프"],["POLO"],["BITTREX"]]
        }
    });
}

bot.onText(/\/start/, (msg) => {
    defaultKeyboard(msg.chat.id)
});

function getChange(m) {
    return {
        MarketName: m.MarketName,
        Change: (m.Last / m.PrevDay * 100 - 100).toFixed(2)
    }
}



bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(msg)

    switch(msg.text) {
        case 'TOP' :{
            let top = _.take(_.sortBy(_.map(bittrex.getMarketSummary(), getChange), (a, b) => {
                return parseFloat(a.Change)
            }).reverse(), 10)
            let bottom = _.take(_.sortBy(_.map(bittrex.getMarketSummary(), getChange), (a, b) => {
                return parseFloat(a.Change)
            }), 10)

            let m = top.map(m => `MarketName: ${m.MarketName} Change: ${m.Change}%`).join('\r\n')
            let b = bottom.map(m => `MarketName: ${m.MarketName} Change: ${m.Change}%`).join('\r\n')
            bot.sendMessage(msg.chat.id, "<b>Bittrex Top 10 Change 🔥</b> \r\n".concat(m) + "\r\n==\r\n".concat(b),{parse_mode:"HTML"})
            break;
        }
        case 'Cancel': {
            defaultKeyboard(msg.chat.id)
            break
        }
        case 'BITTREX': {
            let arr = _.sortBy(bittrex.getMarketSummary(),(market) => parseFloat(market.Last))
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
            let market_summary = korbit.getMarketSummary()
            let strArr = _.map(market_summary, market => {
              return "Korbit " + market.MarketName + ": ￦" + commonUtil.numberWithCommas(market.last || 0)
            })

            bot.sendMessage(chatId, strArr.join("\r\n"))
            break
        }
        case 'COINONE':
        case '코인원': {

            let ticker = coinone.getTicker()
            let keys = Object.keys(ticker)// date??
            keys = new Set(keys)
            keys.delete('result')
            keys.delete('errorCode')
            keys.delete('timestamp')
            keys = Array.from(keys)

            let strArr = _.map(keys, (key) => "CoinOne KRW-"+ key.toUpperCase() + ": ￦" + commonUtil.numberWithCommas(parseInt(ticker[key].last,10)))
            bot.sendMessage(chatId, strArr.join("\r\n"))

            break
        }
        case 'POLO':{
            let ticker = poloniex.getTicker()
            let usdtTickerKey = _.filter(Object.keys(ticker), (t) =>  t.match(/^USDT_[a-z0-9A-Z]{3,6}$/))
            let usdtTickers = _.sortBy(_.map(usdtTickerKey, (key) => {return {'name':key, 'ticker': ticker[key]}}), (m) => parseFloat(m.ticker.last,3)).reverse()
            let strArr = _.map(usdtTickers, (m) => `Poloniex ${m.name}: $${parseFloat(m.ticker.last,10).toFixed(3)} Change: ${(parseFloat(m.ticker.percentChange,10) * 100).toFixed(4)}%`)
            bot.sendMessage(chatId, strArr.join("\r\n"))
            break
        }
        case '빗썸': {
            let bithumb_ticker = bithumb.getTicker()
            let keys = Object.keys(_.omit(bithumb_ticker,'date'))// date??
            let strArr = _.map(keys, (key) => "Bithumb KRW-"+ key + ": ￦" + commonUtil.numberWithCommas(parseInt(bithumb_ticker[key].closing_price,10)))
            bot.sendMessage(chatId, strArr.join("\r\n"))
            break
        }
        case '김프': {
            bot.sendMessage(chatId, calcKoreanPremium(), {parse_mode : "HTML"})
            break
        }
        case 'CAP':{
            let marketCap = commonUtil.numberWithCommas(coinMarketCap.getSummary().total_market_cap_usd)
            let bitPercentage = coinMarketCap.getSummary().bitcoin_percentage_of_market_cap

            let m = "Total Market Cap Usd: $" + marketCap + "\r\n" +
                "BTC Dominance: " + bitPercentage + "%"

            bot.sendMessage(chatId, m)
            break
        }
        case 'ETH-KNC':{
            let ticker = liqui.getMarketSummary().knc_eth

            let high = `High: ${ticker.high} ETH`
            let low =  `Low:  ${ticker.low} ETH`
            let last = `Last: ${ticker.last} ETH`
            let m = ['Kyber Network Token', high, low, last].join('\r\n')
            bot.sendMessage(chatId, m)
            break
        }
        default :{

            let market = _.find(bittrex.getMarkets(),{'MarketName':msg.text.replace('/','').toUpperCase()})
            if(market === undefined){
                break
            }
            if(market.LogoUrl !== null){
                bot.sendPhoto(chatId,market.LogoUrl);
            }

            let market_summary = _.find(bittrex.getMarketSummary(), {'MarketName':msg.text.replace('/','').toUpperCase()})

            let returnMsg = bittrextStringParse(market_summary)
            bot.sendMessage(chatId, returnMsg,{parse_mode : "HTML"})

            defaultKeyboard(msg.chat.id)
            break
        }
    }
});

module.exports.bittrexMarketParse = bittrextStringParse
module.exports.calcKoreanPremium = calcKoreanPremium
