pragma solidity ^0.8.20;

/**
 * @title KindMath
 * @notice ref. https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/math/SafeMath.sol
 * @dev Math operations with safety checks that returns boolean; Modified by littletarzan for ints
 */
library KindMath {

    /**
    * @dev Subtracts two numbers, return false on overflow (i.e. if subtrahend is greater than minuend).
    */
    function checkSub(uint256 a, uint256 b) internal pure returns (bool) {
        if (b <= a)
            return true;
        else
            return false;
    }

    /**
    * @dev Adds two numbers, return false on overflow.
    */
    function checkAddForInt64(uint256 a, uint256 b) internal pure returns (bool) {
        uint256 c = a + b;
        if (c < a)
            return false;
        else if (c > 2 ** 63 - 1) 
            return false;
        else
            return true;
    }
}