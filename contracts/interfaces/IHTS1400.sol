pragma solidity ^0.8.20;

import './IHTS1410.sol';
import './IHTS1594.sol';
import './IHTS1643.sol';
import './IHTS1644.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import './IHederaTokenService.sol';

interface IHTS1400 is IHTS1410, IHTS1594, IHTS1643, IHTS1644, IERC20 {

    // additional hedera token management functions
    function ownerGrantTokenKyc(address account) external;

    function ownerRevokeTokenKyc(address account) external;

    function ownerPauseToken() external;

    function ownerUnpauseToken() external;

    function ownerUpdateTokenKeys(IHederaTokenService.TokenKey[] memory keys) external returns(int64);

    function ownerUpdateTokenInfo(IHederaTokenService.HederaToken memory tokenInfo) external returns(int64);
}