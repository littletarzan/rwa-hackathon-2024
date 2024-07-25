pragma solidity ^0.8.20;

import "./HTS1410Basic.sol";

// no changes from ERC equivalent
// https://github.com/SecurityTokenStandard/EIP-Spec/blob/master/contracts/ERC1410/ERC1410Operator.sol

contract HTS1410Operator is HTS1410Basic {

    // Mapping from (investor, partition, operator) to approved status
    mapping (address => mapping (bytes32 => mapping (address => bool))) partitionApprovals;

    // Mapping from (investor, operator) to approved status (can be used against any partition)
    mapping (address => mapping (address => bool)) approvals;

    event AuthorizedOperator(address indexed operator, address indexed tokenHolder);
    event RevokedOperator(address indexed operator, address indexed tokenHolder);

    event AuthorizedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);
    event RevokedOperatorByPartition(bytes32 indexed partition, address indexed operator, address indexed tokenHolder);

    /// @notice Determines whether `_operator` is an operator for all partitions of `_tokenHolder`
    /// @param _operator The operator to check
    /// @param _tokenHolder The token holder to check
    /// @return Whether the `_operator` is an operator for all partitions of `_tokenHolder`
    function isOperator(address _operator, address _tokenHolder) public view returns (bool) {
        return approvals[_tokenHolder][_operator];
    }

    /// @notice Determines whether `_operator` is an operator for a specified partition of `_tokenHolder`
    /// @param _partition The partition to check
    /// @param _operator The operator to check
    /// @param _tokenHolder The token holder to check
    /// @return Whether the `_operator` is an operator for a specified partition of `_tokenHolder`
    function isOperatorForPartition(bytes32 _partition, address _operator, address _tokenHolder) public view returns (bool) {
        return partitionApprovals[_tokenHolder][_partition][_operator];
    }

    ///////////////////////
    /// Operator Management
    ///////////////////////

    /// @notice Authorises an operator for all partitions of `msg.sender`
    /// @param _operator An address which is being authorised
    function authorizeOperator(address _operator) external {
        approvals[msg.sender][_operator] = true;
        emit AuthorizedOperator(_operator, msg.sender);
    }

    /// @notice Revokes authorisation of an operator previously given for all partitions of `msg.sender`
    /// @param _operator An address which is being de-authorised
    function revokeOperator(address _operator) external {
        approvals[msg.sender][_operator] = false;
        emit RevokedOperator(_operator, msg.sender);
    }

    /// @notice Authorises an operator for a given partition of `msg.sender`
    /// @param _partition The partition to which the operator is authorised
    /// @param _operator An address which is being authorised
    function authorizeOperatorByPartition(bytes32 _partition, address _operator) external {
        partitionApprovals[msg.sender][_partition][_operator] = true;
        emit AuthorizedOperatorByPartition(_partition, _operator, msg.sender);
    }

    /// @notice Revokes authorisation of an operator previously given for a specified partition of `msg.sender`
    /// @param _partition The partition to which the operator is de-authorised
    /// @param _operator An address which is being de-authorised
    function revokeOperatorByPartition(bytes32 _partition, address _operator) external {
        partitionApprovals[msg.sender][_partition][_operator] = false;
        emit RevokedOperatorByPartition(_partition, _operator, msg.sender);
    }

    // function operatorTransferByPartition(bytes32 _partition, address _from, address _to, uint256 _value, bytes _data, bytes _operatorData) external returns (bytes32) {
    //     // TODO: Add a functionality of verifying the `_operatorData`
    //     // TODO: Add a functionality of verifying the `_data`
    //     require(
    //         isOperator(msg.sender, _from) || isOperatorForPartition(_partition, msg.sender, _from),
    //         "Not authorised"
    //     );
 
    //     // copy/paste of internal function _transferByPartition but with nuance of HTS token wipe
    //     require(_validPartition(_partition, _from), "Invalid partition"); 
    //     require(partitions[_from][partitionToIndex[_from][_partition] - 1].amount >= _value, "Insufficient balance");
    //     require(_to != address(0), "0x address not allowed");
    //     uint256 _fromIndex = partitionToIndex[_from][_partition] - 1;
        
    //     // wipe the token from `_from`, _value is transferred to treasury (address(this))
    //     wipeTokenAccount(token, _from, _value); // needs to be int64 safecast?

    //     // transfer from `_from` to `_to`
    //     transferToken(token, address(this), _to, _value);

    //     if (! _validPartitionForReceiver(_partition, _to)) {
    //         partitions[_to].push(Partition(0, _partition));
    //         partitionToIndex[_to][_partition] = partitions[_to].length;
    //     }
    //     uint256 _toIndex = partitionToIndex[_to][_partition] - 1;
        
    //     // Changing the state values
    //     partitions[_from][_fromIndex].amount = partitions[_from][_fromIndex].amount.sub(_value);
    //     partitions[_to][_toIndex].amount = partitions[_to][_toIndex].amount.add(_value);
    //     // Emit transfer event.
    //     emit TransferByPartition(_partition, _operator, _from, _to, _value, _data, _operatorData);
    // }

    /// @notice Transfers the ownership of tokens from a specified partition from one address to another address
    /// @param _partition The partition from which to transfer tokens
    /// @param _from The address from which to transfer tokens from
    /// @param _to The address to which to transfer tokens to
    /// @param _value The amount of tokens to transfer from `_partition`
    /// @param _data Additional data attached to the transfer of tokens
    /// @param _operatorData Additional data attached to the transfer of tokens by the operator
    /// @return The partition to which the transferred tokens were allocated for the _to address
    function operatorTransferByPartition(bytes32 _partition, address _from, address _to, uint256 _value, bytes memory _data, bytes memory _operatorData) external returns (bytes32) {
        // TODO: Add a functionality of verifying the `_operatorData`
        // TODO: Add a functionality of verifying the `_data`
        require(
            isOperator(msg.sender, _from) || isOperatorForPartition(_partition, msg.sender, _from),
            "Not authorised"
        );
        _transferByPartition(_from, _to, _value, _partition, _data, msg.sender, _operatorData);
    }

}