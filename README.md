# price-checker-telegram-bot
암호화폐 시세 조회 텔레그램 봇 / Telegram bot for cryptocurrency price 

#### # node 실행시 bot.js 의 Telegram bot token 을 직접 입력
    $ node bot.js

#### # docker 실행시 환경 변수 입력 
    $ docker run -it -e TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN forsyphilis/price-checker-telegram-bot

환경 변수에 다음을 추가해야한다. 

#### # AWS Elastic Beanstalk 실행 시 Environment variables: TELEGRAM_BOT_TOKEN 키에 값 추가 
    $ eb deploy


#### # 배포 또는 실행 후 해당 텔레그램 봇 또는 텔레그램 봇이 있는 그룹 채팅에서
    /start

#### # Bittrex Last Price Alarm 사용
    /add [Market]-[Coin]-[Compare]-[Value]
    Market: BTC, ETH, USDT
    Compare: GREATER, LESS
    /add eth-snt-greater-0.000175 (ETH마켓의 Status Network Token(SNT)의 가격이 0.000175 이상일 경우)
    
### Todo
- [x] Bittrex
- [x] Korbit
- [x] Bithumb
- [x] Korean Premium
- [x] Coinone
- [x] Poloniex (only usdt market)
- [x] Alarm
- [x] CoinmarketCap Screenshot => /shot


