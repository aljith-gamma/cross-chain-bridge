const TokenGo = artifacts.require('./TokenGo.sol');

module.exports = async done => {
  const [recipient, _] = await web3.eth.getAccounts();
  const tokenGo = await TokenGo.deployed();
  const balance = await tokenGo.balanceOf(recipient);
  console.log(balance.toString());
  done();
}