// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./MyERC20.sol";
import "./dependencies/VRFConsumerBase.sol";

contract TestgroundGame is VRFConsumerBase {
  address owner;
  uint256 roll_percentage_fee = 10;
  enum Status { Finished, WaitingForOracle }
  struct Game {
    address player;
    uint256 random_number;
    uint256 roll_amount;
    uint256 selection;
  }

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

  function roll(uint256 userProvidedSeed, uint256 selection) public payable returns (bytes32 _requestId) {
    require(LINK.balanceOf(address(this)) > fee, "Not enough LINK - fill contract with faucet");
    require(msg.value <= address(this).balance, "Not enough matic liquidity on the contract");

    bytes32 requestId = requestRandomness(keyHash, fee, userProvidedSeed);

    games[requestId].player = msg.sender;
    games[requestId].roll_amount = msg.value;
    games[requestId].selection = selection;
    player_status[msg.sender] = Status.WaitingForOracle;
    player_request_id[msg.sender] = requestId;

    return requestId;
  }

  function fulfillRandomness(bytes32 requestId, uint256 randomnes) internal override {
    games[requestId].random_number = randomnes;
    player_status[msg.sender] = Status.Finished;
  }

  function retrieveFunds(uint256 amount) public {
    require(msg.sender == owner, "Only the owner can call this");
    payable(msg.sender).transfer(amount);
  }
}