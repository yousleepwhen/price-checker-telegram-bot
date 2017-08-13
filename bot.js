
const commonUtil = require('./util/common.js')
const _ = require('lodash')
const request = require('request')

const TelegramBot = require('node-telegram-bot-api');
const appConfig = require('./config/config.json')

const Bittrex = require('./exchange/bittrex').Bittrex
const Korbit = require('./exchange/korbit').Korbit
const CoinMarketCap = require('./exchange/coinmarketcap').CoinMarketCap
const Poloniex = require('./exchange/poloniex').Poloniex
const Yahoo = require("./exchange/yahoo").Yahoo


// const coinMarketCap = require('./exchange/coinmarketcap').coinMarketCap
// if(!process.env.TELEGRAM_BOT_TOKEN){
//     throw "Telegram bot token missing"
// }

// const token = process.env.TELEGRAM_API_TOKEN
// const token = '414024453:AAHQg3QrU-_WG77FHUyB9WIuTYKJXl_l10E' //production
const token = '433274725:AAEb_5Mv6r23atBuYG42iib0Ma7011mx4e8' //dev


Object.defineProperty(Array.prototype, 'chunk_inefficient', {
    value: function(chunkSize) {
        var array=this;
        return [].concat.apply([],
            array.map(function(elem,i) {
                return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
            })
        );
    }
});

const PriceChecker = function(telegram_bot) {
    if(!(this instanceof PriceChecker)) return new PriceChecker(telegram_bot)
    this.telegram_bot = telegram_bot
}

const Market = function(standard, name){
    if(!(this instanceof Market)) return new Market(standard, name)
    this.standard = standard
    this.name = name
}

const bittrex = new Bittrex()
bittrex.run(5000)

const korbit = new Korbit()
korbit.run(5000)

const coinMarketCap = new CoinMarketCap()
coinMarketCap.run(5000)

const poloniex = new Poloniex()
poloniex.run(5000)

const yahoo = new Yahoo()
yahoo.run(5000)

const Predicate = function(type, comparator ,value){
    if(!(this instanceof Predicate)) return new Alarm(type, comparator, value)

    this.type = type
    this.comparator = comparator
    this.value = value

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

        }
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

        }
    }
}

let alarms =[]

setInterval(() => {
    _.each(alarms, (alarm,idx) => {
        if(alarm.predicate.check()){
            alarm.pop()
            alarms.splice(idx,1)
        }
    })
}, 10000)


let current_usdt_btc = 0.0;
let current_usdt_eth = 0.0;
let prev_usdt_btc = 0.0;
let prev_usdt_eth = 0.0;

let bithumb_ticker = {

}



let usd = 0;


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});





function bithum_ticker_parse(data){
    return _.each(data, (d) => d.last = d.closing_price)
}

function bithumb_ticker_all(){
    request('https://api.bithumb.com/public/ticker/ALL', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            bithumb_ticker = bithum_ticker_parse(JSON.parse(body).data)
        }
    })
}


bithumb_ticker_all()
setInterval(bithumb_ticker_all, 6000)



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
    if(Math.abs(v) >= 10 && 19.999 > Math.abs(v)){
        return e + e
    }
    if(Math.abs(v > 20))
        return e + e + "🔥"
}

