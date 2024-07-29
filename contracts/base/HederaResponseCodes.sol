// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.4.9 <0.9.0;

library HederaResponseCodes {

    int32 internal constant UNKNOWN = 21; // The responding node has submitted the transaction to the network. Its final status is still unknown.
    int32 internal constant SUCCESS = 22; // The transaction succeeded
}