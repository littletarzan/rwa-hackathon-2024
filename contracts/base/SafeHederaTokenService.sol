// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;
pragma experimental ABIEncoderV2;

import "./HederaTokenService.sol";
import "../interfaces/IHederaTokenService.sol";

contract SafeHederaTokenService is HederaTokenService {

    function safeMintToken(address token, int64 amount, bytes[] memory metadata) internal
    returns (int responseCode, int64 newTotalSupply, int64[] memory serialNumbers) {
        (responseCode, newTotalSupply, serialNumbers) = mintToken(token, amount, metadata);
        require(responseCode == HederaResponseCodes.SUCCESS, "Safe mint failed!");
    }

    function safeBurnToken(address token, int64 amount, int64[] memory serialNumbers) internal
    returns (int responseCode, int64 newTotalSupply)
    {
        (responseCode, newTotalSupply) = HederaTokenService.burnToken(token, amount, serialNumbers);
        require(responseCode == HederaResponseCodes.SUCCESS, "Safe burn failed!");
    }

    function safeTransferToken(address token, address sender, address receiver, int64 amount) internal {
        int responseCode;
        responseCode = HederaTokenService.transferToken(token, sender, receiver, amount);
        require(responseCode == HederaResponseCodes.SUCCESS, "Safe token transfer failed!");
    }

    function safeFreezeToken(address token, address account) internal {
        int responseCode;
        responseCode = HederaTokenService.freezeToken(token, account);
        require(responseCode == HederaResponseCodes.SUCCESS, "Safe freeze token failed!");
    }

    function safeUnfreezeToken(address token, address account) internal {
        int responseCode;
        responseCode = HederaTokenService.unfreezeToken(token, account);
        require(responseCode == HederaResponseCodes.SUCCESS, "Safe unfreeze token failed!");
    }

    function safePauseToken(address token) internal {
        int responseCode;
        responseCode = HederaTokenService.pauseToken(token);
        require(responseCode == HederaResponseCodes.SUCCESS, "Safe pause token failed!");
    }

    function safeUnpauseToken(address token) internal {
        int responseCode;
        responseCode = HederaTokenService.unpauseToken(token);
        require(responseCode == HederaResponseCodes.SUCCESS, "Safe unpause token failed!");
    }

    function safeGrantTokenKyc(address token, address account) internal {
        int responseCode;
        responseCode = HederaTokenService.grantTokenKyc(token, account);
        require(responseCode == HederaResponseCodes.SUCCESS, "Safe grant token kyc failed!");
    }

    function safeRevokeTokenKyc(address token, address account) internal {
        int responseCode;
        responseCode = HederaTokenService.revokeTokenKyc(token, account);
        require(responseCode == HederaResponseCodes.SUCCESS, "Safe revoke token kyc failed!");
    }

    function safeWipeTokenAccount(address token, address account, int64 amount) internal {
        int responseCode;
        responseCode = HederaTokenService.wipeTokenAccount(token, account, amount);
        require(responseCode == HederaResponseCodes.SUCCESS, "Safe wipe token account failed!");
    }
}
