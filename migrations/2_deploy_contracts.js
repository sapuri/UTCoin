var UTCoin = artifacts.require("./UTCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(UTCoin);
};
