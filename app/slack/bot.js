const Botkit = require('botkit');
const Web3 = require('web3');
const contract = require('truffle-contract');
const UTCoin_artifacts = require('../../build/contracts/UTCoin.json');
const UTCoin = contract(UTCoin_artifacts);
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
UTCoin.setProvider(web3.currentProvider);

// Param settings
const { utcoin_address, deposit_address } = require('./config.js');
const decimals = 3; // 小数点
const num_suffix = Math.pow(10, decimals); // 小数点以下
const tip_amount = 10 * num_suffix // 10 UTC

if (!process.env.token) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

const controller = Botkit.slackbot({
  debug: false,
  json_file_store: './storage'
});

controller.spawn({token: process.env.token}).startRTM(err => {
  if (err) {
    throw new Error(err);
  }
});

// Greeting
controller.hears(['hello', 'hi'], ['direct_message', 'direct_mention'], (bot, message) => {
  bot.reply(message, 'Hello.');
});

// Store user's address
controller.hears('set my address to (.*)', ['direct_message', 'direct_mention'], (bot, message) => {
  const address = message.match[1]
  controller.storage.users.get(message.user, (err, user) => {
    if (!user) {
      user = {id: message.user};
    }

    user.address = address;
    controller.storage.users.save(user, (err, id) => {
      bot.reply(message, `Got it. I set your address to \`${user.address}\`.`);
    });
  });
});

// Get user's address
controller.hears('my address', ['direct_message', 'direct_mention'], (bot, message) => {
  controller.storage.users.get(message.user, (err, user) => {
    if (!user) {
      bot.reply(message, "I can't find your address. Please register it. -> `set my address to 0x...`");
    } else {
      bot.reply(message, `Your address is \`${user.address}\`.`);
    }
  });
});

// Get my balance
controller.hears('my balance', ['direct_message', 'direct_mention'], (bot, message) => {
  controller.storage.users.get(message.user, (err, user) => {
    if (!user) {
      bot.reply(message, "I can't find your address. Please register it. -> `set my address to 0x...`");
    } else {
      // Get my balance
      UTCoin.at(utcoin_address).then(instance => {
        return instance.balanceOf.call(user.address);
      })
        .then(value => {
          const balance_fixed = value.div(num_suffix).toFixed(decimals); // string
          bot.reply(message, `Your balance is ${balance_fixed} UTC.`);
        })
        .catch(e => {
          console.log(e);
        });
    }
  });
});

// Get deposit balance
controller.hears('deposit balance', ['direct_message', 'direct_mention'], (bot, message) => {
  UTCoin.at(utcoin_address).then(instance => {
    return instance.balanceOf.call(deposit_address);
  })
    .then(value => {
      const balance_fixed = value.div(num_suffix).toFixed(decimals); // string
      bot.reply(message, `Deposit balance is ${balance_fixed} UTC.`);
    })
    .catch(e => {
      console.log(e);
    });
});

// Tip by reaction
controller.on(['reaction_added'], (bot, message) => {
  // Get `to_address`
  controller.storage.users.get(message.item_user, (err, user) => {
    if (!user) { // Ignore if target address is not set
      console.log('target address not found');
    } else if (message.user != message.item_user) { // Ignore when self reaction
      let to_address = user.address;

      // Get balance of `deposit_address`
      UTCoin.at(utcoin_address).then(instance => {
        return instance.balanceOf.call(deposit_address);
      })
        .then(value => {
          const deposit_balance = value.toNumber(); // int
          const deposit_balance_fixed = value.div(num_suffix).toFixed(decimals); // string
          console.log(`Deposit balance: ${deposit_balance_fixed} UTC`);
          if (deposit_balance < tip_amount) {
            bot.reply(message, 'The deposit balance is insufficient!');
          } else {
            // Send UTCoin from `deposit_address` to `to_address`
            console.log(`Transfer ${tip_amount / num_suffix} UTC from ${deposit_address} to ${to_address}.`);
            UTCoin.at(utcoin_address)
              .then(instance => {
                return instance.transfer(to_address, tip_amount, {from: deposit_address});
              })
              .then(() => {
                console.log('Transaction complete!');
              })
              .catch(e => {
                console.log(e);
              });
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
  });
});
