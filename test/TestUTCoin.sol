pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/UTCoin.sol";

contract TestUTCoin {

  function testInitialBalanceUsingDeployedContract() {
    UTCoin meta = UTCoin(DeployedAddresses.UTCoin());

    uint expected = 10000;

    Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 UTCoin initially");
  }

  function testInitialBalanceWithNewUTCoin() {
    UTCoin meta = new UTCoin();

    uint expected = 10000;

    Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 UTCoin initially");
  }

}
