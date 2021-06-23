import Phaser from "phaser";
import dragonBones from "./external/dragonBones";
import { roll,
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
  getMinimumBet
} from "./blockchain/contract_interaction";
import animationTrigger from './AnimationTriggers';
const Result = {
  Pending: 0,
  PlayerWon: 1,
  PlayerLost: 2
}

const config = {
  type: Phaser.AUTO,
  parent: "phaser_canvas",
  width: 1080,
  height: 1080,
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
    create: create,
    update: update
  },
  physics:{
    default: 'arcade',
    arcade: { debug: false }
  }
};

const game = new Phaser.Game(config);
var balance_text
var current_request_id = null
var arm
var arm2
var steam_emitter
var coins_to_emit = 0
var coins_emission_frequency = 5
var coins = []
var _this

function preload() {
  this.load.image('steam', './src/assets/steam.png')
  this.load.spritesheet('coin', './src/assets/coin.png', { frameWidth: 16, frameHeight: 16 });

  this.load.dragonbone(
      animationTrigger.throne.name,
      "src/assets/DragonBonesFiles/Throne/Throne_tex.png",
      "src/assets/DragonBonesFiles/Throne/Throne_tex.json",
      "src/assets/DragonBonesFiles/Throne/Throne_ske.json",
  );

  this.load.dragonbone(
    animationTrigger.toaster.name,
    "src/assets/DragonBonesFiles/OracleToaster/Toaster_tex.png",
    "src/assets/DragonBonesFiles/OracleToaster/Toaster_tex.json",
    "src/assets/DragonBonesFiles/OracleToaster/Toaster_ske.json",
);
}

function create() {
  _this = this
  arm2 = this.add.armature("Armature", animationTrigger.throne.name);
  arm2.x = 400;
  arm2.y = 300;
  arm2.animation.play(animationTrigger.throne.animations.throne_idle);

  arm = this.add.armature("Armature", animationTrigger.toaster.name);
  console.log(dragonBones.EventObject)
  arm.addDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, animationLoopCompleteCallback, this);
  arm.x = 400;
  arm.y = 375;
  arm.animation.play(animationTrigger.toaster.animations.idle);

  balance_text = this.add.text(0, 50, 'Balance', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', color: "#000" });

  setConfirmTransactionCallback(() =>
  {
    arm.animation.play(animationTrigger.toaster.animations.tx_init)
  })

  var steam_particles = this.add.particles('steam');
  steam_emitter = steam_particles.createEmitter({
      x: 400,
      y: 300,
      speed: 200,
      scaleX: 0.5,
      scaleY: 1,
      gravityY: -200
  });
  steam_emitter.stop()

  this.anims.create({
    key: 'coin_animation',
    frameRate: 7,
    frames: _this.anims.generateFrameNumbers("coin", { start: 0, end: 11 }),
    repeat: -1
  });
}

function emitCoins(_coins_to_emit, _coins_emission_frequency)
{
  coins_to_emit = _coins_to_emit
  coins_emission_frequency = _coins_emission_frequency
}

function update(time, delta) {
  if(coins_to_emit > 0)
  {
    if(time % coins_emission_frequency)
    {
      emitCoin()
    }
    coins_to_emit -= 1
  }

  if(coins.length == 140)
  {
    coins[0].destroy()
    coins.shift()
  }
}

function emitCoin()
{
  var random_velocoty_x = Math.floor(Math.random() * 600)
  var random_velocity_y = Math.floor(Math.random() * 600)

  var random_x = 350 + Math.floor(Math.random() * 100)
  var random_y = 350 + Math.floor(Math.random() * 100)

  let sprite=_this.physics.add.sprite(random_x, random_y,"coin");

  sprite.setVelocityX(random_velocoty_x);
  sprite.setVelocityY(random_velocity_y);
  sprite.setGravityX(-200 - random_velocoty_x);
  sprite.setGravityY(-200 - random_velocity_y);

  sprite.play('coin_animation');

  coins.push(sprite)
}

function animationLoopCompleteCallback(event)
{
  switch(event.animationState.name) {
    case animationTrigger.toaster.animations.tx_init:
      arm.animation.play(animationTrigger.toaster.animations.tx_loop);
      break;
    case animationTrigger.toaster.animations.oracle_init:
      arm.animation.play(animationTrigger.toaster.animations.oracle_loop);
      steam_emitter.start(false, 5000, 100)
      break;
    case animationTrigger.toaster.animations.eject_normal_toast:
      arm.animation.play(animationTrigger.toaster.animations.discard_normal);
      break;
    case animationTrigger.toaster.animations.eject_burn_toast:
      arm.animation.play(animationTrigger.toaster.animations.discard_burn);
      break;
    case animationTrigger.toaster.animations.discard_burn:
      arm.animation.play(animationTrigger.toaster.animations.idle);
      break;
    case animationTrigger.toaster.animations.discard_normal:
      arm.animation.play(animationTrigger.toaster.animations.idle);
      break;
  }
}

function setStatusText(text, is_error)
{
  document.getElementById('status').innerHTML = text
  if(is_error)
    document.getElementById("status").style.color = "#FF0000";
  else
    document.getElementById("status").style.color = "#000000";
}

function onRoll(selection)
{
  setStatusText("Waiting confirmation", false)
  arm.animation.play(animationTrigger.toaster.animations.set_bet);
  roll(selection, document.getElementById('bet_amount').value, (success) => {
    if(!success)
    {
      setStatusText("Error: Transaction reverted", true)
      return
    }
    setStatusText("Waiting for oracle", false)
    arm.animation.play(animationTrigger.toaster.animations.oracle_init);
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
      if(game.result == Result.Pending)
        console.log("Pending...")
      else
      {
        current_request_id = null
        steam_emitter.stop()
        if((game.selection == 0 && game.result == Result.PlayerWon)
          || (game.selection == 1 && game.result == Result.PlayerLost))
        {
          arm.animation.play(animationTrigger.toaster.animations.eject_normal_toast);
        }else
        {
          arm.animation.play(animationTrigger.toaster.animations.eject_burn_toast);
        }
        if(game.result == Result.PlayerWon)
        {
          emitCoins(100, 10)
          setStatusText("You won!", false)
        }
        if(game.result == Result.PlayerLost)
        {
          setStatusText("You lost", false)
        }
      }
    });
  }

  getBalance((balance) => {
    balance_text.text = Number(convertWeiToCrypto(balance)).toFixed(2) + " Matic"
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

function onMaxClicked() {
  document.getElementById('bet_amount').value = convertWeiToCrypto(getMaximumBet())
}

function onMinClicked() {
  document.getElementById('bet_amount').value = convertWeiToCrypto(getMinimumBet())
}

window._disconnectWallet = _disconnectWallet;
window.onAClicked = onAClicked;
window.onBClicked = onBClicked;
window.onMaxClicked = onMaxClicked;
window.onMinClicked = onMinClicked;

// Modal handlers
var container = document.getElementById('container');
var rules_modal_card = document.getElementById('rules_modal_card');
var rules_button = document.getElementById('rules_button');