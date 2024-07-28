pragma solidity ^0.8.20;

import "../../TokenState.sol";
import "../../../libraries/KindMath.sol";
import "../../../libraries/SafeMath.sol";
import "../../../libraries/SafeCast.sol";
import "../../../interfaces/IERC20.sol";

// https://github.com/SecurityTokenStandard/EIP-Spec/blob/master/contracts/ERC1410/ERC1410Basic.sol

contract HTS1410Basic is TokenState {

    using SafeMath for uint256; 
    using SafeCast for uint256;

    // Represents a fungible set of tokens.
    struct Partition {
        uint256 amount;
        bytes32 partition;
    }

    // Mapping from investor to their partitions
    mapping (address => Partition[]) partitions;

    // Mapping from (investor, partition) to index of corresponding partition in partitions
    // @dev Stored value is always greater by 1 to avoid the 0 value of every index
    mapping (address => mapping (bytes32 => uint256)) partitionToIndex;

    event TransferByPartition(
        bytes32 indexed _fromPartition,
        address _operator,
        address indexed _from,
        address indexed _to,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    constructor(string memory _tokenName,
        string memory _tokenSymbol,
        int64 _initSupply,
        int32 _decimals
    ) TokenState(_tokenName,
        _tokenSymbol,
        _initSupply,
        _decimals
    ) Ownable(msg.sender) payable 
    {

    }

    function totalSupply() external view returns (uint256) {
        return IERC20(token).totalSupply();
    }

    function balanceOf(address _tokenHolder) external view returns (uint256) {
        return IERC20(token).balanceOf(_tokenHolder);
    }

    
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

    function transferByPartition(bytes32 _partition, address _to, uint256 _value, bytes memory _data) external returns (bytes32) {
        // Add a function to verify the `_data` parameter
        // TODO: Need to create the bytes division of the `_partition` so it can be easily findout in which receiver's partition
        // token will transfered. For current implementation we are assuming that the receiver's partition will be same as sender's
        // as well as it also pass the `_validPartition()` check. In this particular case we are also assuming that reciever has the
        // some tokens of the same partition as well (To avoid the array index out of bound error).
        // Note- There is no operator used for the execution of this call so `_operator` value in
        // in event is address(0) same for the `_operatorData`
        _transferByPartition(msg.sender, _to, _value, _partition, _data, address(0), "");
    }

    function canTransferByPartition(address _from, address _to, bytes32 _partition, uint256 _value, bytes memory _data) external view returns (bytes1, bytes32, bytes32) {
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
        
        // transfer from `_from` to `_to`
        transferToken(token, _from, _to, _value.toInt64());

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
}