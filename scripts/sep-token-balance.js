const TokenSep = artifacts.require('./TokenSep.sol');

module.exports = async done => {
  const [sender, _] = await web3.eth.getAccounts();
  const tokenSep = await TokenSep.deployed();
  const balance = await tokenSep.balanceOf(sender);
  console.log(balance.toString());
  done();
}