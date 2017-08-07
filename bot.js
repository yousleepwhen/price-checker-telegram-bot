
const TelegramBot = require('node-telegram-bot-api');

if(!process.env.TELEGRAM_API_TOKEN){
    console.log("Telegram Bot Token Missing")
    process.exit(1)
}

const token = process.env.TELEGRAM_API_TOKEN
// const token = '414024453:AAHQg3QrU-_WG77FHUyB9WIuTYKJXl_l10E'

// '414024453:AAHQg3QrU-_WG77FHUyB9WIuTYKJXl_l10E'



const _ = require('lodash')
const request = require('request')


let App = {

}

let global_market = {

}
let bittrex_ticker = {

}

let korbit_ticker = {
    btc:{
    },
    eth:{
    },
    etc:{
    },
    xrp:{

    },
    bch:{
    }
}
let poloniex_ticker = {
}


let current_usdt_btc = 0.0;
let current_usdt_eth = 0.0;
let prev_usdt_btc = 0.0;
let prev_usdt_eth = 0.0;

let bithumb_ticker = {

}
let bittrex_markets = [];


https://api.coinmarketcap.com/v1/global/


function run_coinmarketcap_global_data() {
    request('https://api.coinmarketcap.com/v1/global/', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(JSON.parse(body))
            global_market = JSON.parse(body)


        }
    })
}



function run_bittrex_ticker() {
    request('https://bittrex.com/api/v1.1/public/getmarketsummaries', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(JSON.parse(body))
            bittrex_ticker = JSON.parse(body).result
            current_usdt_btc = _.find(bittrex_ticker, {'MarketName':'USDT-BTC'}).Last
            current_usdt_eth = _.find(bittrex_ticker, {'MarketName':'USDT-ETH'}).Last
            // console.log(bittrex_ticker.result) // Print the google web page.
            prev_usdt_btc = _.find(bittrex_ticker, {'MarketName':'USDT-BTC'}).PrevDay
            prev_usdt_eth = _.find(bittrex_ticker, {'MarketName':'USDT-ETH'}).PrevDay

        }
    })
}

function run_bittrex_markets() {
    request('https://bittrex.com/api/v1.1/public/getmarkets', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(JSON.parse(body))
            bittrex_markets = JSON.parse(body).result
        }
    })
}

run_bittrex_markets()
run_bittrex_ticker()
setInterval(run_bittrex_ticker, 5000)
setInterval(run_bittrex_markets, 60000)



function run_poloniex_ticker() {
    request('https://poloniex.com/public?command=returnTicker', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let data = JSON.parse(body)
            poloniex_ticker = data
            // console.log(poloniex_ticker)

        }
    })
}

run_poloniex_ticker()
setInterval(run_poloniex_ticker, 5000)


run_coinmarketcap_global_data()
setInterval(run_coinmarketcap_global_data, 10000)

let usd = 0;

function getKWRUSDRate(){
    request('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%3D%22USDKRW%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
        function(err, response, body){
            if (!err && response.statusCode == 200) {
                // console.log(JSON.parse(body))
                let data = JSON.parse(body)
                // console.log(bittrex_ticker.result) // Print the google web page.
                usd = parseFloat(data['query']['results']['rate']['Rate']);
                console.log(usd);
            }
        })
}

getKWRUSDRate()
setInterval(getKWRUSDRate, 5000)



// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});


function korbit_ticker_xrp() {
    request('https://api.korbit.co.kr/v1/ticker?currency_pair=xrp_krw', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            korbit_ticker.xrp = JSON.parse(body)
        }
    })
}


function korbit_ticker_btc() {
    request('https://api.korbit.co.kr/v1/ticker?currency_pair=btc_krw', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            korbit_ticker.btc = JSON.parse(body)
        }
    })
}

function korbit_ticker_eth() {
    request('https://api.korbit.co.kr/v1/ticker?currency_pair=eth_krw', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            korbit_ticker.eth = JSON.parse(body)

        }
    })
}

function korbit_ticker_etc() {
    request('https://api.korbit.co.kr/v1/ticker?currency_pair=etc_krw', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            korbit_ticker.etc = JSON.parse(body)

        }
    })
}

