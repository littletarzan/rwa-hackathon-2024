pragma solidity ^0.8.20;

import './IHTS1410.sol';
import './IHTS1594.sol';
import './IHTS1643.sol';
import './IHTS1644.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import './IHederaTokenService.sol';

interface IHTS1400 is IHTS1410, IHTS1594, IHTS1643, IHTS1644, IERC20 {

    // additional hedera token management functions
    function ownerGrantTokenKyc(address account) external returns (int64);

    function ownerRevokeTokenKyc(address account) external returns (int64);

    function ownerPauseToken() external returns(int64);

    function ownerUnpauseToken() external returns(int64);

    function ownerUpdateTokenKeys(IHederaTokenService.TokenKey[] memory keys) external returns(int64);

}