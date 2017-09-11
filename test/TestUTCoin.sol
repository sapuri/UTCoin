pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/UTCoin.sol";

contract TestUTCoin {

  function testInitialBalanceUsingDeployedContract() {
    UTCoin utcoin = UTCoin(DeployedAddresses.UTCoin());

    uint expected = 10000;

    Assert.equal(utcoin.getBalance(msg.sender), expected, "Owner should have 10000 UTCoin initially");
  }

}
