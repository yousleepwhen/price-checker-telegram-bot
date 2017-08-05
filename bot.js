
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

let current_usdt_btc = 0.0;
let current_usdt_eth = 0.0;


let bithumb_ticker = {

}



function run_bittrex_ticker() {
    request('https://bittrex.com/api/v1.1/public/getmarketsummaries', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(JSON.parse(body))
            bittrex_ticker = JSON.parse(body).result
            current_usdt_btc = _.find(bittrex_ticker, {'MarketName':'USDT-BTC'}).Last
            current_usdt_eth = _.find(bittrex_ticker, {'MarketName':'USDT-ETH'}).Last
            // console.log(bittrex_ticker.result) // Print the google web page.

        }
    })
}

run_bittrex_ticker()
setInterval(run_bittrex_ticker, 5000)


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
    console.log(tickerData)
    if(tickerData !== undefined){
        let marketTitle = tickerData.MarketName

        let change = parseFloat((tickerData.Last / tickerData.PrevDay * 100.0) - 100.0).toFixed(4)

        let key = getKeySymbol(marketTitle)


        let changeText;
        if( change < 0.0 ){
            changeText = "Change: <b>" +change+ "%</b>😭😭😭\r\n"
        }else{
            changeText = "Change: <b>" +change+ "%</b>🤑🤑🤑\r\n"
        }

        let msg = "" +
            "현재 USDT-BTC 가격: $<b>" + numberWithCommas(current_usdt_btc) + "</b>\r\n" +
            "현재 USDT-ETH 가격: $<b>" + numberWithCommas(current_usdt_eth) + "</b>\r\n" +
            "=======================================\r\n" +
            tickerData.MarketName + ": Last(<b>" + numberWithCommas(parseFloat(tickerData.Last).toFixed(8)) + ` ${key}` +"</b>)" + " PrevDay(<b>" + numberWithCommas(parseFloat(tickerData.PrevDay).toFixed(8)) +` ${key}`+ "</b>)\r\n" +
            changeText  +
            "Volume: " + tickerData.Volume + "\r\n" +
            "=======================================\r\n"

        return msg
    } else {
        return "Can not find Market"
    }

}
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(msg)

    if(msg.text==='/korbit'){
        let m =
            "Korbit KRW-BTC: ￦" + numberWithCommas(korbit_ticker.btc.last) + "\r\n" +
            "Korbit KRW-ETH: ￦" + numberWithCommas(korbit_ticker.eth.last) + "\r\n" +
            "Korbit KRW-ETC: ￦" + numberWithCommas(korbit_ticker.etc.last) + "\r\n" +
            "Korbit KRW-XRP: ￦" + numberWithCommas(korbit_ticker.xrp.last) + "\r\n" +
            "Korbit KRW-BCH: ￦" + numberWithCommas(korbit_ticker.bch.last) + "\r\n"

        bot.sendMessage(chatId, m)

    }
    else if(msg.text==='/bt'){
        let m =
            "Bithumb KRW-BTC: ￦" + numberWithCommas(bithumb_ticker.BTC.last) + "\r\n" +
            "Bithumb KRW-ETH: ￦" + numberWithCommas(bithumb_ticker.ETH.last) + "\r\n" +
            "Bithumb KRW-ETC: ￦" + numberWithCommas(bithumb_ticker.ETC.last) + "\r\n" +
            "Bithumb KRW-XRP: ￦" + numberWithCommas(bithumb_ticker.XRP.last) + "\r\n" +
            "Bithumb KRW-DASH: ￦" + numberWithCommas(bithumb_ticker.DASH.last) + "\r\n" +
            "Bithumb KRW-BCH: ￦" + numberWithCommas(bithumb_ticker.BCH.last) + "\r\n"

        bot.sendMessage(chatId, m)


    }
    else if(msg.text==="/김프"){
        // bot.sendMessage(chatId, "<b><i>김치가 좋아</i></b>", {parse_mode : "HTML"})

        let usdDash = parseFloat(_.find(bittrex_ticker, {'MarketName':'USDT-DASH'}).Last)
        let krwDash = parseFloat(bithumb_ticker.DASH.last)

        let usdKrwDash = usdDash * usd

        let rate = krwDash / usdKrwDash

        let m = "DASH 프리미엄(Bittrex 비교): " + rate.toFixed(8)  + "%"
        bot.sendMessage(chatId, m)
    }
    else{
        let returnMsg = bittrextStringParse(_.find(bittrex_ticker, {'MarketName':msg.text.replace('/','').toUpperCase()}))
        bot.sendMessage(chatId, returnMsg,{parse_mode : "HTML"})
    }



});