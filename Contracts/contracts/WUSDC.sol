// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WUSDC is ERC20 {

  constructor(uint256 initialSupply_) ERC20("WUSDC Stable Coin", "WUSDC") {
    _mint(msg.sender, initialSupply_);
  }
}