/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { IHederaTokenService } from "../IHederaTokenService";

export class IHederaTokenService__factory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IHederaTokenService {
    return new Contract(address, _abi, signerOrProvider) as IHederaTokenService;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "int64",
        name: "amount",
        type: "int64",
      },
      {
        internalType: "int64[]",
        name: "serialNumbers",
        type: "int64[]",
      },
    ],
    name: "burnToken",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
      {
        internalType: "int64",
        name: "newTotalSupply",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "address",
            name: "treasury",
            type: "address",
          },
          {
            internalType: "string",
            name: "memo",
            type: "string",
          },
          {
            internalType: "bool",
            name: "tokenSupplyType",
            type: "bool",
          },
          {
            internalType: "int64",
            name: "maxSupply",
            type: "int64",
          },
          {
            internalType: "bool",
            name: "freezeDefault",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "keyType",
                type: "uint256",
              },
              {
                components: [
                  {
                    internalType: "bool",
                    name: "inheritAccountKey",
                    type: "bool",
                  },
                  {
                    internalType: "address",
                    name: "contractId",
                    type: "address",
                  },
                  {
                    internalType: "bytes",
                    name: "ed25519",
                    type: "bytes",
                  },
                  {
                    internalType: "bytes",
                    name: "ECDSA_secp256k1",
                    type: "bytes",
                  },
                  {
                    internalType: "address",
                    name: "delegatableContractId",
                    type: "address",
                  },
                ],
                internalType: "struct IHederaTokenService.KeyValue",
                name: "key",
                type: "tuple",
              },
            ],
            internalType: "struct IHederaTokenService.TokenKey[]",
            name: "tokenKeys",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "int64",
                name: "second",
                type: "int64",
              },
              {
                internalType: "address",
                name: "autoRenewAccount",
                type: "address",
              },
              {
                internalType: "int64",
                name: "autoRenewPeriod",
                type: "int64",
              },
            ],
            internalType: "struct IHederaTokenService.Expiry",
            name: "expiry",
            type: "tuple",
          },
        ],
        internalType: "struct IHederaTokenService.HederaToken",
        name: "token",
        type: "tuple",
      },
      {
        internalType: "int64",
        name: "initialTotalSupply",
        type: "int64",
      },
      {
        internalType: "int32",
        name: "decimals",
        type: "int32",
      },
    ],
    name: "createFungibleToken",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "freezeToken",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantTokenKyc",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "int64",
        name: "amount",
        type: "int64",
      },
      {
        internalType: "bytes[]",
        name: "metadata",
        type: "bytes[]",
      },
    ],
    name: "mintToken",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
      {
        internalType: "int64",
        name: "newTotalSupply",
        type: "int64",
      },
      {
        internalType: "int64[]",
        name: "serialNumbers",
        type: "int64[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "pauseToken",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "encodedFunctionSelector",
        type: "bytes",
      },
    ],
    name: "redirectForToken",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
      {
        internalType: "bytes",
        name: "response",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeTokenKyc",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "int64",
        name: "amount",
        type: "int64",
      },
    ],
    name: "transferToken",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "unfreezeToken",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "unpauseToken",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "address",
            name: "treasury",
            type: "address",
          },
          {
            internalType: "string",
            name: "memo",
            type: "string",
          },
          {
            internalType: "bool",
            name: "tokenSupplyType",
            type: "bool",
          },
          {
            internalType: "int64",
            name: "maxSupply",
            type: "int64",
          },
          {
            internalType: "bool",
            name: "freezeDefault",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "keyType",
                type: "uint256",
              },
              {
                components: [
                  {
                    internalType: "bool",
                    name: "inheritAccountKey",
                    type: "bool",
                  },
                  {
                    internalType: "address",
                    name: "contractId",
                    type: "address",
                  },
                  {
                    internalType: "bytes",
                    name: "ed25519",
                    type: "bytes",
                  },
                  {
                    internalType: "bytes",
                    name: "ECDSA_secp256k1",
                    type: "bytes",
                  },
                  {
                    internalType: "address",
                    name: "delegatableContractId",
                    type: "address",
                  },
                ],
                internalType: "struct IHederaTokenService.KeyValue",
                name: "key",
                type: "tuple",
              },
            ],
            internalType: "struct IHederaTokenService.TokenKey[]",
            name: "tokenKeys",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "int64",
                name: "second",
                type: "int64",
              },
              {
                internalType: "address",
                name: "autoRenewAccount",
                type: "address",
              },
              {
                internalType: "int64",
                name: "autoRenewPeriod",
                type: "int64",
              },
            ],
            internalType: "struct IHederaTokenService.Expiry",
            name: "expiry",
            type: "tuple",
          },
        ],
        internalType: "struct IHederaTokenService.HederaToken",
        name: "tokenInfo",
        type: "tuple",
      },
    ],
    name: "updateTokenInfo",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "keyType",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "inheritAccountKey",
                type: "bool",
              },
              {
                internalType: "address",
                name: "contractId",
                type: "address",
              },
              {
                internalType: "bytes",
                name: "ed25519",
                type: "bytes",
              },
              {
                internalType: "bytes",
                name: "ECDSA_secp256k1",
                type: "bytes",
              },
              {
                internalType: "address",
                name: "delegatableContractId",
                type: "address",
              },
            ],
            internalType: "struct IHederaTokenService.KeyValue",
            name: "key",
            type: "tuple",
          },
        ],
        internalType: "struct IHederaTokenService.TokenKey[]",
        name: "keys",
        type: "tuple[]",
      },
    ],
    name: "updateTokenKeys",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "int64",
        name: "amount",
        type: "int64",
      },
    ],
    name: "wipeTokenAccount",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];
