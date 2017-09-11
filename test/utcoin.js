var UTCoin = artifacts.require("./UTCoin.sol");

contract('UTCoin', function(accounts) {

  const totalSupply = 10000;
  it(`should put ${totalSupply} UTCoin in the first account`, function() {
    return UTCoin.deployed().then(function(instance) {
      return instance.getBalance.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), totalSupply, `${totalSupply} wasn't in the first account`);
    });
  });

  it("should call a function that depends on a linked library", function() {
    var meta;
    var UTCoinBalance;
    var UTCoinEthBalance;

    return UTCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(accounts[0]);
    }).then(function(outCoinBalance) {
      UTCoinBalance = outCoinBalance.toNumber();
      return meta.getBalanceInEth.call(accounts[0]);
    }).then(function(outCoinBalanceEth) {
      UTCoinEthBalance = outCoinBalanceEth.toNumber();
    }).then(function() {
      assert.equal(UTCoinEthBalance, 2 * UTCoinBalance, "Library function returned unexpeced function, linkage may be broken");
    });
  });

  it("should send coin correctly", function() {
    var meta;

    // Get initial balances of first and second account.
    var account_one = accounts[0];
    var account_two = accounts[1];

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 10;

    return UTCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return meta.sendCoin(account_two, amount, {from: account_one});
    }).then(function() {
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });

  it("should blacklisted address cannot transaction", () => {
    let utcoin;
    const owner_addr = accounts[0]; // owner's address
    const black_addr = accounts[1]; // blacklisted address
    const amount = 10;

    // Create new instance of UTCoin from owner's address.
    return UTCoin.new({from: owner_addr})
      .then(instance => {
        utcoin = instance;
        // Add black_addr to blacklist.
        return utcoin.blacklisting(black_addr);
      })
      .then(() => {
        // Send coins from owner_addr to black_addr.
        return utcoin.sendCoin(black_addr, amount);
      })
      .then(assert.fail)
      .catch(e => {
        assert(e.message.indexOf('invalid opcode') >= 0, "Black list didn't prevent transaction")
      });
  });

});
