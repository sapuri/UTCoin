// Import the page's CSS
import "../stylesheets/app.css";

// Import libraries
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import UTCoin_artifacts from '../../build/contracts/UTCoin.json'

// UTCoin is our usable abstraction, which we'll use through the code below.
const UTCoin = contract(UTCoin_artifacts);

let accounts;
let account;

window.App = {
  start: function() {
    const self = this;

    // Bootstrap the UTCoin abstraction for Use.
    UTCoin.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      console.log('accounts:', accounts);

      let current_address = document.getElementById("current-address");
      current_address.innerHTML = account;

      self.refreshBalance();

      const eth_balance = web3.fromWei(web3.eth.getBalance(account).toString(), 'ether');
      console.log('eth_balance:', eth_balance, 'ETH');
    });

    // Catching events
    self.catchEvents();
  },

  setStatus: function(message) {
    console.info('setStatus()');
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    console.info('refreshBalance()');
    const self = this;

    UTCoin.deployed().then(instance => {
      return instance.getBalance.call(account, {from: account});
    }).then(value => {
      const balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }).catch(e => {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function() {
    console.info('sendCoin()');
    const self = this;

    const amount = parseInt(document.getElementById("amount").value);
    const sender = document.getElementById("sender").value;
    const receiver = document.getElementById("receiver").value;

    const loader = document.getElementById("send-coin-form").getElementsByClassName("loader")[0];
    loader.classList.add("is-active");
    this.setStatus("Initiating transaction... (please wait)");

    UTCoin.deployed().then(instance => {
      console.log('Contract:', instance);
      return instance.sendCoin(receiver, amount, {from: sender});
    }).then(() => {
      loader.classList.remove("is-active");
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(e => {
      loader.classList.remove("is-active");
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  catchEvents: function() {
    console.info('catchEvents()');
    UTCoin.deployed().then(instance => {
      const transfers = instance.Transfer({fromBlock: 'latest'});
      transfers.watch((error, result) => {
        if (error == null) {
          console.log('Transfer:', result.args);
        }
      });
    }).catch(e => {
      console.log(e);
    });
  }
};

window.addEventListener('load', () => {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 UTCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
