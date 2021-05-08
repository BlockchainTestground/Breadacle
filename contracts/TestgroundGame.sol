// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./MyERC20.sol";
import "./dependencies/VRFConsumerBase.sol";

contract TestgroundGame is VRFConsumerBase {
  MyERC20 testground_token = MyERC20(0xd6d897b8FBF9b82c493dc256A2924bE41efda34f);









  bytes32 internal keyHash;
  uint256 internal fee;

  mapping(bytes32 => address) public requestIdToMsgSender;
  mapping(address => uint256) public msgSenderToResult;
  mapping(bytes32 => uint256) public requestIdToRandomNumber;



  constructor()
  public
  VRFConsumerBase(0x8C7382F9D8f56b33781fE506E897a4F1e2d17255, 0x326C977E6efc84E512bB9C30f76E30c160eD06FB)
  {
    keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
    fee = 0.0001 * 10 ** 18;
  }

  function approvee() public returns (bytes32 _requestId) {
    testground_token.approve(address(this), 500000000000000000000000);
  }

    function approveOtherContractt(address recipient) public {
      IERC20 token = MyERC20(0xd6d897b8FBF9b82c493dc256A2924bE41efda34f);
      token.approve(recipient, 100e18);
    }

  function roll(uint256 userProvidedSeed) public returns (bytes32 _requestId) {
    require(LINK.balanceOf(address(this)) > fee, "Not enough LINK - fill contract with faucet");
    bytes32 requestId = requestRandomness(keyHash, fee, userProvidedSeed);
    requestIdToMsgSender[requestId] = msg.sender;


    uint256 roll_price = 5000000000000000000;
    testground_token.approve(address(this), roll_price * 10);
    testground_token.transferFrom(msg.sender, address(this), roll_price);


    return requestId;
  }

  function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
    requestIdToRandomNumber[requestId] = randomness;
    msgSenderToResult[requestIdToMsgSender[requestId]] = randomness%6;
    if(randomness%6==5)
    {
      uint256 prize = 30000000000000000000;
      testground_token.transferFrom(address(this), requestIdToMsgSender[requestId], prize);
    }
  }
}