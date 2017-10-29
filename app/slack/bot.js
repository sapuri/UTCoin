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

// Help
controller.hears('help', ['direct_message', 'direct_mention'], (bot, message) => {
  bot.botkit.log('cmd:', message.text);
  help_text = '*Commands*\n' +
  'The commands are activated by direct message or direct mention.\n\n' +

  '- Help\n' +
  '```\n' +
  'help\n' +
  '```\n\n' +

  '- Ping\n' +
  '```\n' +
  'hi # or hello\n' +
  '```\n\n' +

  '- Register address\n' +
  '```\n' +
  'set my address to 0x...\n' +
  '```\n\n' +

  '- Display address\n' +
  '```\n' +
  'my address\n' +
  '```\n\n' +

  '- Display UTCoin balance\n' +
  '```\n' +
  'my balance\n' +
  '```\n\n' +

  '- Display deposit balance\n' +
  '```\n' +
  'deposit balance\n' +
  '```\n\n' +

  '- Transfer UTCoin (Only direct message)\n' +
  '```\n' +
  'send [amount] UTC to @[username]\n' +
  '```\n';
  bot.reply(message, help_text);
});

// Greeting
controller.hears(['hello', 'hi'], ['direct_message', 'direct_mention'], (bot, message) => {
  bot.botkit.log('cmd:', message.text);
  bot.reply(message, 'Hello.');
});

// Store user's address
controller.hears('set my address to (.*)', ['direct_message', 'direct_mention'], (bot, message) => {
  bot.botkit.log('cmd:', message.text);
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
  bot.botkit.log('cmd:', message.text);
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
  bot.botkit.log('cmd:', message.text);
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
          bot.botkit.log.error(e);
        });
    }
  });
});

// Get deposit balance
controller.hears('deposit balance', ['direct_message', 'direct_mention'], (bot, message) => {
  bot.botkit.log('cmd:', message.text);
  UTCoin.at(utcoin_address).then(instance => {
    return instance.balanceOf.call(deposit_address);
  })
    .then(value => {
      const balance_fixed = value.div(num_suffix).toFixed(decimals); // string
      bot.reply(message, `Deposit balance is ${balance_fixed} UTC.`);
    })
    .catch(e => {
      bot.botkit.log.error(e);
    });
});

// Tip by reaction
controller.on(['reaction_added'], (bot, message) => {
  // Get `to_address`
  controller.storage.users.get(message.item_user, (err, user) => {
    if (!user) { // Ignore if target address is not set
      bot.botkit.log.error('target address not found');
    } else if (message.user != message.item_user) { // Ignore when self reaction
      let to_address = user.address;

      // Get balance of `deposit_address`
      UTCoin.at(utcoin_address).then(instance => {
        return instance.balanceOf.call(deposit_address);
      })
        .then(value => {
          const deposit_balance = value.toNumber(); // int
          const deposit_balance_fixed = value.div(num_suffix).toFixed(decimals); // string
          bot.botkit.log(`Deposit balance: ${deposit_balance_fixed} UTC`);
          if (deposit_balance < tip_amount) {
            bot.botkit.log.error('the deposit balance is insufficient!');
            bot.reply(message, 'The deposit balance is insufficient!');
          } else {
            // Send UTCoin from `deposit_address` to `to_address`
            bot.botkit.log(`Transfer ${tip_amount / num_suffix} UTC from ${deposit_address} to ${to_address}.`);
            UTCoin.at(utcoin_address)
              .then(instance => {
                return instance.transfer(to_address, tip_amount, {from: deposit_address});
              })
              .then(() => {
                bot.botkit.log('Transaction complete!');
              })
              .catch(e => {
                bot.botkit.log.error(e);
              });
          }
        })
        .catch(e => {
          bot.botkit.log.error(e);
        });
    }
  });
});

// Send UTCoin
controller.hears('send ([0-9]+[\.]?[0-9]*) UTC to (.+)', 'direct_message', (bot, message) => {
  bot.botkit.log('cmd:', message.text);
  const amount = parseInt(Number(message.match[1]) * num_suffix, 10);
  const to_user = message.match[2].slice(2, -1); // Remove mention
  let from_address = '';
  let to_address = '';

  // Validate amount
  if (amount <= 0) {
    bot.reply(message, `This is an invalid amount. The minimum is ${1 / num_suffix} UTC.`);
    return;
  }

  // Get `from_address`
  controller.storage.users.get(message.user, (err, user) => {
    if (!user) {
      bot.botkit.log.error('address not found');
      bot.reply(message, 'I cannot find your address. Please register it. -> `set my address to 0x...`');
    } else {
      from_address = user.address;

      // Check balance of `from_address`
      UTCoin.at(utcoin_address).then(instance => {
        return instance.balanceOf.call(from_address);
      })
        .then(value => {
          const balance = value.toNumber();
          if (value < amount) {
            bot.botkit.log.error('insufficient funds');
            bot.reply(message, 'Your balance is insufficient.');
          } else {
            // Get `to_address`
            controller.storage.users.get(to_user, (err, user) => {
              if (!user) {
                bot.botkit.log.error('target address not found');
                bot.reply(message, 'I cannot find target address. It seems that it is not registered yet.');
              } else {
                to_address = user.address;

                // Transaction
                bot.startConversation(message, (err, convo) => {
                  convo.ask(`OK. I will send *${amount / num_suffix} UTC* to <@${to_user}>.\nIf it is correct, please enter your password. (Your address: \`${from_address}\`)`, (response, convo) => {
                    const password = response.text;
                    if (web3.personal.unlockAccount(from_address, password)) {
                      // Send UTCoin from `from_address` to `to_address`
                      bot.botkit.log(`Transfer ${amount / num_suffix} UTC from ${from_address} to ${to_address}.`);
                      bot.reply(message, 'Please wait...');
                      UTCoin.at(utcoin_address)
                        .then(instance => {
                          return instance.transfer(to_address, amount, {from: from_address});
                        })
                        .then(() => {
                          bot.botkit.log('Transaction complete!');
                          convo.say('The transaction has been completed!');
                          convo.next();
                        })
                        .catch(e => {
                          bot.botkit.log.error(e);
                          convo.say('The transaction failed. Please contact the administrator.');
                          convo.next();
                        });
                    } else {
                      bot.botkit.log.error('invalid password');
                      convo.say('Sorry. This password is incorrect.');
                      convo.next();
                    }
                  });
                });
              }
            });
          }
        })
        .catch(e => {
          bot.botkit.log.error(e);
        });
    }
  });
});
