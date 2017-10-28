# Slackbot
Slack plugin for tipping each other with UTCoin.

Inspired by [OKIMOCHI](https://github.com/campfire-inc/OKIMOCHI) (&copy; CAMPFIRE).

## Setup
### 1. Download source code
```
git clone https://github.com/m1nam1/UTCoin.git
```

### 2. Install packages
```
cd UTCoin
yarn # or npm install
```

### 3. Deploy UTCoin
Ropsten にデプロイする場合
```
truffle migrate --network ropsten
```

既にデプロイされた UTCoin を使う場合は、上のコマンドを実行する代わりに、その migrate 時に生成された `build` ディレクトリを使用してください。

### 4. Create app/slack/config.js
```
cd app/slack
vi config.js
```

以下の内容で保存
```
// Ropsten
exports.utcoin_address = '0x...'; // デプロイされた UTCoin のアドレス
exports.deposit_address = '0x...'; // デポジットとして使いたいアドレス
```

### 5. Run Slackbot
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
The commands are activated by direct message or direct mention.

- Ping
```
hi # or hello
```

- Register address
```
set my address to 0x...
```

- Display address
```
my address
```

- Display UTCoin balance
```
my balance
```

- Display deposit balance
```
deposit balance
```

- Transfer UTCoin (Only direct message)
```
send [amount] UTC to @[username]
```
