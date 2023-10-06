const TokenSep = artifacts.require("TokenSep.sol");
const TokenGo = artifacts.require("TokenGo.sol");
const BridgeSep = artifacts.require("BridgeSep.sol");
const BridgeGo = artifacts.require("BridgeGo.sol");

module.exports = async function (deployer, network, addresses) {
  if (network === "sepolia") {
    await deployer.deploy(TokenSep);
    const tokenSep = await TokenSep.deployed();
    await tokenSep.mint(addresses[0], 100);
    await deployer.deploy(BridgeSep, tokenSep.address);
    const bridgeSep = await BridgeSep.deployed();
    await tokenSep.updateAdmin(bridgeSep.address);
  }
  if (network === "goerli") {
    await deployer.deploy(TokenGo);
    const tokenGo = await TokenGo.deployed();
    await deployer.deploy(BridgeGo, tokenGo.address);
    const bridgeGo = await BridgeGo.deployed();
    await tokenGo.updateAdmin(bridgeGo.address);
  }
};