function korbit_ticker_bch() {
    request('https://api.korbit.co.kr/v1/ticker?currency_pair=bcc_krw', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body) // Print the google web page.
            korbit_ticker.bch = JSON.parse(body)

        }
    })
}

function run_korbit_ticker(){
    korbit_ticker_btc()
    korbit_ticker_etc()
    korbit_ticker_eth()
    korbit_ticker_xrp()
    korbit_ticker_bch()
}

run_korbit_ticker()
setInterval(run_korbit_ticker, 10000)



function bithum_ticker_parse(data){

    return _.each(data, (d) => d.last = d.closing_price)
    // Object.keys(data).forEach(function (key) {
    //     data[key].last = data[key].closing_price;
    //     delete data[key].closing_price;
    // });
    // console.log(data);
    // return data
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

// Listen for any kind of message. There are different kinds of
// messages.
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getKeySymbol(marketName){
    let keys = marketName.split("-")
    return keys[0]
}

function bittrextStringParse(tickerData){
    // console.log(tickerData)
    if(tickerData !== undefined){
        let marketTitle = tickerData.MarketName

        let change = parseFloat((tickerData.Last / tickerData.PrevDay * 100.0) - 100.0).toFixed(4)

        let key = getKeySymbol(marketTitle)

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
            changeText = "Change: <b>" +change+ "%</b>😭😭😭\r\n"
        }else{
            changeText = "Change: <b>" +change+ "%</b>🤑🤑🤑\r\n"
        }

        let usdChangeText;
        // let usdChange = parseFloat(lastUSD / prevUSD).toFixed(4)
        if(usdChange < 0.0){
            usdChangeText = "USD Change: <b>" +usdChange.toFixed(4)+ "%</b>😭😭😭\r\n"
        }else{
            usdChangeText = "USD Change: <b>" +usdChange.toFixed(4)+ "%</b>🤑🤑🤑\r\n"
        }


        let msg = "" +
            "Last BTC: 💰<b>" + numberWithCommas(current_usdt_btc) + "</b>\r\n" +
            "Prev BTC: 💰<b>" + numberWithCommas(prev_usdt_btc) + "</b>\r\n" +
            "BTC USD Change: " + (current_usdt_btc / prev_usdt_btc * 100 - 100).toFixed(4) + "%\r\n" +
            "\r\n" +
            "Last ETH: 💰<b>" + numberWithCommas(current_usdt_eth) + "</b>\r\n" +
            "Prev ETH: 💰<b>" + numberWithCommas(prev_usdt_eth) + "</b>\r\n" +
            "ETH USD Change: " + (current_usdt_eth / prev_usdt_eth * 100 - 100).toFixed(4) + "%\r\n"+

            "=============\r\n" +
            "Market: <b>" +tickerData.MarketName + "</b>\r\n" +
            "Last: <b>" + parseFloat(tickerData.Last).toFixed(8) + ` ${key}` + lastUSD +"</b>\r\n" +
            "Prev: <b>" + parseFloat(tickerData.PrevDay).toFixed(8) +` ${key}`+ prevUSD +"</b>\r\n" +
            changeText  +"" +
            usdChangeText + "" +
            "Volume: " + tickerData.Volume + "\r\n" +
            "=============\r\n"

        return msg
    } else {
        return "Can not find Market"
    }

}

function calcKoreanPremium(){
    let usdDash = parseFloat(_.find(bittrex_ticker, {'MarketName':'USDT-DASH'}).Last)
    let krwDash = parseFloat(bithumb_ticker.DASH.last)

    let usdBtc = parseFloat(_.find(bittrex_ticker, {'MarketName':'USDT-BTC'}).Last)
    let usdEth = parseFloat(_.find(bittrex_ticker, {'MarketName':'USDT-ETH'}).Last)
    let krwEth = parseFloat(bithumb_ticker.ETH.last)
    let krwBtc = parseFloat(bithumb_ticker.BTC.last)

    let usdKrwDash = usdDash * usd
    let usdKrwEth = usdEth * usd
    let usdKrwBtc = usdBtc * usd


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
    let m = "🇰🇷😈  Bittrex:Bithumb\r\n" +
        "DASH :<b>" + rate.toFixed(4)  + "% </b>" +rateIcon+ "\r\n" +
        "ETH  :<b>" + ethRate.toFixed(4) + "% </b>" +ethRateIcon+ "\r\n" +
        "BTC  :<b>" + btcRate.toFixed(4) + "% </b>" + btcRateIcon

    return m;
}

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(msg.chat.id, "What can I do for you? Stay a while and listen.", {
        "reply_markup": {
            "keyboard": [
                ["CAP","USDT-ETH", "USDT-BTC"],
                ["ETH-BAT", "ETH-SNT","ETH-OMG"],
                ["코빗","빗썸","김프","POLO"]]
        }
    });

});


bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(msg)

    if(msg.text==='/korbit' || msg.text==='/코빗' || msg.text==='코빗'){
        let m =
            "Korbit KRW-BTC: ￦" + numberWithCommas(korbit_ticker.btc.last) + "\r\n" +
            "Korbit KRW-ETH: ￦" + numberWithCommas(korbit_ticker.eth.last) + "\r\n" +
            "Korbit KRW-ETC: ￦" + numberWithCommas(korbit_ticker.etc.last) + "\r\n" +
            "Korbit KRW-XRP: ￦" + numberWithCommas(korbit_ticker.xrp.last) + "\r\n" +
            "Korbit KRW-BCH: ￦" + numberWithCommas(korbit_ticker.bch.last) + "\r\n"

        bot.sendMessage(chatId, m)

    }
    else if (msg.text ==="COINONE"){

    }
    else if(msg.text === "POLONIEX" || msg.text === "/poloniex" || msg.text==="POLO" || msg.text==="/polo" || msg.text==="poloniex"){
        let usdtEth = poloniex_ticker['USDT_ETH']
        let usdtBtc = poloniex_ticker['USDT_BTC']

        // console.log(usdtEth.last)
        // console.log(usdtBtc.last)

        let m =
            "Poloniex USDT-BTC: $" + parseFloat(usdtBtc['last']).toFixed(4) + "\r\n" +
            "Poloniex USDT-ETH: $" + parseFloat(usdtEth['last']).toFixed(4) + "\r\n"

        bot.sendMessage(chatId,m)

    }
    else if(msg.text==='/bt' || msg.text==='/빗썸' || msg.text==='빗썸'){
        let m =
            "Bithumb KRW-BTC: ￦" + numberWithCommas(bithumb_ticker.BTC.last) + "\r\n" +
            "Bithumb KRW-ETH: ￦" + numberWithCommas(bithumb_ticker.ETH.last) + "\r\n" +
            "Bithumb KRW-ETC: ￦" + numberWithCommas(bithumb_ticker.ETC.last) + "\r\n" +
            "Bithumb KRW-XRP: ￦" + numberWithCommas(bithumb_ticker.XRP.last) + "\r\n" +
            "Bithumb KRW-DASH: ￦" + numberWithCommas(bithumb_ticker.DASH.last) + "\r\n" +
            "Bithumb KRW-BCH: ￦" + numberWithCommas(bithumb_ticker.BCH.last) + "\r\n"

        bot.sendMessage(chatId, m)


    }
    else if(msg.text==="/김프" || msg.text==="김프"){
        // bot.sendMessage(chatId, "<b><i>김치가 좋아</i></b>", {parse_mode : "HTML"})

        bot.sendMessage(chatId, calcKoreanPremium(), {parse_mode : "HTML"})
    }
    else if(msg.text==="/cap" || msg.text==="CAP" || msg.text==="/CAP") {
        let marketCap = numberWithCommas(global_market.total_market_cap_usd)
        let bitPercentage = global_market.bitcoin_percentage_of_market_cap

        let m = "Total Market Cap Usd: $" + marketCap + "\r\n" +
            "BTC Dominance: " + bitPercentage + "%"

        bot.sendMessage(chatId, m)

    }
    else{
        if(_.find(bittrex_markets, {'MarketName':msg.text.replace('/','').toUpperCase()}) === undefined)
            return;

        let photoUrl = _.find(bittrex_markets, {'MarketName':msg.text.replace('/','').toUpperCase()}).LogoUrl

        if(photoUrl!==null){
            bot.sendPhoto(chatId,photoUrl);
        }


        let returnMsg = bittrextStringParse(_.find(bittrex_ticker, {'MarketName':msg.text.replace('/','').toUpperCase()}))
        bot.sendMessage(chatId, returnMsg,{parse_mode : "HTML"})
    }



});