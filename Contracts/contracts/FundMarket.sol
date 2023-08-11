// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IFundMarket.sol";
import "./FundToken.sol";

 contract FundMarket is FundToken  {
  /**
   * Constructior for deployment of the Market Fund
   * @param wusdc_  Stable coin Address
   * @param baseTokenPrice_  Base Token Price
   * @param tokenName_ Name of the Fund token
   * @param ticker_ Symbol of the fund token
   */
  constructor(
    address wusdc_,
    uint256 baseTokenPrice_, 
    string memory tokenName_, 
    string memory ticker_) 
    FundToken( wusdc_,tokenName_, ticker_) 
  {
   
    baseTokenPrice = baseTokenPrice_;
  } 

  function getWUSDCBalance() public view onlyFundAdmin returns (uint256) {
    return IERC20(WUSDC).balanceOf(address(this));
  }

  function setBaseTokenPrice(uint256 _baseTokenPrice) public onlyFundAdmin() {
    baseTokenPrice = _baseTokenPrice;
  }
 // For getting token amount for given WUSDC
 // NOTE: We are multiplying with 10 ** 18 because we are using 18 decimals for WUSDC
  function getTokensAmountForGivenWUSDC(uint256 _amount) public view returns(uint256){
       return (_amount / baseTokenPrice) * 10 **18;
  }
  // For getting WUSDC amount for given token amount
  // NOTE: We are dividing with 10 ** 18 because we are using 18 decimals for WUSDC
  function getWUSDCAmountForGivenFundBalance(uint256 _fundTokenAmount) public view returns(uint256){
    return (_fundTokenAmount * baseTokenPrice) / 10 **18;
  }

  function purchaseFund(uint256 _amount) public onlyShareHolder onlyHigherThenZero(_amount) returns (uint256){
    require(IERC20(WUSDC).balanceOf(msg.sender) >= _amount, ERROR_NOT_ENOUGH_FUNDS);
    require(IERC20(WUSDC).allowance(msg.sender, address(this)) >= _amount, ERROR_NOT_ENOUGH_ALLOWANCE);
    // Transfer tokens from user to contract
    require(IERC20(WUSDC).transferFrom(msg.sender, address(this), _amount), ERROR_TRANSFER_FAILED);
    // Increase the transaction id
    txId += 1;
    //Determine number of tokens need to be minted
    uint256 _tokensToMint = getTokensAmountForGivenWUSDC(_amount);
    // Mint tokens to user
    _mint(msg.sender, _tokensToMint);
    uint256 timeStamp = block.timestamp;
    // Add transaction to the storage
    transactionDetails[txId] = TransactionDetails(TransctionType.PURCHASE, _amount, _tokensToMint, timeStamp );
    // Add Transacton to the user Transactions
    userTransactions[msg.sender].push(txId);
    //Update user in Holding set
    _updateUserInHoldingSet(msg.sender);
    // Emits the event after the purchase
    emit FundPurchased(msg.sender,txId, _amount, _tokensToMint, timeStamp);
    // return _amount;
    return txId;
  }
  function liquidateFund(uint256 _tokenAamount) public onlyShareHolder onlyHigherThenZero(_tokenAamount) returns (uint256){
    // Check if the user has enough balance
    require(balanceOf(msg.sender) >= _tokenAamount, ERROR_NOT_ENOUGH_SHARES);
    
    // Calculate how many WUSDC he might get for the privided amount
    uint256 wusdcAmount = getWUSDCAmountForGivenFundBalance(_tokenAamount);
    
    // Check if the smart contract does have enough Stablecoins
    require(IERC20(WUSDC).balanceOf(address(this)) >= wusdcAmount, "Fund Doens't have enough balance");

    // Get Transaction ID 
    txId+=1;
    // Burn Fund Tokens 
    _burn(msg.sender, _tokenAamount);
    // Update user in the SharesholderWithHolding Set
    _updateUserInHoldingSet(msg.sender);
    // Transfer WUSDC back to the user
    require(IERC20(WUSDC).transfer(msg.sender, wusdcAmount), ERROR_TRANSFER_FAILED);
     uint256 timeStamp = block.timestamp;

    // Add Transaction to the storage 
    transactionDetails[txId] = TransactionDetails(TransctionType.LIQUIDATION, wusdcAmount, _tokenAamount, timeStamp);
    // Add Transaction to the user Transactions
    userTransactions[msg.sender].push(txId);
    // Emit Event After Liquidation 
    emit FundLiquidated(msg.sender,txId, _tokenAamount, wusdcAmount,timeStamp);
    // Return Transaaction ID.
    return txId; 

  }
  function fullLiquidationOfFund() public onlyShareHolder returns (uint256){
    
    // Get users full fund balance
    uint256 userFundBalance = balanceOf(msg.sender);
      // Check if the user has enough balance
    require(userFundBalance  > 0, ERROR_NOT_ENOUGH_SHARES);
    
    // Calculate how many WUSDC he might get for the privided amount
    uint256 wusdcAmount = getWUSDCAmountForGivenFundBalance(userFundBalance);
    
    // Check if the smart contract does have enough Stablecoins
    require(IERC20(WUSDC).balanceOf(address(this)) >= wusdcAmount, "Fund Doens't have enough balance");

    // Get Transaction ID 
    txId+=1;
    // Burn Fund Tokens 
    _burn(msg.sender, userFundBalance);
    // Update user in the SharesholderWithHolding Set
    _updateUserInHoldingSet(msg.sender);
    // Transfer WUSDC back to the user
    require(IERC20(WUSDC).transfer(msg.sender, wusdcAmount), ERROR_TRANSFER_FAILED);
     uint256 timeStamp = block.timestamp;
    // Add Transaction to the storage 
    transactionDetails[txId] = TransactionDetails(TransctionType.FULL_LIQUIDATION, wusdcAmount, userFundBalance, timeStamp);
    // Add Transaction to the user Transactions
    userTransactions[msg.sender].push(txId);
    // Emit Event After Liquidation 
    emit FundLiquidated(msg.sender,txId, userFundBalance, wusdcAmount,timeStamp);
    // Return Transaaction ID.
    return txId; 
  }

  /**
   * For distributing dividents. 
   * @param _rate The current rate to calculate divident distribution 
   * @param _price The price for the sahre
   * 
   * Divident For User  = (User Balance * Rate)/Price
   * 
   * NOTE: This only works when the users number is small
   * and this doen't work in production 
   */
    function distributeDividend( int256 _rate, uint256 _price) public onlyFundAdmin  {
      uint256 totalShareholders = _getShareholdersCountWithShares();

      // Loop through each shareholder and mint Fund tockens according
      // To the provide _rate and _price
      for(uint i = 0; i < totalShareholders; i++){
         address user = _getShareholderAt(i);
         _processDividentForUser(user, _rate, _price);
      }

   }

   function _processDividentForUser(address _account, int256 _rate, uint256 _price) private{
    // Calculate the divident amount
     uint256 dividentAmount = balanceOf(_account) *  uint256(abs(_rate));
     uint256 dividentShares = dividentAmount/ _price;
     // IF the divident amount is > 0
     if(dividentShares > 0){
      // Distribute dividents
      _mint(_account, dividentShares);
     }
     
  }
}

