// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract FundToken is ERC20, AccessControlEnumerable {
  using EnumerableSet for EnumerableSet.AddressSet;
 
  // 
  address internal FUND_ADMIN;

 // Allowed Stable Coin to purchase and liqidation
  address public immutable WUSDC;
  uint256 public baseTokenPrice;
  uint256 public txId;

  // Shareholders With Holdings 
  EnumerableSet.AddressSet internal shareHolderWithHoldings;

  // Transaction Details
  mapping(uint256 => TransactionDetails) internal transactionDetails;
  // User Transactions
  mapping(address => uint256[]) internal userTransactions;

  // Enums
  enum TransctionType{
    PURCHASE,
    LIQUIDATION,
    DIVIDEND_DISTRIBUTION,
    FULL_LIQUIDATION
  }

  // Structs
  struct TransactionDetails{
    TransctionType txType;
    uint256 wusdc_amount;
    uint256 fund_tokens;
    uint256 date;
  }

  struct UserTransacton{
    uint256 txId;
    TransactionDetails txDetails;
  }

  struct UserDetails{
    address account;
    uint256 fundBalance;
    UserTransacton[] transactions;
  }

  
  // Roles
  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
  bytes32 public constant FUND_ADMIN_ROLE = keccak256("FUND_ADMIN_ROLE");
  bytes32 public constant SHAREHOLDER_ROLE = keccak256("SHAREHOLDER_ROLE");

  // Errors
  string internal constant ERROR_NOT_FUND_ADMIN = "NOT_FUND_ADMIN";
  string internal constant ERROR_NOT_SHAREHOLDER = "NOT_SHAREHOLDER";
  string internal constant ERROR_NOT_ENOUGH_ALLOWANCE = "NOT_ENOUGH_ALLOWANCE";
  string internal constant ERROR_NOT_ENOUGH_SHARES = "NOT_ENOUGH_SHARES";
  string internal constant ERROR_NOT_ENOUGH_FUNDS = "NOT_ENOUGH_FUNDS";
  string internal constant ERROR_INVALID_AMOUNT = "INVALID_AMOUNT";
  string internal constant ERROR_INVALID_ADDRESS = "INVALID_ADDRESS";
  string internal constant ERROR_ALREADY_WHITELISTED = "ALREADY_WHITELISTED";
  string internal constant ERROR_NOT_WHITELISTED = "NOT_WHITELISTED";
  string internal constant ERROR_TRANSFER_FAILED = "ERROR_TRANSFER_FAILED";



  // Modifiers
  modifier onlyOwner() {
    require(hasRole(ADMIN_ROLE, msg.sender), "NOT_OWNER");
    _;
  }

  modifier onlyShareHolder() {
    require(hasRole(SHAREHOLDER_ROLE, msg.sender), ERROR_NOT_SHAREHOLDER);
    _;
  }

  modifier onlyFundAdmin() {
    require(hasRole(FUND_ADMIN_ROLE, msg.sender), ERROR_NOT_FUND_ADMIN);
    _;
  }

  modifier onlyHigherThenZero(uint256 _amount) {
    require(_amount > 0, ERROR_INVALID_AMOUNT);
    _;
  }
  // Events
  event ShareholderAdded(address indexed account);
  event ShareholderRemoved(address indexed account);
  event FundPurchased(
    address indexed account,
    uint256 indexed transactionId,
    uint256 wusdc_amount,
    uint256 fund_tokens,
    uint256 timeStamp
  );
  event FundLiquidated(
    address indexed account,
    uint256 indexed transactionId,
    uint256 fund_tokens,
    uint256 wusdc_amount,
    uint256 timeStamp
  );

  


  // Constructor
  // @param name_ - Name of the token
  // @param symbol_ - Symbol of the token
  // By default the deployer is the admin and fund admin
  constructor(  address wusdc_, string memory name_, string memory symbol_) ERC20(name_, symbol_) {
     WUSDC = wusdc_;
     _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
     _setupRole(ADMIN_ROLE, msg.sender);
     // Default fund admin is the deployer
     FUND_ADMIN = msg.sender;
     _setupRole(FUND_ADMIN_ROLE, msg.sender);
  
     _setRoleAdmin(SHAREHOLDER_ROLE, FUND_ADMIN_ROLE);
  }

  // ****** Admin Functions ****** //

  // Change the fund admin
  // @param newAdmin - Address of the new fund admin
  function changeFundAdmin(address _newAdmin) public  onlyOwner() {
    require(_newAdmin != address(0), "INVALID_ADDRESS");
    revokeRole(FUND_ADMIN_ROLE, FUND_ADMIN);
    FUND_ADMIN = _newAdmin;
    grantRole(FUND_ADMIN_ROLE, _newAdmin);
    _setRoleAdmin(SHAREHOLDER_ROLE, FUND_ADMIN_ROLE);
    
 
  }

  function getFundAdmin() public view returns(address){
    return FUND_ADMIN;
  }

  // ****** Fund Admin Functions ****** //
  // Add a new shareholder
  function addShareHolder(address _shareholder) public onlyFundAdmin() {
    require(_shareholder != address(0), "INVALID_ADDRESS");
    require(!isWhitelistedShareholder(_shareholder), "ALREADY_WHITELISTED");  
    grantRole(SHAREHOLDER_ROLE, _shareholder);
    emit ShareholderAdded(_shareholder);
  }

  // Remove a shareholder
  function removeShareHolder(address _shareholder) public onlyFundAdmin() {
    require(_shareholder != address(0), "INVALID_ADDRESS");
    require(isWhitelistedShareholder(_shareholder), "NOT_WHITELISTED");
    revokeRole(SHAREHOLDER_ROLE, _shareholder);
    emit ShareholderRemoved(_shareholder);
  }


  // ****** Shareholder Functions ****** //
  

 function _updateUserInHoldingSet(address _account) internal {
  if(balanceOf(_account) > 0){
    shareHolderWithHoldings.add(_account);
  }else{
    shareHolderWithHoldings.remove(_account);
  }
 }

  // ********* Helper Functions ********* //
  function _getShareholderAt(uint256 _index) internal view returns(address){
    return shareHolderWithHoldings.at(_index);
  }

  function _getShareholdersCountWithShares() internal view returns(uint256){
    return shareHolderWithHoldings.length();
  }

  // Get total supply of fund tokens
  function getTotalFundShares() internal view returns(uint256){
    return totalSupply();
  }

  

  function getWhiteListedShareholders() public view returns(address[] memory){
    uint256 length = getRoleMemberCount(SHAREHOLDER_ROLE);
    address[] memory shareholders = new address[](length);
    for(uint256 i = 0; i < length; i++){
      shareholders[i] = getRoleMember(SHAREHOLDER_ROLE, i);
    }
    return shareholders;
  }

  function isShareholderHasHoldings(address _shareholder) external view returns(bool){
    return shareHolderWithHoldings.contains(_shareholder);
  }

  function getShareholderHoldings(address _shareholder) external view returns(uint256){
    return balanceOf(_shareholder);
  }

   function getShareholderTransactionsCount(address _shareholder) public view returns(uint256){
    
   return userTransactions[_shareholder].length;
     
  }

  // Structs
  // struct TransactionDetails{
  //   TransctionType txType;
  //   uint256 wusdc_amount;
  //   uint256 fund_tokens;
  //   uint256 date;
  // }

  function getShareholderTransactions(address _shareholder) public view returns(UserTransacton[] memory){

    uint256 userTxsCount = getShareholderTransactionsCount(_shareholder);
     UserTransacton[] memory userTxns = new UserTransacton[](userTxsCount);
     
     for(uint i = 0; i < userTxsCount; i++){
      uint256 tId = userTransactions[_shareholder][i];
      userTxns[i].txId = tId;
      userTxns[i].txDetails.txType = transactionDetails[tId].txType;
      userTxns[i].txDetails.wusdc_amount = transactionDetails[tId].wusdc_amount;
      userTxns[i].txDetails.fund_tokens = transactionDetails[tId].fund_tokens;
      userTxns[i].txDetails.date = transactionDetails[tId].date;
    }

    return userTxns;
  }
// struct UserDetails{
//     address account;
//     uint256 fundBalance;
//     UserTransacton[] transactions;
//   }
  function getShareHoldersInfo() public view returns(UserDetails[] memory){
    uint256 shareHodersCount = shareHolderWithHoldings.length();
    UserDetails[] memory _usersDetails = new UserDetails[](shareHodersCount);

    for( uint i = 0; i < shareHodersCount; i++){
      address _userAddress = shareHolderWithHoldings.at(i);
      _usersDetails[i].account = _userAddress;
      _usersDetails[i].fundBalance = balanceOf(_userAddress);
      _usersDetails[i].transactions = getShareholderTransactions(_userAddress);
    }
    return _usersDetails;

  }
  // To check if the user has whitelisted as a shareholder
  function isWhitelistedShareholder(address _shareholder) public view returns(bool){
    return hasRole(SHAREHOLDER_ROLE, _shareholder);
  }

  function abs(int x) internal pure returns (int) {
        return x >= 0 ? x : -x;
    }


}