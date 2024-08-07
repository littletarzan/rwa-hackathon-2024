// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

library SafeCast {

    function toInt64(int256 value) internal pure returns (int64) {
        require(
            value >= type(int64).min && value <= type(int64).max,
            "SafeCast: value doesn't fit in 64 bits"
        );
        return int64(value);
    }

    function toInt64(uint64 value) internal pure returns (int64) {
        require(
            value >= type(uint64).min && value <= type(uint64).max,
            "SafeCast: value doesn't fit in 64 bits"
        );
        return int64(value);
    }

    function toInt64(uint256 value) internal pure returns (int64) {
        require(
            value >= type(uint64).min && value <= type(uint64).max,
            "SafeCast: value doesn't fit in 64 bits"
        );
        return int64(uint64(value));
    }
}
