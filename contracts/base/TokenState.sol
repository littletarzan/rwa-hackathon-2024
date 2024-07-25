// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

import "../libraries/Bits.sol";
import './HederaTokenService.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Token State
/// @notice Contains state variable for HTS security token

// owner roles are:
// set isControllable
// set isIssuable
// set controllers
// migrate?
contract TokenState is HederaTokenService, Ownable {

    address immutable public token; // the HTS security token
    using Bits for uint;

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        int64 initSupply,
        int32 decimals
    ) Ownable(msg.sender) payable {
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
        myToken.name = tokenName;
        myToken.symbol = tokenSymbol;
        myToken.treasury = address(this);
        myToken.expiry = expiry;
        myToken.tokenKeys = keys;
        myToken.freezeDefault = true;

        (int responseCode, address _token) =
        HederaTokenService.createFungibleToken(myToken, initSupply, decimals);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert ();
        }

        token = _token; 
    }

    // external onlyOwner functions to interact directly with HTS on token
    // may not need these

    function ownerPauseToken() external onlyOwner() returns(int64 respCode) {
        return pauseToken(token);
    }

    function ownerGrantKYCToken(address account) external onlyOwner() returns(int64 respCode) {
        return grantTokenKyc(token, account);
    }

    function ownerRevokeKYCToken(address account) external onlyOwner() returns(int64 respCode) {
        return revokeTokenKyc(token, account);
    }

    function ownerUpdateTokenKeys(IHederaTokenService.TokenKey[] memory keys) external onlyOwner() returns(int64 respCode) {
        return updateTokenKeys(token, keys);
    }

}