function bittrextStringParse(tickerData){
    if(tickerData !== undefined){
        let marketTitle = tickerData.MarketName

        let change = commonUtil.getChange(tickerData.Last, tickerData.PrevDay, 2)

        let key = commonUtil.getKeySymbol(marketTitle,"-")

        let lastUSD;
        let prevUSD;
        let usdChange;

        if(key==="BTC"){
            lastUSD = " $" + (parseFloat(tickerData.Last) * current_usdt_btc).toFixed(4)
            prevUSD = " $" + (parseFloat(tickerData.PrevDay)* prev_usdt_btc).toFixed(4)

            usdChange = (parseFloat(tickerData.Last) * current_usdt_btc) / (parseFloat(tickerData.PrevDay)* prev_usdt_btc).toFixed(4) * 100 - 100
        }
        if(key==="ETH"){
            lastUSD = " $" + (parseFloat(tickerData.Last) * current_usdt_eth).toFixed(4)
            prevUSD = " $" + (parseFloat(tickerData.PrevDay) * prev_usdt_eth).toFixed(4)
            usdChange = (parseFloat(tickerData.Last) * current_usdt_eth) / (parseFloat(tickerData.PrevDay)* prev_usdt_eth).toFixed(4) * 100 - 100
        }
        if(key==="USDT"){
            lastUSD =" $" + parseFloat(tickerData.Last).toFixed(4)
            prevUSD =" $" + parseFloat(tickerData.PrevDay).toFixed(4)
            usdChange = (parseFloat(tickerData.Last)) / (parseFloat(tickerData.PrevDay)).toFixed(4) * 100 - 100

        }



        let changeText;
        if( change < 0.0 ){
            changeText = "Change: <b>" +change+ "%</b>"+getHowManyEmoji("😭", change)+"\r\n"
        }else{
            changeText = "Change: <b>" +change+ "%</b>" +getHowManyEmoji("🤑", change)+"\r\n"
        }

        let usdChangeText;
        // let usdChange = parseFloat(lastUSD / prevUSD).toFixed(4)
        if(usdChange < 0.0){
            usdChangeText = "USD Change: <b>" +usdChange.toFixed(2)+ "%</b>" +getHowManyEmoji("😭", usdChange.toFixed(2)) +"\r\n"
        }else{
            usdChangeText = "USD Change: <b>" +usdChange.toFixed(2)+ "%</b>"+getHowManyEmoji("🤑", usdChange.toFixed(2))+"\r\n"
        }

        let usdt_btc_market = _.find(bittrex.getMarketSummary(),{'MarketName':'USDT-BTC'})
        let usdt_eth_market = _.find(bittrex.getMarketSummary(),{'MarketName':'USDT-ETH'})


        let msg = "" +
            "최근 BTC: 💲<b>" + commonUtil.numberWithCommas(usdt_btc_market.Last) + "</b>\r\n" +
            "어제 BTC: 💲<b>" + commonUtil.numberWithCommas(usdt_btc_market.PrevDay) + "</b>\r\n" +
            "BTC USD Change: " + commonUtil.getChange(usdt_btc_market.Last, usdt_btc_market.PrevDay, 2) + "%\r\n" +
            "\r\n" +
            "최근 ETH: 💲<b>" + commonUtil.numberWithCommas(usdt_eth_market.Last) + "</b>\r\n" +
            "어제 ETH: 💲<b>" + commonUtil.numberWithCommas(usdt_eth_market.PrevDay) + "</b>\r\n" +
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
    let usd_krw_rate = yahoo.getRate()

    let bittrex_market_summary = bittrex.getMarketSummary()
    let usdDash = parseFloat(_.find(bittrex_market_summary, {'MarketName':'USDT-DASH'}).Last)
    let krwDash = parseFloat(bithumb_ticker.DASH.last)

    let usdBtc = parseFloat(_.find(bittrex_market_summary, {'MarketName':'USDT-BTC'}).Last)
    let usdEth = parseFloat(_.find(bittrex_market_summary, {'MarketName':'USDT-ETH'}).Last)
    let krwEth = parseFloat(bithumb_ticker.ETH.last)
    let krwBtc = parseFloat(bithumb_ticker.BTC.last)

    let usdKrwDash = usdDash * usd_krw_rate
    let usdKrwEth = usdEth * usd_krw_rate
    let usdKrwBtc = usdBtc * usd_krw_rate


    let rate = krwDash / usdKrwDash * 100 - 100
    let rateIcon, ethRateIcon, btcRateIcon;


    let ethRate = krwEth / usdKrwEth * 100 - 100
    let btcRate = krwBtc / usdKrwBtc * 100 - 100

    if(rate > 0.0){
        rateIcon = "👍"
    } else {
        rateIcon = "👎"
    }

    if(ethRate > 0.0){
        ethRateIcon = "👍"
    } else {
        ethRateIcon = "👎"
    }
    if(btcRate > 0.0){
        btcRateIcon = "👍"
    } else {
        btcRateIcon = "👎"
    }
    last_koreanPremium.eth = ethRate
    last_koreanPremium.btc = btcRate
    last_koreanPremium.dash = rate

    let m = "KRW USD 환율: 1$ = "+ usd_krw_rate + "원\r\n" +
        "🇰🇷😈  Bittrex:Bithumb\r\n" +
        "DASH:<b>" + rate.toFixed(4)  + "% </b>" +rateIcon+ "\r\n" +

        "ETH :<b>\r\n" +
        "     USD : $"+ usdEth +"(₩"+ commonUtil.numberWithCommas((usdEth * usd_krw_rate).toFixed(4)) +")\r\n" +
        "     KRW : ₩"+ commonUtil.numberWithCommas(krwEth) +"\r\n" +
        "     DIFF :" + ethRate.toFixed(4) + "% </b>" +ethRateIcon+ "\r\n" +

        "BTC :<b>" + btcRate.toFixed(4) + "% </b>" + btcRateIcon

    return m;
}

function defaultKeyboard(chatId) {
    bot.sendMessage(chatId, "What can I do for you? Stay a while and listen.", {
        "reply_markup": {
            "keyboard": [
                ["CAP","USDT-ETH", "USDT-BTC"],
                ["ETH-BAT", "ETH-SNT","ETH-OMG"],
                ["코빗","빗썸","김프","POLO"],["BITTREX"]]
        }
    });
}

bot.onText(/\/start/, (msg) => {
    defaultKeyboard(msg.chat.id)
});

bot.onText(/\alarm/,(msg) => {
    bot.sendMessage(msg.chat.id, "What do you want?", {
        "reply_markup": {
            "keyboard": [
                ["AlarmList"],
                ["AddAlarm", "RemoveAlarm"],
                ["Cancel"]]
        }
    });
})

let current_alarm_processing;
let current_alarm_type;
let current_alarm_comparator;
let current_alarm_value;
let current_alarm_freq;

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
        case 'Cancel': {
            defaultKeyboard(msg.chat.id)
            return
        }
        case 'BITTREX': {
            let arr = _.sortBy(bittrex.getMarketSummary(),(market) => parseFloat(market.Last))
            let market_array = _.map(_(arr).reverse().value(),'MarketName').chunk_inefficient(3)
            market_array.push(['Cancel'])
            bot.sendMessage(msg.chat.id, "Whice one?", {
                "reply_markup": {
                    "keyboard":market_array

                }
            })
            return
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
            return
        }
        case 'SaveAlarm':{
            let predicate = new Predicate(current_alarm_type, current_alarm_comparator, current_alarm_value)
            let alarm = new Alarm(msg.from.first_name + msg.from.last_name, chatId, predicate, 1)

            alarms.push(alarm)
            bot.sendMessage(chatId, 'Alarm Saved! Total Alarm Count:' + alarms.length)

            defaultKeyboard(msg.chat.id)
            return
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
            return
        }
        case 'AlarmList': {
            bot.sendMessage(chatId,"test")

            _.each(alarms, alarm => console.log(alarm.owner))

            // bot.sendMessage(chatId, alarms[0]['owner'])
            return
        }
        case 'AddAlarm': {
            bot.sendMessage(msg.chat.id, "Which Type?", {
                "reply_markup": {
                    "keyboard": [
                        ["KrwPremium"],
                        ["Market"],
                        ["BackToAlarm","Cancel"]]
                }
            })
            return
        }
        case 'BackToAlarm': {
            bot.sendMessage(msg.chat.id, "What do you want?", {
                "reply_markup": {
                    "keyboard": [
                        ["AlarmList"],
                        ["AddAlarm", "RemoveAlarm"],
                        ["Cancel"]]
                }
            })
            return
        }
        case '/korbit':
        case '/코빗':
        case '코빗': {
            let market_summary = korbit.getMarketSummary()
            console.log(market_summary)
            let m =
                "Korbit KRW-BTC: ￦" + commonUtil.numberWithCommas(market_summary.btc.last) + "\r\n" +
                "Korbit KRW-ETH: ￦" + commonUtil.numberWithCommas(market_summary.eth.last) + "\r\n" +
                "Korbit KRW-ETC: ￦" + commonUtil.numberWithCommas(market_summary.etc.last) + "\r\n" +
                "Korbit KRW-XRP: ￦" + commonUtil.numberWithCommas(market_summary.xrp.last) + "\r\n" +
                "Korbit KRW-BCH: ￦" + commonUtil.numberWithCommas(market_summary.bcc.last) + "\r\n"

            bot.sendMessage(chatId, m)
            return
        }
        case 'COINONE':
        case '코인원': {
            return
        }
        case 'POLO':{
            let ticker = poloniex.getTicker()
            let usdtEth = ticker['USDT_ETH']
            let usdtBtc = ticker['USDT_BTC']

            // console.log(usdtEth.last)
            // console.log(usdtBtc.last)

            let m =
                "Poloniex USDT-BTC: $" + parseFloat(usdtBtc['last']).toFixed(4) + "\r\n" +
                "Poloniex USDT-ETH: $" + parseFloat(usdtEth['last']).toFixed(4) + "\r\n"

            bot.sendMessage(chatId,m)
            return
        }
        case '빗썸': {
            let m =
                "Bithumb KRW-BTC: ￦" + commonUtil.numberWithCommas(bithumb_ticker.BTC.last) + "\r\n" +
                "Bithumb KRW-ETH: ￦" + commonUtil.numberWithCommas(bithumb_ticker.ETH.last) + "\r\n" +
                "Bithumb KRW-ETC: ￦" + commonUtil.numberWithCommas(bithumb_ticker.ETC.last) + "\r\n" +
                "Bithumb KRW-XRP: ￦" + commonUtil.numberWithCommas(bithumb_ticker.XRP.last) + "\r\n" +
                "Bithumb KRW-DASH: ￦" + commonUtil.numberWithCommas(bithumb_ticker.DASH.last) + "\r\n" +
                "Bithumb KRW-BCH: ￦" + commonUtil.numberWithCommas(bithumb_ticker.BCH.last) + "\r\n"

            bot.sendMessage(chatId, m)
            return
        }
        case '김프': {
            bot.sendMessage(chatId, calcKoreanPremium(), {parse_mode : "HTML"})
            return
        }
        case 'CAP':{
            let marketCap = commonUtil.numberWithCommas(coinMarketCap.getSummary().total_market_cap_usd)
            let bitPercentage = coinMarketCap.getSummary().bitcoin_percentage_of_market_cap

            let m = "Total Market Cap Usd: $" + marketCap + "\r\n" +
                "BTC Dominance: " + bitPercentage + "%"

            bot.sendMessage(chatId, m)
            return
        }
        default :{
            if(_.find(bittrex.getMarkets(), {'MarketName':msg.text.replace('/','').toUpperCase()}) === undefined)
                return;

            let photoUrl = _.find(bittrex.getMarkets(), {'MarketName':msg.text.replace('/','').toUpperCase()}).LogoUrl

            if(photoUrl!==null){
                bot.sendPhoto(chatId,photoUrl);
            }


            let returnMsg = bittrextStringParse(_.find(bittrex.getMarketSummary(), {'MarketName':msg.text.replace('/','').toUpperCase()}))
            bot.sendMessage(chatId, returnMsg,{parse_mode : "HTML"})

            defaultKeyboard(msg.chat.id)
            return
        }
    }


});