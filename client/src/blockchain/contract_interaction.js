import {getWeb3, getContract} from './utils.js';

var NETWORK_ID = 80001 //Mumbai
//const NETWORK_ID = 137 //Matic
var contract
var accounts

var contract
var accounts

async function getAccounts() {
  accounts = await web3.eth.getAccounts()
  //onConnect()
  //getBalance()
}

async function initContractInteraction() {
  var awaitWeb3 = async function () {
    web3 = await getWeb3();
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        //document.getElementById("loading-web3").style.display = "none";
        var awaitContract = async function () {
          contract = await getContract(web3);
          var awaitAccounts = async function () {
            getAccounts()
          };
          awaitAccounts();
        };
        awaitContract();
      } else {
        /*
        document.getElementById("loading-web3").style.display = "none";
        document.getElementById("wallet-disconnected").style.display = "none";
        document.getElementById("wallet-connected").style.display = "none";
        document.getElementById("wrong-network").style.display = "block";
        */
      }
    });
  };
  awaitWeb3();
}

initContractInteraction()

const rollAsync = async (userProvidedSeed, selection) => {
  await contract.methods
    .roll("123", "1")
    .send({ from: accounts[0], gas: 400000, value: "1" })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
};

function roll(userProvidedSeed, selection)
{
  console.log(userProvidedSeed, selection)
  var awaitRoll = async function () {
    await rollAsync(userProvidedSeed, selection)
  }
  awaitRoll()
}

export {roll}