
const DiceGame = artifacts.require("DiceGame");

module.exports = function (deployer) {
  deployer.deploy(DiceGame);
};
