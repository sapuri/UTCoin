pragma solidity ^0.4.18;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/UTCoin.sol";

contract TestUTCoin {

  function testInitialBalanceUsingDeployedContract() public {
    UTCoin utcoin = UTCoin(DeployedAddresses.UTCoin());

    uint expected = 1000000000;

    Assert.equal(utcoin.balanceOf(msg.sender), expected, "Owner should have 1000000000 UTCoin initially");
  }

}
