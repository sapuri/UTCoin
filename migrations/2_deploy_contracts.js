var ConvertLib = artifacts.require("./ConvertLib.sol");
var UTCoin = artifacts.require("./UTCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, UTCoin);
  deployer.deploy(UTCoin);
};
