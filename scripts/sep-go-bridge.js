const { Web3 } = require("web3");
const BridgeSep = require("../build/contracts/BridgeSep.json");
const BridgeGo = require("../build/contracts/BridgeGo.json");

const web3Sep = new Web3("wss://eth-sepolia.g.alchemy.com/v2/YpTZ5tMRclATrkEA5IbBBxzbYXXoatl5");

const web3Go = new Web3("wss://eth-goerli.g.alchemy.com/v2/feGVwyxxZU0-XolwOTo96eZdZRrjPgjb");

// The private key of the wallet to be used as the admin address
const adminPrivKey = "0x2f4f87699090af7f11584cd76c30293c148269fb3f50242c7d72be0fbbb33a8b";

// Deriving the public address of the wallet using the private key
const  wallet  = web3Sep.eth.accounts.wallet.add(adminPrivKey);

const admin = wallet[0].address; 

// Instantiating the BridgeEth contract with its ABI and address
const bridgeSep = new web3Sep.eth.Contract(
    BridgeSep.abi,
    BridgeSep.networks["11155111"].address
);

// Instantiating the BridgeBsc contract with its ABI and address
const bridgeGo = new web3Go.eth.Contract(
    BridgeGo.abi,
    BridgeGo.networks["5"].address
);

// Listening to Transfer events emitted by the BridgeEth contract
console.log("Listening to the events....");
bridgeSep.events
  .Transfer({ fromBlock: 0, step: 0 })
  .on("data", async (event) => {
    
    const { from, to, amount, date, nonce, signature } = event.returnValues;
    const tx = bridgeGo.methods.mint(from, to, amount, nonce, signature);

    // Getting the gas price and gas cost required for the method call
    const [gasPrice, gasCost] = await Promise.all([
      web3Go.eth.getGasPrice(),
      tx.estimateGas({ from: admin }),
    ]);

    // Encoding the ABI of the method
    const data = tx.encodeABI();

    // Preparing the transaction data
    const txData = {
      from: admin,
      to: bridgeGo.options.address,
      data,
      gas: gasCost,
      gasPrice, 
    };

    const transactionSignature = await web3Go.eth.accounts.signTransaction(txData, adminPrivKey);
    
    try {
        // const receipt = await web3Go.eth.sendTransaction(txData);
        web3Go.eth.sendSignedTransaction(transactionSignature.rawTransaction).on(
            "receipt", async (receipt) => {
                console.log(`Transaction hash: ${receipt.transactionHash}`);
            
                console.log(`
                    Processed transfer:
                    - from ${from} 
                    - to ${to} 
                    - amount ${amount} tokens
                    - date ${date}
                    - nonce ${nonce}
                `);
            }
        );
        
    } catch (error) {
        console.log({ error })
    }

  });