import {getWeb3, getContract, convertWeiToCrypto, convertCryptoToWei, getRevertReason} from './utils.js';

var NETWORK_ID = 137 //Matic
var TESTNET_ID = 42  //Kovan
//var NETWORK_ID = 80001 //Mumbai
var contract
var accounts
var balance
var onConfirmClickCallback
var maximum_bet
var minimum_bet
var bet_percentage_fee

function onDisconnect() {
  document.getElementById("wallet-disconnected").style.display = "block"
  document.getElementById("wallet-connected").style.display = "none"
  document.getElementById("wallet-connected").style.display = "none"
  
  document.getElementById("logout-button").style.display = "none"
}

var getBalance = async function (callback) {
  var result = await web3.eth.getBalance(accounts[0])
  callback(result)
}

function disconnectWallet() {
  accounts = null
  balance = null
  onDisconnect()
}

function setConfirmTransactionCallback(confirmClickCallback) {
  onConfirmClickCallback = confirmClickCallback
}

async function onConnect() {
  accounts = await web3.eth.getAccounts()
  maximum_bet = await contract.methods.maximum_bet().call()
  minimum_bet = await contract.methods.minimum_bet().call()
  bet_percentage_fee = await contract.methods.bet_percentage_fee().call()

  document.getElementById("my-address").innerHTML = accounts[0].substring(0, 6) + "..." + accounts[0].substring(accounts[0].length-4, accounts[0].length)
  document.getElementById("wallet-disconnected").style.display = "none"
  document.getElementById("wallet-connected").style.display = "block"

  document.getElementById("logout-button").style.display = "block"
  document.getElementById('modal_text').innerHTML =
    "The minimum bet is " + convertWeiToCrypto(minimum_bet) +
    " Matic and the maximum bet is " +
    convertWeiToCrypto(maximum_bet) + " Matic. " +
    (bet_percentage_fee/100) + "% the prize goes to oracles fees and development team."
  document.getElementById('bet_amount').value = convertWeiToCrypto(getMinimumBet())
}

async function initContractInteraction() {
  var awaitWeb3 = async function () {
    web3 = await getWeb3();
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID || netId == TESTNET_ID) {
        document.getElementById("loading-web3").style.display = "none";
        var awaitContract = async function () {
          contract = await getContract(web3);
          var awaitAccounts = async function () {
            onConnect()
          };
          awaitAccounts();
        };
        awaitContract();
      } else {
        document.getElementById("loading-web3").style.display = "none";
        document.getElementById("wallet-disconnected").style.display = "none";
        document.getElementById("wallet-connected").style.display = "none";
        document.getElementById("wrong-network").style.display = "block";
      }
    });
  };
  awaitWeb3();
}

initContractInteraction()

var roll = async function (selection, amount, callback) {
  await contract.methods
    .roll(selection)
    .send({ from: accounts[0], gas: 400000, value: convertCryptoToWei(amount) })
    .on('transactionHash', function(hash){
      console.log("transactionHash")
      onConfirmClickCallback()
    })
    .on('receipt', function(receipt){
      console.log("receipt")
      callback(true)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      console.log("confirmation")
    })
    .on('error', function(error, receipt) {
      console.log("error")
      callback(false)
      //getRevertReason(receipt.transactionHash);
      //document.getElementById('status').innerHTML = "Error: Transaction reverted"
    }).catch((revertReason) => {
      //getRevertReason(revertReason.receipt.transactionHash);
    });
}

var getPlayerRequestId = async function (callback) {
  var result = await contract.methods
  .player_request_id(accounts[0]).call()
  callback(result)
}

var getContractBalance = async function (callback) {
  var result = await web3.eth.getBalance(contract.options.address)
  console.log(contract.options.address)
  callback(result)
}

var getLinkBalance = async function (callback) {
  var result = await contract.methods
  .getLinkBalance().call()
  callback(result)
}

var getGame = async function (request_id, callback) {
  var result = await contract.methods
    .games(request_id).call()
  callback(result)
}

function getMaximumBet() {
  return maximum_bet
}

function getMinimumBet() {
  return minimum_bet
}

function getBetPercentageFee() {
  return bet_percentage_fee
}

async function loadNavbar() {
  const contentDiv = document.getElementById("navbar");
  contentDiv.innerHTML = await (await fetch("./html/navbar.html")).text()

  container.addEventListener("click", function () {
    document.getElementById('rules_modal').classList.remove('is-active')
  }, false);
  rules_modal_card.addEventListener("click", function (ev) {
    ev.stopPropagation();
  }, false);
  rules_button.addEventListener("click", function (ev) {
    document.getElementById('rules_modal').classList.add('is-active')
    ev.stopPropagation();
  }, false);
}

loadNavbar()

export {
  roll,
  disconnectWallet,
  setConfirmTransactionCallback,
  getPlayerRequestId,
  getContractBalance,
  getLinkBalance,
  getGame,
  convertWeiToCrypto,
  convertCryptoToWei,
  getBalance,
  getMaximumBet,
  getMinimumBet,
  getBetPercentageFee
}