# RWA-Hackathon-2024
Matthew DeLorenzo Hedera Hackathon 2024 submission: HTS1400

## Introduction

This repository creates a smart contract controlled Hedera Token Service (HTS) token compatible with the Ethereum security token standard ERC1400. ERC1400 is an umbrella standard encompassing ERC1410, ERC1594, ERC1643, and ERC1644. Its purpose is to enable the tokenization of real world assets (RWAs) on the Hedera network with the same specifications as common security token standards on the Ethereum network.

This repository has four main sections:
- contracts
- scripts
- test
- config

## Getting started

Hedera Local Node (https://github.com/hashgraph/hedera-local-node) was used for the development of this project. Please visit their repository for instructions on downloading and operating Hedera Local Node. 
</br></br>The next steps for setting up this repository are:

Inside a terminal in the cloned local node repository: </br>
`docker compose up -d` </br>
`hedera generate-accounts 7 --balance=10000000` - creates 7 accounts for unit testing </br>

Create a file called `.env` in the root of **this** repository and copy/paste the sample env file </br>
Copy/paste the account id's and ECDSA generated private keys</br></br>
![Screenshot 2024-08-07 at 4 09 12 PM](https://github.com/user-attachments/assets/db4c53bd-1b5e-46ad-b131-2550df93dd4e) </br>
`npm install` to install dependencies</br>
`npx hardhat compile` to compile the smart contracts and create typechain bindings</br>

From here, you can run the unit test</br>
`npx hardhat test test/HTS1400Test.ts`, </br>
or deploy the HTS1400 token and call its functions using scripts</br>
`npx hardhat run scripts/deploy/deployContract.ts`

When you are done with the local node:</br>
`docker compose down`
