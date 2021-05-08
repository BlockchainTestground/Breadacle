// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./dependencies/ERC20.sol";

contract MyERC20 is ERC20 {
  constructor (string memory name, string memory symbol) public
    ERC20(name, symbol)
  {
    _mint(msg.sender, 101 * 10 ** uint(decimals()));
  }

  function burn(uint256 amount) public {
      _burn(msg.sender, amount);
  }

  function mint(uint256 amount) public {
    _mint(msg.sender, amount);
  }
}