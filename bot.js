
const commonUtil = require('./util/common.js')
const _ = require('lodash')

const TelegramBot = require('node-telegram-bot-api');
const appConfig = require('./config/config.json')

const exchanges = require('./exchange')

if(!process.env.TELEGRAM_BOT_TOKEN ){
    throw "Telegram bot token missing"
}

const token = process.env.TELEGRAM_BOT_TOKEN

let webshot = require('webshot');
let options = {
    windowSize:{
      width:1150,
      height:800
    },
    shotOffset:{
        top:370,
        left:30
    },
    screenSize: {
        width: 1150
        , height: 800
    }
    , shotSize: {
        width: 1150
        , height: 800
    },
    // phantomPath:'/opt/phantomjs/bin/phantomjs',
    userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
    + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g'
};
webshot('coinmarketcap.com', 'cap.png',options, function(err) {
})
let webshot_access = false

const bot = new TelegramBot(token, {polling: true})


const PriceChecker = function(telegram_bot) {
    if(!(this instanceof PriceChecker)) return new PriceChecker(telegram_bot)
    this.telegram_bot = telegram_bot
}

const Market = function(standard, name){
    if(!(this instanceof Market)) return new Market(standard, name)
    this.standard = standard
    this.name = name
}


const bittrex = new exchanges.Bittrex()
bittrex.run(5000)

const korbit = new exchanges.Korbit()
korbit.run(10000)

const coinMarketCap = new exchanges.CoinMarketCap()
coinMarketCap.run(5000)

const poloniex = new exchanges.Poloniex()
poloniex.run(5000)

const yahoo = new exchanges.Yahoo()
yahoo.run(10000)

const bithumb = new exchanges.Bithumb()
bithumb.run(5000)

const coinone = new exchanges.Coinone()
coinone.run(5000)

const Predicate = function(type, comparator ,value, market, coin){
    if(!(this instanceof Predicate)) return new Alarm(type, comparator, value, market, coin)

    this.type = type
    this.comparator = comparator
    this.value = value

    this.market = market
    this.coin = coin

    this.getMarketTitle = function(){
        return this.market + "-" + this.coin
    }
    this.getString = function(){
        if(this.type === "KrwPremium"){
            return `Type: ${this.type} \r\n Compare: ${this.comparator} \r\n Value: ${this.value}`
        } else {
            return `Type: ${this.type} \r\n Market: ${this.market}-${this.coin} \r\n Compare: ${this.comparator} \r\n Value: ${this.value}`
        }
    }
    this.check = function(){
        if(this.type === "KrwPremium"){
            calcKoreanPremium()
            let lastEthRate = last_koreanPremium.eth
            if(this.comparator === "Greater"){
                if(this.value < lastEthRate)
                    return true
            }
            else if (this.comparator === "Less"){
                if(lastEthRate < this.value){
                    return true
                }
            }
            else if (this.comparator === "Equal"){
                if(lastEthRate === this.value){
                    return true
                }
            } else return false

        } else if(this.type === "Market"){
            let m = bittrex.getMarketSummary().filter((m) => m.MarketName === this.market + '-' + this.coin)[0]
            if(this.comparator.toUpperCase() === "GREATER"){
                if(parseFloat(m.Last,10) >= this.value ){
                    return true
                }
            } else{
                if(parseFloat(m.Last,10) < this.value ){
                    return true
                }
            }

        }
        return false
    }
}

const Alarm = function(owner, chatId, predicate, freq){
    if(!(this instanceof Alarm)) return new Alarm(owner, chatId, predicate, freq)
    this.owner = owner;
    this.chatId = chatId;
    this.predicate = predicate
    this.freq = freq

    this.pop = function(){
        if(this.predicate.type === "KrwPremium"){
            bot.sendMessage(this.chatId, "<b>ALARM KOREAN PREMIUM!!! by " +this.owner + "</b>\r\n" +
                "🔥🔥🔥🔥🔥🔥🔥\r\n" + calcKoreanPremium() + "\r\n" +
                "🔥🔥🔥🔥🔥🔥🔥", {parse_mode : "HTML"})

        } else if (this.predicate.type === "Market"){

            let mName = this.predicate.getMarketTitle()
            let m = bittrextStringParse(_.find(bittrex.getMarketSummary(), {'MarketName':mName}))
            bot.sendMessage(this.chatId,`<b>Price Alert by ${this.owner} ${this.predicate.getString()}</b>\r\n`.concat(m), {parse_mode : "HTML"})
        }
    }
    this.getString = function(){
        return `Owner: ${this.owner} \r\n`.concat(this.predicate.getString())
    }
}
let current_alarm_processing;
let current_alarm_type;
let current_alarm_comparator;
let current_alarm_value;
let current_alarm_freq;

