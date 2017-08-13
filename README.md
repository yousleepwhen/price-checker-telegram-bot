# price-checker-telegram-bot
암호화폐 시세 조회 텔레그램 봇 / Telegram bot for cryptocurrency price 

#### # node 실행시 bot.js 의 Telegram bot token 을 직접 입력
    $ node bot.js

#### # docker 실행시 환경 변수 입력
    $ docker run -it -e TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN forsyphilis/price-checker-telegram-bot

환경 변수에 다음을 추가해야한다. 

#### # AWS Elastic Beanstalk 실행 시 Environment variables: TELEGRAM_BOT_TOKEN 키에 값 추거
    $ eb deploy
    
