let UTCoin = artifacts.require("./UTCoin.sol");

contract('UTCoin', accounts => {

  const totalSupply = 1000000000;
  it(`should put ${totalSupply} UTCoin in the first account`, () => {
    return UTCoin.deployed().then(instance => {
      return instance.balanceOf.call(accounts[0]);
    }).then(balance => {
      assert.equal(balance.valueOf(), totalSupply, `${totalSupply} wasn't in the first account`);
    });
  });

  it("should send coin correctly", () => {
    let utcoin;

    // Get initial balances of first and second account.
    const account_one = accounts[0];
    const account_two = accounts[1];

    let account_one_starting_balance;
    let account_two_starting_balance;
    let account_one_ending_balance;
    let account_two_ending_balance;

    const amount = 10;

    return UTCoin.deployed().then(instance => {
      utcoin = instance;
      return utcoin.balanceOf.call(account_one);
    })
      .then(balance => {
        account_one_starting_balance = balance.toNumber();
        return utcoin.balanceOf.call(account_two);
      })
      .then(balance => {
        account_two_starting_balance = balance.toNumber();
        return utcoin.approve(account_one, amount);
      })
      .then(() => {
        return utcoin.transferFrom(account_one, account_two, amount);
      })
      .then(() => {
        return utcoin.balanceOf.call(account_one);
      })
      .then(balance => {
        account_one_ending_balance = balance.toNumber();
        return utcoin.balanceOf.call(account_two);
      })
      .then(balance => {
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
        return utcoin.transfer(black_addr, amount);
      })
      .then(assert.fail)
      .catch(e => {
        assert(e.message.indexOf('invalid opcode') >= 0, "Black list didn't prevent transaction");
      });
  });

  it("should transfer ownership correctly", () => {
    let utcoin;
    const old_owner_addr = accounts[0];
    const new_owner_addr = accounts[1];

    return UTCoin.new({from: old_owner_addr})
      .then(instance => {
        utcoin = instance;
        return utcoin.transferOwnership(new_owner_addr);
      })
      .then(() => {
        return utcoin.transferOwnership(old_owner_addr);
      })
      .then(assert.fail)
      .catch(e => {
        assert(e.message.indexOf('invalid opcode') >= 0, "Didn't transfer ownership");
      });
  });

});
