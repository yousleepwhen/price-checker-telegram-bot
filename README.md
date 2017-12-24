# price-checker-telegram-bot
암호화폐 시세 조회 텔레그램 봇 / Telegram bot for cryptocurrency price   
[![Coverage Status](https://coveralls.io/repos/github/forsyphilis/price-checker-telegram-bot/badge.svg?branch=development)](https://coveralls.io/github/forsyphilis/price-checker-telegram-bot?branch=development)

#### # node 실행시 bot.js 의 Telegram bot token 을 직접 입력
    $ node index.js

#### # docker 실행시 환경 변수 입력 
    $ docker run -it --privilieged -e TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN forsyphilis/price-checker-telegram-bot

환경 변수에 다음을 추가해야한다. 

#### # AWS Elastic Beanstalk 실행 시 Environment variables: TELEGRAM_BOT_TOKEN 키에 값 추가 
    $ eb deploy


#### # 배포 또는 실행 후 해당 텔레그램 봇 또는 텔레그램 봇이 있는 그룹 채팅에서
    /start
    
### Todo
- [x] Bittrex
- [x] Korbit
- [x] Upbit (browser crwaling) 
- [x] Bithumb
- [x] Korean Premium
- [x] Coinone
- [x] Poloniex (only usdt market)  
~~- [x] Alarm -> remove~~  
~~- [x] CoinmarketCap Screenshot => /shot -> remove~~  


### Screenshot
![screenshot with selection](https://i.imgur.com/om83VvG.png)

![screenshot with selection](https://i.imgur.com/eLTMCqA.png)

![screenshot with selection](https://i.imgur.com/BOOHpau.png)


