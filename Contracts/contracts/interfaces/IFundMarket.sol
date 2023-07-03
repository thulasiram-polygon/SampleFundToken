// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IFundMarket {
  
  function purchaseFund(address _user, uint256 _amount) external returns (uint256);
  function liquidateFund(address _user, uint256 _amount) external returns (uint256);
  function fullLiquidationOfFund(address _user) external returns (uint256);
  function distributeDividend(uint256 _rate, uint256 _price) external ;
}