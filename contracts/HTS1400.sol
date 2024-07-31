// SPDX-License-Identifier: Apache-2.0
/*
 * This code has not been reviewed.
 * Do not use or deploy this code before reviewing it personally first.
 */
pragma solidity ^0.8.20;

import "./libraries/KindMath.sol";
import "./libraries/SafeMath.sol";
import "./libraries/SafeCast.sol";
import "./libraries/Bits.sol";

import './base/SafeHederaTokenService.sol';

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IHTS1400.sol";

contract HTS1400 is IHTS1400, Ownable, SafeHederaTokenService {
    
    using SafeMath for uint256; 
    using SafeCast for uint256;
    using Bits for uint;

    // Represents a fungible set of tokens.
    struct Partition {
        uint256 amount;
        bytes32 partition;
    }

    // ------------- ERC1410 state variables -------------
    // Mapping from investor to their partitions
    mapping (address => Partition[]) partitions;

    // Mapping from (investor, partition) to index of corresponding partition in partitions
    // @dev Stored value is always greater by 1 to avoid the 0 value of every index
    mapping (address => mapping (bytes32 => uint256)) partitionToIndex;

     // Mapping from (investor, partition, operator) to approved status
    mapping (address => mapping (bytes32 => mapping (address => bool))) partitionApprovals;

    // Mapping from (investor, operator) to approved status (can be used against any partition)
    mapping (address => mapping (address => bool)) approvals;

    // ------------- ERC1594 state variables -------------
    // Variable which tells whether issuance is ON or OFF forever
    // Implementers need to implement one more function to reset the value of `issuance` variable
    // to false. That function is not a part of the standard (EIP-1594) as it is depend on the various factors
    // issuer, followed compliance rules etc. So issuers have the choice how they want to close the issuance. 
    bool internal issuance = true;

    // ------------- ERC1643 state variables -------------
    struct Document {
        bytes32 docHash; // Hash of the document
        uint256 lastModified; // Timestamp at which document details was last modified
        string uri; // URI of the document that exist off-chain TODO: use address of hedera file service location
    }

    // mapping to store the documents details in the document
    mapping(bytes32 => Document) internal _documents;
    // mapping to store the document name indexes
    mapping(bytes32 => uint256) internal _docIndexes;
    // Array use to store all the document name present in the contracts
    bytes32[] _docNames;

    // ------------- ERC1644 state variables -------------
    // Address of the controller which is a delegated entity
    // Roles: document control, authority to remove/transfer tokens without consent, issue
    // set by the issuer/owner of the token
    address public controller;

    // Default partition for ERC20 compatibility
    bytes32 internal _defaultPartition;

    // ------------- Hedera Security Token Address -------------
    address public token;

    // note: owner roles: update token keys, kyc users

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        string memory _tokenMemo,
        int32 _decimals,
        address _initOwner,
        address _controller,
        bytes32 _defaultPartition_
    ) payable Ownable(_initOwner) {
        uint256 keyType;
        IHederaTokenService.KeyValue memory keyValue;
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](7);

        for (uint8 i = 0; i < 7; i++) { // set all the keys to this contract
            keyType = keyType.setBit(i);
            keyValue.contractId = address(this);
            keys[i] = IHederaTokenService.TokenKey(keyType, keyValue);
        }

        IHederaTokenService.Expiry memory expiry;
        expiry.autoRenewAccount = address(this);
        expiry.autoRenewPeriod = 8000000;

        IHederaTokenService.HederaToken memory myToken;
        myToken.name = _tokenName;
        myToken.symbol = _tokenSymbol;
        myToken.memo = _tokenMemo;
        myToken.treasury = address(this);
        myToken.expiry = expiry;
        myToken.tokenKeys = keys;
        myToken.freezeDefault = true;

        (int responseCode, address _token) =
        HederaTokenService.createFungibleToken(myToken, 0, _decimals);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }

        token = _token; 
        controller = _controller;
        _defaultPartition =_defaultPartition_;
    }

    // ERC1410 Basic

    function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256) {
        if (_validPartition(_partition, _tokenHolder))
            return partitions[_tokenHolder][partitionToIndex[_tokenHolder][_partition] - 1].amount;
        else
            return 0;
    }

    function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory) {
        bytes32[] memory partitionsList = new bytes32[](partitions[_tokenHolder].length);
        for (uint256 i = 0; i < partitions[_tokenHolder].length; i++) {
            partitionsList[i] = partitions[_tokenHolder][i].partition;
        } 
        return partitionsList;
    }

    function transferByPartition(bytes32 _partition, address _to, uint256 _value, bytes calldata _data) external returns (bytes32) {
        // Add a function to verify the `_data` parameter
        // TODO: Need to create the bytes division of the `_partition` so it can be easily findout in which receiver's partition
        // token will transfered. For current implementation we are assuming that the receiver's partition will be same as sender's
        // as well as it also pass the `_validPartition()` check. In this particular case we are also assuming that reciever has the
        // some tokens of the same partition as well (To avoid the array index out of bound error).
        // Note- There is no operator used for the execution of this call so `_operator` value in
        // in event is msg.sender same for the `_operatorData`
        _transferByPartition(msg.sender, _to, _value, _partition, _data, msg.sender, "");
        return _partition; // ?
    }

    function canTransferByPartition(address _from, address _to, bytes32 _partition, uint256 _value, bytes calldata _data) external view returns (bytes1, bytes32, bytes32) {
        // TODO: Applied the check over the `_data` parameter
        if (!_validPartition(_partition, _from))
            return (0x50, "Partition not exists", bytes32(""));
        else if (partitions[_from][partitionToIndex[_from][_partition]].amount < _value)
            return (0x52, "Insufficent balance", bytes32(""));
        else if (_to == address(0))
            return (0x57, "Invalid receiver", bytes32(""));
        else if (!KindMath.checkSub(IERC20(token).balanceOf(_from), _value) || !KindMath.checkAdd(IERC20(token).balanceOf(_to), _value))
            return (0x50, "Overflow", bytes32(""));
        
        // Call function to get the receiver's partition. For current implementation returning the same as sender's
        return (0x51, "Success", _partition);
    }

    function _transferByPartition(address _from, address _to, uint256 _value, bytes32 _partition, bytes memory _data, address _operator, bytes memory _operatorData) internal {
        require(_validPartition(_partition, _from), "Invalid partition"); 
        require(partitions[_from][partitionToIndex[_from][_partition] - 1].amount >= _value, "Insufficient balance");
        require(_to != address(0), "0x address not allowed");
        uint256 _fromIndex = partitionToIndex[_from][_partition] - 1;
        
        // unfreeze the token
        safeUnfreezeToken(token, _from);

        // transfer from `_from` to `_to`
        safeTransferToken(token, _from, _to, _value.toInt64());

        if (! _validPartitionForReceiver(_partition, _to)) {
            partitions[_to].push(Partition(0, _partition));
            partitionToIndex[_to][_partition] = partitions[_to].length;
        }
        uint256 _toIndex = partitionToIndex[_to][_partition] - 1;
        
        // Changing the state values
        partitions[_from][_fromIndex].amount = partitions[_from][_fromIndex].amount.sub(_value);
        // balances[_from] = balances[_from].sub(_value); HTS keeps track of updated user balance
        partitions[_to][_toIndex].amount = partitions[_to][_toIndex].amount.add(_value);
        // balances[_to] = balances[_to].add(_value); HTS keeps track of updated user balance

        // freeze the token
        safeFreezeToken(token, _from);
        // Emit transfer event.
        emit TransferByPartition(_partition, _operator, _from, _to, _value, _data, _operatorData);
    }

    function _validPartition(bytes32 _partition, address _holder) internal view returns(bool) {
        if (partitions[_holder].length < partitionToIndex[_holder][_partition] || partitionToIndex[_holder][_partition] == 0)
            return false;
        else
            return true;
    }

    function _validPartitionForReceiver(bytes32 _partition, address _to) public view returns(bool) {
        for (uint256 i = 0; i < partitions[_to].length; i++) {
            if (partitions[_to][i].partition == _partition) {
                return true;
            }
        }
        
        return false;
    }

    // ERC1410 Operator
    /// @inheritdoc IHTS1410
    function isOperator(address _operator, address _tokenHolder) public view returns (bool) {
        return approvals[_tokenHolder][_operator];
    }

    /// @inheritdoc IHTS1410
    function isOperatorForPartition(bytes32 _partition, address _operator, address _tokenHolder) public view returns (bool) {
        return partitionApprovals[_tokenHolder][_partition][_operator];
    }

    /// @inheritdoc IHTS1410
    function authorizeOperator(address _operator) external {
        approvals[msg.sender][_operator] = true;
        emit AuthorizedOperator(_operator, msg.sender);
    }

    /// @inheritdoc IHTS1410
    function revokeOperator(address _operator) external {
        approvals[msg.sender][_operator] = false;
        emit RevokedOperator(_operator, msg.sender);
    }

    /// @inheritdoc IHTS1410
    function authorizeOperatorByPartition(bytes32 _partition, address _operator) external {
        partitionApprovals[msg.sender][_partition][_operator] = true;
        emit AuthorizedOperatorByPartition(_partition, _operator, msg.sender);
    }

    /// @inheritdoc IHTS1410
    function revokeOperatorByPartition(bytes32 _partition, address _operator) external {
        partitionApprovals[msg.sender][_partition][_operator] = false;
        emit RevokedOperatorByPartition(_partition, _operator, msg.sender);
    }

    /// @inheritdoc IHTS1410
    function operatorTransferByPartition(bytes32 _partition, address _from, address _to, uint256 _value, bytes calldata _data, bytes calldata _operatorData) external returns (bytes32) {
        // TODO: Add a functionality of verifying the `_operatorData`
        // TODO: Add a functionality of verifying the `_data`
        require(
            isOperator(msg.sender, _from) || isOperatorForPartition(_partition, msg.sender, _from),
            "Not authorised"
        );
        _transferByPartition(_from, _to, _value, _partition, _data, msg.sender, _operatorData);
    }

    // ERC1410 Issue and Redemption
     /// @inheritdoc IHTS1410
    function issueByPartition(bytes32 _partition, address _tokenHolder, uint256 _value, bytes calldata _data) external onlyController {
        // Add the function to validate the `_data` parameter
        _issueByPartition(_partition, _tokenHolder, _value, _data);
    }

    /// @inheritdoc IHTS1410
    function redeemByPartition(bytes32 _partition, uint256 _value, bytes calldata _data) external {
        // Add the function to validate the `_data` parameter
        _redeemByPartition(_partition, msg.sender, address(0), _value, _data, "");
    }

    /// @inheritdoc IHTS1410
    function operatorRedeemByPartition(bytes32 _partition, address _tokenHolder, uint256 _value, bytes calldata _data, bytes calldata _operatorData) external {
        // Add the function to validate the `_data` parameter
        // TODO: Add a functionality of verifying the `_operatorData`
        require(_tokenHolder != address(0), "Invalid from address");
        require(
            isOperator(msg.sender, _tokenHolder) || isOperatorForPartition(_partition, msg.sender, _tokenHolder),
            "Not authorised"
        );
        _redeemByPartition(_partition, _tokenHolder, msg.sender, _value, _data, _operatorData);
    }

    function _issueByPartition(bytes32 _partition, address _tokenHolder, uint256 _value, bytes calldata _data) internal {
        _validateParams(_value);
        require(_tokenHolder != address(0), "Invalid token receiver");

        // unfreeze, mint, transfer, freeze
        safeUnfreezeToken(token, _tokenHolder);
        safeMintToken(token, _value.toInt64(), new bytes[](0));
        safeTransferToken(token, address(this), _tokenHolder, _value.toInt64());

        // assign tokens to the specified partition
        uint256 index = partitionToIndex[_tokenHolder][_partition];
        if (index == 0) {
            partitions[_tokenHolder].push(Partition(_value, _partition));
            partitionToIndex[_tokenHolder][_partition] = partitions[_tokenHolder].length;
        } else {
            partitions[_tokenHolder][index - 1].amount = partitions[_tokenHolder][index - 1].amount.add(_value);
        }

        safeFreezeToken(token, _tokenHolder);
        // _totalSupply = _totalSupply.add(_value); HTS keeps track of total supply
        // balances[_tokenHolder] = balances[_tokenHolder].add(_value); HTS keeps track of global user balance
        emit IssuedByPartition(_partition, _tokenHolder, _value, _data);
    }

    function _redeemByPartition(bytes32 _partition, address _from, address _operator, uint256 _value, bytes memory _data, bytes memory _operatorData) internal {
        // Add the function to validate the `_data` parameter
        _validateParams(_value);
        require(_validPartition(_partition, _from), "Invalid partition");
        uint256 index = partitionToIndex[_from][_partition] - 1;
        require(partitions[_from][index].amount >= _value, "Insufficient value");

        safeUnfreezeToken(token, _from);
        // transfer tokens to redeem from _from and burn
        safeTransferToken(token, _from, address(this), _value.toInt64());
        safeBurnToken(token, _value.toInt64(), new int64[](0));

        if (partitions[_from][index].amount == _value) {
            _deletePartitionForHolder(_from, _partition, index);
        } else {
            partitions[_from][index].amount = partitions[_from][index].amount.sub(_value);
        }

        safeFreezeToken(token, _from);
        // balances[_from] = balances[_from].sub(_value); // HTS keeps track
        // _totalSupply = _totalSupply.sub(_value); // HTS keeps track
        emit RedeemedByPartition(_partition, _operator, _from, _value, _data);
    }

    function _deletePartitionForHolder(address _holder, bytes32 _partition, uint256 index) internal {
        if (index != partitions[_holder].length -1) {
            partitions[_holder][index] = partitions[_holder][partitions[_holder].length -1];
            partitionToIndex[_holder][partitions[_holder][index].partition] = index + 1;
        }
        delete partitionToIndex[_holder][_partition];
        // partitions[_holder].length--;
    }

    function _validateParams(uint256 _value) internal pure {
        require(_value != uint256(0), "Zero value not allowed");
        // require(_partition != bytes32(0), "Invalid partition");
    }

    // ERC1594

    /// @inheritdoc IHTS1594
    function transferWithData(address _to, uint256 _value, bytes calldata _data) external {
        // Add a function to validate the `_data` parameter
        _transferByPartition(msg.sender, _to, _value, _defaultPartition, _data, msg.sender, new bytes(0));
    }

    /// @inheritdoc IHTS1594
    function transferFromWithData(address _from, address _to, uint256 _value, bytes calldata _data) external {
        // Add a function to validate the `_data` parameter
        _transferByPartition(msg.sender, _to, _value, _defaultPartition, _data, msg.sender, new bytes(0));
    }

    /// @inheritdoc IHTS1594
    function isIssuable() external view returns (bool) {
        return issuance;
    }

    /// @inheritdoc IHTS1594
    function issue(address _tokenHolder, uint256 _value, bytes calldata _data) external onlyController() {
        // Add a function to validate the `_data` parameter
        require(issuance, "Issuance is closed");
        _issueByPartition(_defaultPartition, _tokenHolder, _value, _data);
        emit Issued(msg.sender, _tokenHolder, _value, _data);
    }

    /// @inheritdoc IHTS1594
    function redeem(uint256 _value, bytes calldata _data) external {
        // Add a function to validate the `_data` parameter
        _redeemByPartition(_defaultPartition, msg.sender, msg.sender, _value, _data, new bytes(0));
        emit Redeemed(address(0), msg.sender, _value, _data);
    }

    /// @inheritdoc IHTS1594
    function redeemFrom(address _tokenHolder, uint256 _value, bytes calldata _data) external {
        // Add a function to validate the `_data` parameter
        // msg.sender must be operator or operator of default partition of _from
        require( isOperator(msg.sender, _tokenHolder) || 
            isOperatorForPartition(_defaultPartition, msg.sender, _tokenHolder), "53"); // 0x53	insufficient allowance
        _redeemByPartition(_defaultPartition, _tokenHolder, msg.sender, _value, _data, new bytes(0));
        emit Redeemed(msg.sender, _tokenHolder, _value, _data);
    }

    /// @inheritdoc IHTS1594
    function canTransfer(address _to, uint256 _value, bytes calldata _data) external view returns (bool, bytes1, bytes32) {
        // Add a function to validate the `_data` parameter
        if (IERC20(token).balanceOf(msg.sender) < _value)
            return (false, 0x52, bytes32(0));

        else if (_to == address(0))
            return (false, 0x57, bytes32(0));

        else if (!KindMath.checkAdd(IERC20(token).balanceOf(_to), _value)) // TODO: adapt to int64 type
            return (false, 0x50, bytes32(0));
        return (true, 0x51, bytes32(0));
    }

    /// @inheritdoc IHTS1594
    function canTransferFrom(address _from, address _to, uint256 _value, bytes calldata _data) external view returns (bool, bytes1, bytes32) {
        // Add a function to validate the `_data` parameter
        if (_value > IERC20(token).allowance(_from, msg.sender)) // if (_value > _allowed[_from][msg.sender])
            return (false, 0x53, bytes32(0));

        else if (IERC20(token).balanceOf(_from) < _value)
            return (false, 0x52, bytes32(0));

        else if (_to == address(0))
            return (false, 0x57, bytes32(0));

        else if (!KindMath.checkAdd(IERC20(token).balanceOf(_to), _value))
            return (false, 0x50, bytes32(0));
        return (true, 0x51, bytes32(0));
    }

    // ERC1643
    /// @inheritdoc IHTS1643
    function setDocument(bytes32 _name, string memory _uri, bytes32 _documentHash) external onlyController {
        require(_name != bytes32(0), "Zero value is not allowed");
        require(bytes(_uri).length > 0, "Should not be a empty uri");
        if (_documents[_name].lastModified == uint256(0)) {
            _docNames.push(_name);
            _docIndexes[_name] = _docNames.length;
        }
        _documents[_name] = Document(_documentHash, block.timestamp, _uri);
        emit DocumentUpdated(_name, _uri, _documentHash);
    }

    /// @inheritdoc IHTS1643
    function removeDocument(bytes32 _name) external onlyController {
        require(_documents[_name].lastModified != uint256(0), "Document should be existed");
        uint256 index = _docIndexes[_name] - 1;
        if (index != _docNames.length - 1) {
            _docNames[index] = _docNames[_docNames.length - 1];
            _docIndexes[_docNames[index]] = index + 1; 
        }
        _docNames.pop();
        // _docNames.length--;
        emit DocumentRemoved(_name, _documents[_name].uri, _documents[_name].docHash);
        delete _documents[_name];
    }

    /// @inheritdoc IHTS1643
    function getDocument(bytes32 _name) external view returns (string memory, bytes32, uint256) {
        return (
            _documents[_name].uri,
            _documents[_name].docHash,
            _documents[_name].lastModified
        );
    }

    /// @inheritdoc IHTS1643
    function getAllDocuments() external view returns (bytes32[] memory) {
        return _docNames;
    }

    // ERC1644
    /// @inheritdoc IHTS1644
    function isControllable() external view returns (bool) {
        return _isControllable();
    }

    /// @inheritdoc IHTS1644
    function controllerTransfer(address _from, address _to, bytes32 _partition, uint256 _value, bytes calldata _data, bytes calldata _operatorData) external onlyController {
        // copy/paste of internal function _transferByPartition but with nuance of HTS token wipe
        require(_validPartition(_partition, _from), "Invalid partition"); 
        require(partitions[_from][partitionToIndex[_from][_partition] - 1].amount >= _value, "Insufficient balance");
        require(_to != address(0), "0x address not allowed");
        uint256 _fromIndex = partitionToIndex[_from][_partition] - 1;
        
        // wipe the token from `_from`, _value is transferred to treasury (address(this))
        safeWipeTokenAccount(token, _from, _value.toInt64());

        // transfer from `_from` to `_to`
        safeTransferToken(token, address(this), _to, _value.toInt64());

        if (! _validPartitionForReceiver(_partition, _to)) {
            partitions[_to].push(Partition(0, _partition));
            partitionToIndex[_to][_partition] = partitions[_to].length;
        }
        uint256 _toIndex = partitionToIndex[_to][_partition] - 1;
        
        // Changing the state values
        partitions[_from][_fromIndex].amount = partitions[_from][_fromIndex].amount.sub(_value);
        partitions[_to][_toIndex].amount = partitions[_to][_toIndex].amount.add(_value);
        // Emit transfer event.
        emit ControllerTransfer(msg.sender, _from, _to, _partition, _value, _data, _operatorData);
    }

    /// @inheritdoc IHTS1644
    function controllerRedeem(address _from, bytes32 _partition, uint256 _value, bytes calldata _data, bytes calldata _operatorData) external onlyController {
        _validateParams(_value);
        require(_validPartition(_partition, _from), "Invalid partition");
        uint256 index = partitionToIndex[_from][_partition] - 1;
        require(partitions[_from][index].amount >= _value, "Insufficient value");
        
        // wipe the token from `_from`, _value is transferred to treasury (address(this))
        safeWipeTokenAccount(token, _from, _value.toInt64());

        safeBurnToken(token, _value.toInt64(), new int64[](0));

        if (partitions[_from][index].amount == _value) {
            _deletePartitionForHolder(_from, _partition, index);
        } else {
            partitions[_from][index].amount = partitions[_from][index].amount.sub(_value);
        }
        // balances[_from] = balances[_from].sub(_value); // HTS keeps track
        // _totalSupply = _totalSupply.sub(_value); // HTS keeps track
        emit ControllerRedemption(msg.sender, _from, _value, _data, _operatorData);
    }

    function finalizeControllable() external onlyController() {
        require(controller != address(0), "Already finalized");
        controller = address(0);
        emit FinalizedControllerFeature();
    }

    function _isControllable() internal view returns (bool) {
        if (controller == address(0))
            return false;
        else
            return true;
    }

    // ------------- Modifiers -------------

    modifier onlyController() {
        require(msg.sender == controller, "Not Authorised");
        _;
    }

    // ------------- ERC20 Overrides -------------

    function totalSupply() external view override returns (uint256) {
        return IERC20(token).totalSupply();
    }

    function balanceOf(address _tokenHolder) external view override returns (uint256) {
        return IERC20(token).balanceOf(_tokenHolder);
    }

    function transfer(address _to, uint256 _value) external override returns (bool) {
        _transferByPartition(msg.sender, _to, _value, _defaultPartition, new bytes(0), msg.sender, new bytes(0));
        return true;
    }

    function allowance(address _owner, address _spender) external view override returns (uint256) {
        return IERC20(token).allowance(_owner, _spender);
    }

    function approve(address _spender, uint256 _value) external override returns (bool) {
        return IERC20(token).approve(_spender, _value); // can only be called by smart contracts after HSCS security update
    }

    function transferFrom(address _from, address _to, uint256 _value) external override returns (bool) {
        // must explicitly check operator mapping otherwise the allowance is vulnerable to third party transfer
        // TODO: revisit operator/controller/owner check
        require( isOperator(msg.sender, _from) || isOperatorForPartition(_defaultPartition, msg.sender, _from), "53"); // 0x53	insufficient allowance

        // HTS checks for allowance

        _transferByPartition(_from, _to, _value, _defaultPartition, new bytes(0), msg.sender, new bytes(0));
        return true;
    }

    // ------------- Owner functions -------------

    function ownerGrantTokenKyc(address account) external onlyOwner {
        safeUnfreezeToken(token, account);
        safeGrantTokenKyc(token, account);
        safeFreezeToken(token, account);
    }

    function ownerRevokeTokenKyc(address account) external onlyOwner {
        safeUnfreezeToken(token, account);
        safeRevokeTokenKyc(token, account);
        safeFreezeToken(token, account);
    }

    function ownerPauseToken() external onlyOwner() {
        return safePauseToken(token); 
    }

    function ownerUnpauseToken() external onlyOwner() {
        return safeUnpauseToken(token);
    }

    function ownerUpdateTokenKeys(IHederaTokenService.TokenKey[] memory keys) external onlyOwner() returns(int64) {
        return updateTokenKeys(token, keys);
    }

    function withdrawHbar(uint256 _amount) external onlyOwner() {
        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, 'withdrawHbar failed');
    }
}