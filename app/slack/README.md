# Slackbot
Slack plugin for tipping each other with UTCoin.

Inspired by [OKIMOCHI](https://github.com/campfire-inc/OKIMOCHI) (&copy; CAMPFIRE).

## Setup
### 1. ソースコードをダウンロード
```
git clone https://github.com/m1nam1/UTCoin.git
```

### 2. パッケージをインストール
```
cd UTCoin
yarn # or npm install
```

### 3. UTCoin をデプロイ
```
truffle migrate
```

既にデプロイされた UTCoin を使う場合は、上のコマンドを実行する代わりに、その migrate 時に生成された `build` ディレクトリを使用してください。

### 4. app/slack/config.js を作成
```
cd app/slack
vi config.js
```

以下の内容で保存
```
exports.deposit_address = '0x...'; // Ropsten
```

`0x...` の部分はデポジットとして使いたいアドレスを入力します。

### 5. Slackbot 起動

あらかじめ Slack で bot のトークンを取得しておいてください。
```
token=[slackbot token] node bot.js
```

## Usage
以下は Slack での操作です。

監視させたいチャンネルに Bot を招待します。
```
/invite @utcoin-bot
```

Bot が招待されたチャンネルで reaction が発生すると、reaction されたユーザーに一定の UTCoin が送金されます。

### Commands
コマンドは direct message か direct mention で発動します。

- Ping
```
hi # or hello
```

- アドレスを登録
```
set my address to 0x...
```

- アドレスを確認
```
my address
```

- UTCoin の残高を確認
```
my balance
```

- デポジットの残高を確認
```
deposit balance
```
