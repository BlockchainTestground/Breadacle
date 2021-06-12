import Phaser from "phaser";
import dragonBones from "./external/dragonBones";
import { roll, disconnectWallet, getPlayerRequestId, getContractBalance, getLinkBalance, getGame, convertWeiToCrypto, convertCryptoToWei, getBalance } from "./blockchain/contract_interaction";
import logoImg from "./assets/logo.png";

const Result = {
  Pending: 0,
  PlayerWon: 1,
  PlayerLost: 2
}

const config = {
  type: Phaser.AUTO,
  parent: "phaser_canvas",
  width: 600,
  height: 600,
  dom: {
    createContainer: true
  },
  plugins: {
    scene: [
      { key: "DragonBones", plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin, mapping: "dragonbone" } // setup DB plugin
    ]
  },
  transparent: true,
  scene: {
    preload: preload,
    create: create
  }
};

const game = new Phaser.Game(config);
var ui_text
var current_request_id = null
var current_amount = "0.1"
var amount_form_html
var arm
var arm2

function preload() {
  this.load.image('a', './src/assets/a.png')
  this.load.image('b', './src/assets/b.png')

  this.load.dragonbone(
      "x",
      "src/assets/DragonBonesFiles/Throne/Throne_tex.png",
      "src/assets/DragonBonesFiles/Throne/Throne_tex.json",
      "src/assets/DragonBonesFiles/Throne/Throne_ske.json",
  );

  this.load.dragonbone(
    "z",
    "src/assets/DragonBonesFiles/OracleToaster/Toaster_tex.png",
    "src/assets/DragonBonesFiles/OracleToaster/Toaster_tex.json",
    "src/assets/DragonBonesFiles/OracleToaster/Toaster_ske.json",
);
}

function create() {

  arm = this.add.armature("Armature", "x");
  arm.x = 400;
  arm.y = 300;
  arm.animation.play("throneAnimation");
  arm.animation.play("animtion1");

  arm2 = this.add.armature("Armature", "z");
  arm2.x = 400;
  arm2.y = 375;
  arm2.animation.play("StartToast");

  ui_text = this.add.text(0, 50, '', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
}

function onRoll(selection)
{
  ui_text.text = "Waiting confirmation"
  roll("123", selection, current_amount, () => {
    ui_text.text = "Waiting oracle"
    arm.animation.play("animtion1");
    getPlayerRequestId((request_id) => {
      current_request_id = request_id
      console.log(current_request_id)
    });
  });
}

function poll() {
  console.log("polling...")
  if(current_request_id)
  {
    getGame(current_request_id, (game) => {
      console.log("Bet amount:" + convertWeiToCrypto(game.bet_amount))
      if(game.result == Result.Pending)
        console.log("Pending...")
      else
        current_request_id = null
        
      if(game.result == Result.PlayerWon)
      {
        console.log("Player won")
        ui_text.text = "Player won"
        arm.animation.play("animtion0");
      }
      if(game.result == Result.PlayerLost)
      {
        console.log("Player lost")
        ui_text.text = "Player lost"
        arm.animation.play("animtion0");
      }
    });
  }

  getBalance((balance) => {
    document.getElementById('my-balance').innerHTML = convertWeiToCrypto(balance) + " Matic"
  });
  /*
  getContractBalance((balance) => {
    console.log("Contract balance: " + balance)
  });

  getLinkBalance((balance) => {
    console.log("Link balance: " + balance)
  });
  */
}

var display_click_count_poller = setInterval(poll,500)

function _disconnectWallet() {
  disconnectWallet()
}

function onAClicked() {
  onRoll("0")
}

function onBClicked() {
  onRoll("1")
}

function onBetAmountUpdate() {
  current_amount = document.getElementById('bet_amount').value
}

window._disconnectWallet = _disconnectWallet;
window.onAClicked = onAClicked;
window.onBClicked = onBClicked;
window.onBetAmountUpdate = onBetAmountUpdate;