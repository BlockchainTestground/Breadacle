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
  parent: "phaser-example",
  width: 800,
  height: 600,
  dom: {
    createContainer: true
  },
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
var ui_text
var current_request_id = null
var current_amount = "0.1"
var matic_balance
var amount_form_html

function preload() {
  this.load.image("logo", logoImg)
  this.load.image('a', './src/assets/a.png')
  this.load.image('b', './src/assets/b.png')
  this.load.image('rules_button', './src/assets/rules_button.png')
  this.load.html('amount_form_html', './src/assets/html/amount.html');
  this.load.html('rules_html', './src/assets/html/rules.html');

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

  ui_text = this.add.text(0, 50, '', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });
  matic_balance = this.add.text(0, 0, '', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif' });

  amount_form_html = this.add.dom(600, 200).createFromCache('rules_html');
  amount_form_html.visible = false
  var element = this.add.dom(120, 100).createFromCache('amount_form_html');
  element.addListener('input');
  element.on('input', function (event) {
    current_amount = document.getElementById('bet_amount').value;
  });

  this.BtnA = this.add.sprite(60, 200, 'a').setInteractive();
  this.BtnA.on('pointerdown', function (event) {
    onRoll("0")
  });

  this.BtnB = this.add.sprite(150, 200, 'b').setInteractive();
  this.BtnB.on('pointerdown', function (event) {
    onRoll("1")
  });

  this.rulesBtn = this.add.sprite(650, 50, 'rules_button').setInteractive();
  this.rulesBtn.on('pointerdown', function (event) {
    amount_form_html.visible = !amount_form_html.visible
  });
}

function onRoll(selection)
{
  ui_text.text = "Waiting confirmation"
  roll("123", selection, current_amount, () => {
    ui_text.text = "Waiting oracle"
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
      }
      if(game.result == Result.PlayerLost)
      {
        console.log("Player lost")
        ui_text.text = "Player lost"
      }
    });
  }

  getBalance((balance) => {
    matic_balance.text = convertWeiToCrypto(balance) + " Matic"
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
window._disconnectWallet = _disconnectWallet;