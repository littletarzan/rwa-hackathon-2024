import EnvContainer from '../EnvContainer'
import { approveToken, associateToken, sleep, transferToken } from '../utils/hederaUtils'
import { ContractId, TokenId, TopicId } from '@hashgraph/sdk'

import hardhat, { ethers, hethers } from 'hardhat'
import { Contract, Signer, Wallet} from '@hashgraph/hethers'
import chai, { assert, expect } from 'chai'
import { HTS1400ContractFixture } from './shared/fixture'
import { getTokenBalanceForId } from '../utils/mirrorNodeUtils'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { HTS1400 } from '../typechain'

describe('Contract', () => {
  let env: EnvContainer
  let wallets: Wallet[]
  let wallet: Wallet
  let aliceWallet: Wallet
  let bobWallet: Wallet

  let token0: TokenId
  let token1: TokenId

  let myRawPubKey: string
  let aliceRawPubKey: string
  let bobRawPubKey: string

  async function HTS1400ContractFixtureLocal(): Promise<{
    HTS1400Contract: HTS1400
  }> {

    const { HTS1400Contract } = await HTS1400ContractFixture(
        "MySecurityToken",
        "MST",
        "Testing only",
        8,
        env.ownerId.toSolidityAddress(),
        env.controllerId.toSolidityAddress(),
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        20
    )

    return {
        HTS1400Contract
    }
  }
  
  let HTS1400Contract: HTS1400

  before(async () => {
    env = new EnvContainer()

    myRawPubKey = ""+env.myPrivateKey.publicKey.toEthereumAddress()
    aliceRawPubKey = ""+env.alicePrivateKey.publicKey.toEthereumAddress()
    bobRawPubKey = ""+env.bobPrivateKey.publicKey.toEthereumAddress()

  })
  
  beforeEach(async () => {
    const wallets = await (hethers as any).getSigners()
    ;[wallet, aliceWallet] = wallets

    ;({HTS1400Contract} = await HTS1400ContractFixtureLocal());
    console.log()

  })

  function isError(err: any): err is Error {
    return err instanceof Error;
  }


})
