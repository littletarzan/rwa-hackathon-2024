// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import "./HTS1410Operator.sol";
import "../../../interfaces/IHTS1410.sol";

contract HTS1410Standard is IHTS1410, HTS1410Operator {


    function issueByPartition(bytes32 _partition, address _tokenHolder, uint256 _value, bytes memory _data) external onlyOwner {
        // Add the function to validate the `_data` parameter
        _validateParams(_partition, _value);
        require(_tokenHolder != address(0), "Invalid token receiver");

        // mint and transfer HTS token 
        mintToken(token, _value, new bytes[](0));
        transferToken(token, address(this), _tokenHolder, _value);

        //assign tokens to the specified partition
        uint256 index = partitionToIndex[_tokenHolder][_partition];
        if (index == 0) {
            partitions[_tokenHolder].push(Partition(_value, _partition));
            partitionToIndex[_tokenHolder][_partition] = partitions[_tokenHolder].length;
        } else {
            partitions[_tokenHolder][index - 1].amount = partitions[_tokenHolder][index - 1].amount.add(_value);
        }

        // _totalSupply = _totalSupply.add(_value); HTS keeps track of total supply
        // balances[_tokenHolder] = balances[_tokenHolder].add(_value); HTS keeps track of global user balance
        emit IssuedByPartition(_partition, _tokenHolder, _value, _data);
    }


    function redeemByPartition(bytes32 _partition, uint256 _value, bytes memory _data) external {
        // Add the function to validate the `_data` parameter
        _redeemByPartition(_partition, msg.sender, address(0), _value, _data, "");
    }

    function operatorRedeemByPartition(bytes32 _partition, address _tokenHolder, uint256 _value, bytes memory _operatorData) external {
        // Add the function to validate the `_data` parameter
        // TODO: Add a functionality of verifying the `_operatorData`
        require(_tokenHolder != address(0), "Invalid from address");
        require(
            isOperator(msg.sender, _tokenHolder) || isOperatorForPartition(_partition, msg.sender, _tokenHolder),
            "Not authorised"
        );
        _redeemByPartition(_partition, _tokenHolder, msg.sender, _value, _data, _operatorData);
    }

    function _redeemByPartition(bytes32 _partition, address _from, address _operator, uint256 _value, bytes memory _data, bytes memory _operatorData) internal {
        // Add the function to validate the `_data` parameter
        _validateParams(_partition, _value);
        require(_validPartition(_partition, _from), "Invalid partition");
        uint256 index = partitionToIndex[_from][_partition] - 1;
        require(partitions[_from][index].amount >= _value, "Insufficient value");

        // transfer tokens to redeem from _from and burn
        transferToken(token, _from, address(this), _value);
        burnToken(token, _value, new bytes[](0));

        if (partitions[_from][index].amount == _value) {
            _deletePartitionForHolder(_from, _partition, index);
        } else {
            partitions[_from][index].amount = partitions[_from][index].amount.sub(_value);
        }
        // balances[_from] = balances[_from].sub(_value); // HTS keeps track
        // _totalSupply = _totalSupply.sub(_value); // HTS keeps track
        emit RedeemedByPartition(_partition, _operator, _from, _value, _data, _operatorData);
    }

    function _deletePartitionForHolder(address _holder, bytes32 _partition, uint256 index) internal {
        if (index != partitions[_holder].length -1) {
            partitions[_holder][index] = partitions[_holder][partitions[_holder].length -1];
            partitionToIndex[_holder][partitions[_holder][index].partition] = index + 1;
        }
        delete partitionToIndex[_holder][_partition];
        partitions[_holder].length--;
    }

    function _validateParams(bytes32 _partition, uint256 _value) internal pure {
        require(_value != uint256(0), "Zero value not allowed");
        require(_partition != bytes32(0), "Invalid partition");
    }

}