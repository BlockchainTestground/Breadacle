// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./dependencies/VRFConsumerBase.sol";

contract DiceGame is VRFConsumerBase {
  address owner;
  uint256 public bet_percentage_fee = 10;
  uint256 public minimum_bet = 0;
  uint256 public maximum_bet = 100 ether;

  enum Status { Finished, WaitingForOracle }
  enum Result { Pending, PlayerWon, PlayerLost }
  struct Game {
    address player;
    uint256 bet_amount;
    Result result;
    uint256 selection;
  }

  event GameResult(
    address indexed player,
    Result indexed result,
    uint256 bet_amount,
    uint256 transfered_to_player
  );

  // Chainlink internal setup
  bytes32 internal keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
  uint256 internal fee = 0.0001 * 10 ** 18;

  // Random handlers
  mapping(bytes32 => Game) public games;
  mapping(address => Status) public player_status;
  mapping(address => bytes32) public player_request_id;

  constructor()
  public
  VRFConsumerBase(
    0x8C7382F9D8f56b33781fE506E897a4F1e2d17255 /* VRF Coordinator */,
    0x326C977E6efc84E512bB9C30f76E30c160eD06FB /* Link Mumbai Token Contract */)
  {
    owner = msg.sender;
  }

  function roll(uint256 userProvidedSeed, uint256 selection) public payable returns (bytes32 _requestId)
  {
    require(LINK.balanceOf(address(this)) > fee, "Not enough LINK - fill contract with faucet");
    require(msg.value <= address(this).balance, "Not enough matic liquidity on the contract");
    require(msg.value <= minimum_bet, "Bet must be above minimum");
    require(msg.value >= maximum_bet, "Bet must be below maximum");

    bytes32 requestId = requestRandomness(keyHash, fee, userProvidedSeed);

    games[requestId].player = msg.sender;
    games[requestId].bet_amount = msg.value;
    games[requestId].selection = selection;
    player_status[msg.sender] = Status.WaitingForOracle;
    player_request_id[msg.sender] = requestId;

    return requestId;
  }

  function fulfillRandomness(bytes32 requestId, uint256 randomnes) internal override
  {
    address player = games[requestId].player;
    uint256 transfered_to_player = 0;
    
    if(randomnes%2 == games[requestId].selection)
    {
      games[requestId].result = Result.PlayerWon;
    }else
    {
      games[requestId].result = Result.PlayerWon;
    }

    if(games[requestId].result == Result.PlayerWon)
    {
      transfered_to_player = games[requestId].bet_amount * bet_percentage_fee / 10000;
      payable(player).transfer(
        transfered_to_player
      );
    }
    player_status[player] = Status.Finished;

    emit GameResult(
      player,
      games[requestId].result,
      games[requestId].bet_amount,
      transfered_to_player
    );
  }

  // Owner functions
  modifier isOwner()
  {
    require(msg.sender == owner, "You must the the owner");
    _;
  }
  
  function retrieveFunds(uint256 amount) public isOwner()
  {
    payable(msg.sender).transfer(amount);
  }

  function setOwner(address new_owner) public isOwner()
  {
    owner = new_owner;
  }

  function setMinimumBet(uint256 amount) public isOwner()
  {
    minimum_bet = amount;
  }

  function setMaximumBet(uint256 amount) public isOwner()
  {
    maximum_bet = amount;
  }

  // Misc
  fallback() external payable {}
  receive() external payable {}
  
  function getLinkBalance() public view returns(uint256)
  {
    return LINK.balanceOf(address(this));
  }
}