let alarms =[]

setInterval(() => {
    _.each(alarms, (alarm,idx) => {
        if(alarm.predicate.check()){
            alarm.pop()
            alarms.splice(idx,1)
            console.log('Alarm Pop!')
            console.log(alarm.getString())
        }
    })
}, 10000)



bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

// send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

bot.onText(/\add (.+)/,(msg, match) => {
    console.log(msg)
    let order = match[1].split('-')
    if(order.length < 4){
        return
    }

    console.log(order)
    let markets = new Set(bittrex.getMarkets().map((m) => m.MarketName).map(m => m.match(/[A-Z]*[^-;]/).toString()))

    if(!markets.has(order[0].toString().toUpperCase())){
        console.log('no market')
        bot.sendMessage(msg.chat.id, "No Market \r\n" + "Bittrex Market: " + new Array(...markets).join(' '))
        return
    }
    let market = order[0].toUpperCase()
    let summary = bittrex.getMarketSummary().filter((m) => m.MarketName === market.toUpperCase() + '-' + order[1].toString().toUpperCase())

    console.log(market + '-' + order[1].toString().toUpperCase())
    if(summary.length < 1){
        console.log('no market')
        bot.sendMessage(msg.chat.id, "Unknown Coin \r\n")
        return
    }

    let type = order[2].toString().toUpperCase()
    console.log(type)
    if (!(type === "GREATER" || type === "LESS")) {
        console.log('unknown compare')
        bot.sendMessage(msg.chat.id, "Unknown Compare \r\n")
        return
    }

    let v = parseFloat(order[3],10)
    if(isNaN(v)){
        console.log('unknown value')
        bot.sendMessage(msg.chat.id, "Unknown Value. Must be float value. \r\n")
        return
    }


    let predicate = new Predicate("Market", type, v, market, order[1].toString().toUpperCase() )
    let alarm = new Alarm(msg.from.first_name + msg.from.last_name, msg.chat.id, predicate, 1)

    alarms.push(alarm)
    bot.sendMessage(msg.chat.id, 'Alarm Saved! Total Alarm Count:' + alarms.length)

})

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
            let cny_rate = yahoo.getRate()['CNY_USD'].last
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
    let usd_krw_rate = yahoo.getRate()["USD_KRW"].last

    let bittrex_market_summary = bittrex.getMarketSummary()
    let bithumb_ticker = bithumb.getTicker()

    let usdDash = parseFloat(_.find(bittrex_market_summary, {'MarketName':'USDT-DASH'}).Last)
    let krwDash = parseFloat(bithumb_ticker.DASH.last)

    let usdBtc = parseFloat(_.find(bittrex_market_summary, {'MarketName':'USDT-BTC'}).Last)
    let usdEth = parseFloat(_.find(bittrex_market_summary, {'MarketName':'USDT-ETH'}).Last)
    let krwEth = parseFloat(bithumb_ticker.ETH.last)
    let krwBtc = parseFloat(bithumb_ticker.BTC.last)

    let usdKrwDash = usdDash * usd_krw_rate
    let usdKrwEth = usdEth * usd_krw_rate
    let usdKrwBtc = usdBtc * usd_krw_rate

    let dashRate = commonUtil.getChange(krwDash, usdKrwDash, 2)
    let ethRate = commonUtil.getChange(krwEth ,usdKrwEth ,2)
    let btcRate = commonUtil.getChange(krwBtc , usdKrwBtc,2)


    const getIcon = function(rate){
        if(rate > 0.0){
            return rate + "% 👍"
        }
        else if( rate < 0.0){
            return rate + "% 👎"
        } else return rate +"%"
    }
    last_koreanPremium.eth = ethRate
    last_koreanPremium.btc = btcRate
    last_koreanPremium.dash = dashRate

    let m = "KRW USD 환율: 1$ = "+ usd_krw_rate + "원\r\n" +
        "🇰🇷😈  Bittrex:Bithumb\r\n" +
        "DASH:<b>" + getIcon(dashRate)+ "</b>\r\n" +

        "ETH :<b>\r\n" +
        "     USD : $"+ usdEth +"(₩"+ commonUtil.numberWithCommas((usdEth * usd_krw_rate).toFixed(4)) +")\r\n" +
        "     KRW : ₩"+ commonUtil.numberWithCommas(krwEth) +"\r\n" +
        "     DIFF :" + getIcon(ethRate) + "</b>\r\n" +

        "BTC :<b>" + getIcon(btcRate) +"</b>"
    return m;
}

