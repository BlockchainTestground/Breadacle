import Phaser from "phaser";
import dragonBones from "./external/dragonBones";
import { roll, disconnectWallet, getPlayerRequestId, getContractBalance, getLinkBalance, getGame, convertWeiToCrypto, convertCryptoToWei } from "./blockchain/contract_interaction";
import logoImg from "./assets/logo.png";

const Result = {
  Pending: 0,
  PlayerWon: 1,
  PlayerLost: 2
}

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  plugins: {
    scene: [
      { key: "DragonBones", plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin, mapping: "dragonbone" } // setup DB plugin
    ]
  },
  scene: {
    preload: preload,
    create: create
  }
};

const game = new Phaser.Game(config);
var button
var current_request_id = null

function preload() {
  this.load.image("logo", logoImg);
  this.load.image('button', './src/assets/button.png');

  this.load.dragonbone(
      "x",
      "src/assets/DragonBonesFiles/AjoloteAlien_tex.png",
      "src/assets/DragonBonesFiles/AjoloteAlien_tex.json",
      "src/assets/DragonBonesFiles/AjoloteAlien_ske.json",
  );
}

function create() {

  const arm = this.add.armature("Armature", "x");
  arm.x = 400;
  arm.y = 300;
  arm.animation.play("animtion0");

  this.approveBtn = this.add.sprite(600, 500, 'button').setInteractive();
  this.approveBtn.on('pointerdown', function (event) {
    roll("123", "1", "0.01", () => {
      getPlayerRequestId((request_id) => {
        current_request_id = request_id
        console.log(current_request_id)
      });
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
        console.log("Player won")
      if(game.result == Result.PlayerLost)
        console.log("Player lost")
    });
  }
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
window._disconnectWallet = _disconnectWallet;