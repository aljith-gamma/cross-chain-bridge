const BridgeSep = artifacts.require("./BridgeSep.sol");

const privKey = "2f4f87699090af7f11584cd76c30293c148269fb3f50242c7d72be0fbbb33a8b";

module.exports = async (done) => {
  const nonce = 1; //Need to increment this for each new transfer
  const accounts = await web3.eth.getAccounts();
  const bridgeSep = await BridgeSep.deployed();
  const amount = 15;
  const message = web3.utils
    .soliditySha3(
      { t: "address", v: accounts[0] },
      { t: "address", v: accounts[0] },
      { t: "uint256", v: amount },
      { t: "uint256", v: nonce }
    )
    .toString("hex");
  const { signature } = web3.eth.accounts.sign(message, privKey);
  await bridgeSep.burn(accounts[0], amount, nonce, signature);
  done();
};