function defaultKeyboard(chatId) {
    bot.sendMessage(chatId, "What can I do for you? Stay a while and listen.", {
        "reply_markup": {
            "keyboard": [
                ["TOP", "CAP","USDT-ETH", "USDT-BTC"],
                ["ETH-BAT", "ETH-SNT","ETH-OMG"],
                ["코빗","빗썸","코인원","김프"],["POLO"],["BITTREX"],["ALARM"]]
        }
    });
}

bot.onText(/\/start/, (msg) => {
    defaultKeyboard(msg.chat.id)
});

bot.onText(/\ALARM/,(msg) => {
    bot.sendMessage(msg.chat.id, "What do you want?", {
        "reply_markup": {
            "keyboard": [
                ["AlarmList"],
                ["AddAlarm"],
                ["Cancel"]]
        }
    });
})
function getChange(m) {
    return {
        MarketName: m.MarketName,
        Change: (m.Last / m.PrevDay * 100 - 100).toFixed(2)
    }
}



bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(msg)

    if(appConfig.krw_premium_preset.find(x => x===parseFloat(msg.text)) !== undefined){
        current_alarm_value = parseFloat(msg.text).toFixed(1)

        bot.sendMessage(msg.chat.id, "Type:" +current_alarm_type +"\r\n Comparator:" + current_alarm_comparator+
            "\r\n Value:"+ current_alarm_value + "\r\n Is that Okay?" , {
            "reply_markup": {
                "keyboard": [
                    ["SaveAlarm"],
                    ["BackToAlarm", "Cancel"]]
            }
        })
        return
    }

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
            bot.sendMessage(msg.chat.id, "Whice one?", {
                "reply_markup": {
                    "keyboard":market_array

                }
            })
            break
        }
        case 'Equal':
        case 'Greater':
        case 'Less': {
            current_alarm_comparator = msg.text
            bot.sendMessage(msg.chat.id, "Select % Value", {
                "reply_markup": {
                    "keyboard": [
                        ["15.0","10.0", "5.0", "2.0", "1.0"],
                        ["-15.0", "-10.0", "-5.0", "-2.0", "-1.0"],
                        ["0.0"],
                        ["BackToAlarm", "Cancel"]]
                }
            })
            break
        }
        case 'SaveAlarm':{
            let predicate = new Predicate(current_alarm_type, current_alarm_comparator, current_alarm_value)
            let alarm = new Alarm(msg.from.first_name + msg.from.last_name, chatId, predicate, 1)

            alarms.push(alarm)
            bot.sendMessage(chatId, 'Alarm Saved! Total Alarm Count:' + alarms.length)

            defaultKeyboard(msg.chat.id)
            break
        }
        case 'KrwPremium': {
            current_alarm_type = "KrwPremium"
            bot.sendMessage(msg.chat.id, "Select Comparator", {
                "reply_markup": {
                    "keyboard": [
                        ["Equal","Greater", "Less"],
                        ["BackToAlarm", "Cancel"]]
                }
            })
            break
        }
        case 'AlarmList': {
            let m = alarms.length > 0 ? alarms.map((a) => a.getString()).join('\r\n\r\n') : 'Alarm List Empty'

            bot.sendMessage(chatId, m)
            break
        }
        case 'AddAlarm': {
            bot.sendMessage(msg.chat.id, "Which Type?", {
                "reply_markup": {
                    "keyboard": [
                        ["KrwPremium"],
                        ["BackToAlarm","Cancel"]]
                }
            })
            break
        }
        case 'BackToAlarm': {
            bot.sendMessage(msg.chat.id, "What do you want?", {
                "reply_markup": {
                    "keyboard": [
                        ["AlarmList"],
                        ["AddAlarm"],
                        ["Cancel"]]
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
        case '/shot' :{
            if(!webshot_access){
                webshot_access = true
                webshot('coinmarketcap.com', 'cap.png',options, function(err) {
                    bot.sendPhoto(chatId,'cap.png');
                    webshot_access = false
                })
            }
            break
        }
        case '빗썸': {
            let bithumb_ticker = bithumb.getTicker()
            let keys = Object.keys(_.omit(bithumb_ticker,'date'))// date??
            let strArr = _.map(keys, (key) => "Bithumb KRW-"+ key + ": ￦" + commonUtil.numberWithCommas(parseInt(bithumb_ticker[key].last,10)))
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