// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WUSDC is ERC20 {

  constructor(uint256 initialSupply_) ERC20("WUSDC Stable Coin", "WUSDC") {
    _mint(msg.sender, initialSupply_);
  }

  function mintForMe(uint256 _amount) public{
    require(msg.sender != address(0), "NOT A VALID ADDRESS");
    require(_amount > 0, "NOT A VALID AMOUNT");
    _mint(msg.sender, _amount);
  }
}