import Phaser from "phaser";
import dragonBones from "./external/dragonBones";
import { roll, disconnectWallet, getPlayerStatus, getPlayerRequestId, getContractBalance, getLinkBalance, getHola } from "./blockchain/contract_interaction";
import logoImg from "./assets/logo.png";

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

function preload() {
  this.load.image("logo", logoImg);
  this.load.image('button', './src/assets/button.png');

  this.load.dragonbone(
      "x",
      "src/assets/NewProject_2_tex.png",
      "src/assets/NewProject_2_tex.json",
      "src/assets/NewProject_2_ske.json",
  );
}

function create() {

  const arm = this.add.armature("Armature", "x");
  arm.x = 400;
  arm.y = 300;
  arm.animation.play("animtion0");

  this.approveBtn = this.add.sprite(600, 500, 'button').setInteractive();
  this.approveBtn.on('pointerdown', function (event) {
    roll("123", "1", "0.001", (request_id) => {
      console.log(request_id)
    });
  });

}

function poll() {
  console.log("polling...")
  getPlayerStatus((status) => {
    console.log("Status: " + status)
  });

  getPlayerRequestId((request_id) => {
    console.log("Request id: " + request_id)
  });

  getContractBalance((balance) => {
    console.log("Contract balance: " + balance)
  });

  getLinkBalance((balance) => {
    console.log("Link balance: " + balance)
  });

  getHola((hola) => {
    console.log("Hla: " + hola)
  });
}

var display_click_count_poller = setInterval(poll,500)

function _disconnectWallet() {
  disconnectWallet()
}
window._disconnectWallet = _disconnectWallet;