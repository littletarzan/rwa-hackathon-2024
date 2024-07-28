pragma solidity ^0.8.20;

import "../../../interfaces/IHTS1644.sol";
import "./HTS1644Controllable.sol";
import "../HTS1410/HTS1410Basic.sol";
/**
 * @title Standard ERC1644 token
 */
contract HTS1644 is HTS1644Controllable, HTS1410Basic, IHTS1644 {

    /**
     * @notice constructor 
     * @dev Used to intialize the controller variable. 
     * `_controller` it can be zero address as well it means
     * controller functions will revert
     * @param _controller Address of the controller delegated by the issuer
     */
    constructor(address _controller)
    public 
    ERC1644Controllable(_controller)
    {

    }

    function isControllable() external view returns (bool) {
        return _isControllable();
    }

    function controllerTransfer(address _from, address _to, uint256 _value, bytes _data, bytes _operatorData) external onlyController {
        // copy/paste of internal function _transferByPartition but with nuance of HTS token wipe
        require(_validPartition(_partition, _from), "Invalid partition"); 
        require(partitions[_from][partitionToIndex[_from][_partition] - 1].amount >= _value, "Insufficient balance");
        require(_to != address(0), "0x address not allowed");
        uint256 _fromIndex = partitionToIndex[_from][_partition] - 1;
        
        // wipe the token from `_from`, _value is transferred to treasury (address(this))
        wipeTokenAccount(token, _from, _value); // needs to be int64 safecast?

        // transfer from `_from` to `_to`
        transferToken(token, address(this), _to, _value);

        if (! _validPartitionForReceiver(_partition, _to)) {
            partitions[_to].push(Partition(0, _partition));
            partitionToIndex[_to][_partition] = partitions[_to].length;
        }
        uint256 _toIndex = partitionToIndex[_to][_partition] - 1;
        
        // Changing the state values
        partitions[_from][_fromIndex].amount = partitions[_from][_fromIndex].amount.sub(_value);
        partitions[_to][_toIndex].amount = partitions[_to][_toIndex].amount.add(_value);
        // Emit transfer event.
        emit ControllerTransfer(msg.sender, _from, _to, _value, _data, _operatorData);
    }

    function controllerRedeem(address _tokenHolder, uint256 _value, bytes _data, bytes _operatorData) external onlyController {
        _burn(_tokenHolder, _value);
        emit ControllerRedemption(msg.sender, _tokenHolder, _value, _data, _operatorData);
    }

}