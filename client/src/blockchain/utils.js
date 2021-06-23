import Web3 from "./web3.js";

var SMART_CONTRACT_ABI_PATH = "./contracts/DiceGame.json"

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    console.log(document.readyState)
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // ask user permission to access his accounts
          (async function(){
            await window.ethereum.request({ method: "eth_requestAccounts" });
          })()
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else {
        reject("must install MetaMask");
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          try {
            // ask user permission to access his accounts
            await window.ethereum.request({ method: "eth_requestAccounts" });
            resolve(web3);
          } catch (error) {
            reject(error);
          }
        } else {
          reject("must install MetaMask");
        }
      });
    }
  });
};


function handleRevertError(message) {
  alert(message);
}

async function getRevertReason(txHash) {
  const tx = await web3.eth.getTransaction(txHash);
  await web3.eth
    .call(tx, tx.blockNumber)
    .then((result) => {
      throw Error("unlikely to happen");
    })
    .catch((revertReason) => {
      console.log(revertReason)
      var str = "" + revertReason;
      var json_reason = JSON.parse(str.substring(str.indexOf("{")));
      handleRevertError(json_reason.message);
    });
}

var contract

const getContract = async (web3) => {
  const response = await fetch(SMART_CONTRACT_ABI_PATH);
  const data = await response.json();
  
  const netId = await web3.eth.net.getId();
  const deployedNetwork = data.networks[netId];
  contract = new web3.eth.Contract(
    data.abi,
    deployedNetwork && deployedNetwork.address
    );
  return contract
};

const convertToDateString = (epochTime) => {
  const date = new Date(epochTime * 1000);
  return date.toLocaleDateString("en-US");
};

const convertWeiToCrypto = (wei) => {
  const cryptoValue = web3.utils.fromWei(wei, "ether");
  return cryptoValue;
};

const convertCryptoToWei = (crypto) => {
  return web3.utils.toWei(crypto, "ether");
};

export { getWeb3, getContract, convertWeiToCrypto, convertCryptoToWei, getRevertReason }