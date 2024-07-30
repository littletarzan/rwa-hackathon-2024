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

  it('sets the owner', async () => {
    try {
      let signersWithAddress = await (hethers as any).getSigners()
      let resp = await HTS1400Contract.connect(signersWithAddress[1]).setOwner(env.aliceId.toSolidityAddress())
      assert("notnull" === null, 'this contract call should not succeed')
    } catch (err) {
      assert(isError(err), 'unexpected error type');
      if (isError(err)) {
        assert(err.message.indexOf('CONTRACT_REVERT_EXECUTED') !== -1, 'did not have CONTRACT_REVERT_EXECUTED in error message: ' + err.message)
      }
    }
    // set the value
    await HTS1400Contract.setOwner(env.aliceId.toSolidityAddress())
    let newFeeTo = await HTS1400Contract.owner()
    expect(newFeeTo.toUpperCase()).to.eq("0X" + env.aliceId.toSolidityAddress().toUpperCase())
  })

  it('dissociates tokens', async () => {
    await sleep(3000)
    let bal0_before = await getTokenBalanceForId(
      ContractId.fromSolidityAddress(HTS1400Contract.address).toString(),
      token0.toString(),
      'local'
    )
    let bal1_before = await getTokenBalanceForId(
      ContractId.fromSolidityAddress(HTS1400Contract.address).toString(),
      token0.toString(),
      'local'
    )
    expect(bal0_before).to.equal(0)
    expect(bal1_before).to.equal(0)

    await HTS1400Contract.dissociateToken([token0.toSolidityAddress(), token1.toSolidityAddress()])
    let bal = await getTokenBalanceForId(
      ContractId.fromSolidityAddress(HTS1400Contract.address).toString(),
      token0.toString(),
      'local'
    )
    await sleep(3000)
    let bal0_after = await getTokenBalanceForId(
      ContractId.fromSolidityAddress(HTS1400Contract.address).toString(),
      token0.toString(),
      'local'
    )
    let bal1_after = await getTokenBalanceForId(
      ContractId.fromSolidityAddress(HTS1400Contract.address).toString(),
      token0.toString(),
      'local'
    )
    expect(bal0_after).to.equal(-1)
    expect(bal1_after).to.equal(-1)
  })
  it('deposits', async () => {
    await approveToken(token0, env.myAccountId.toString(), ContractId.fromSolidityAddress(HTS1400Contract.address).toString(), 100, env.myClient)
    await HTS1400Contract.deposit(token0.toSolidityAddress(), 100)

    await sleep(3000)
    let bal0_after = await getTokenBalanceForId(
      ContractId.fromSolidityAddress(HTS1400Contract.address).toString(),
      token0.toString(),
      'local'
    )

    let myBalance = await HTS1400Contract.userBalances(myRawPubKey, token0.toSolidityAddress())
    console.log() // ok

    expect(bal0_after.toString()).to.eq('100')
    expect(myBalance.toString()).to.eq('100')
  })
  it('withdraws', async () => {

    await approveToken(token0, env.myAccountId.toString(), ContractId.fromSolidityAddress(HTS1400Contract.address).toString(), 100, env.myClient)
    await HTS1400Contract.deposit(token0.toSolidityAddress(), 100)

    await sleep(3000)

    await HTS1400Contract.withdraw(token0.toSolidityAddress(), 50)
    
    await sleep(3000)

    let bal0_after = await getTokenBalanceForId(
      ContractId.fromSolidityAddress(HTS1400Contract.address).toString(),
      token0.toString(),
      'local'
    )

    let myBalance = await HTS1400Contract.userBalances(myRawPubKey, token0.toSolidityAddress())
    console.log()

    expect(bal0_after.toString()).to.eq('50')
    expect(myBalance.toString()).to.eq('50')

    // remove the rest

    await sleep(3000)

    await HTS1400Contract.withdraw(token0.toSolidityAddress(), 50)

    await sleep(3000)
    let bal0_after2 = await getTokenBalanceForId(
      ContractId.fromSolidityAddress(HTS1400Contract.address).toString(),
      token0.toString(),
      'local'
    )

    let myBalance2 = await HTS1400Contract.userBalances(myRawPubKey, token0.toSolidityAddress())

    expect(bal0_after2.toString()).to.eq('0')
    expect(myBalance2.toString()).to.eq('0')

  })
  it.only('swaps', async () => {
    // let signersWithAddress = await (hethers as any).getSigners()

    // associate USDC and AAPL to alice and bob
    await associateToken([token0, token1], env.aliceId, env.aliceClient)
    await associateToken([token0, token1], env.bobId, env.bobClient)

    // transfer them some to deposit
    await transferToken(token0, env.myAccountId, env.aliceId, 100, env.myClient)
    await transferToken(token1, env.myAccountId, env.aliceId, 100, env.myClient)
    await transferToken(token0, env.myAccountId, env.bobId, 100, env.myClient)
    await transferToken(token1, env.myAccountId, env.bobId, 100, env.myClient)

    // deposit the transferred tokens
    await approveToken(token0, env.aliceId.toString(), ContractId.fromSolidityAddress(HTS1400Contract.address).toString(), 100, env.aliceClient)
    await HTS1400Contract.connect(aliceWallet.address!).deposit(token0.toSolidityAddress(), 100)

    console.log('check')
    await approveToken(token1, env.aliceId.toString(), ContractId.fromSolidityAddress(HTS1400Contract.address).toString(), 100, env.aliceClient)
    await HTS1400Contract.connect(aliceWallet.address!).deposit(token1.toSolidityAddress(), 100)

    console.log('check2')
    await approveToken(token0, env.bobId.toString(), ContractId.fromSolidityAddress(HTS1400Contract.address).toString(), 100, env.bobClient)
    await HTS1400Contract.connect(bobWallet.address!).deposit(token0.toSolidityAddress(), 100)

    console.log('check3')
    await approveToken(token1, env.bobId.toString(), ContractId.fromSolidityAddress(HTS1400Contract.address).toString(), 100, env.bobClient)
    await HTS1400Contract.connect(bobWallet.address!).deposit(token1.toSolidityAddress(), 100)

    console.log('check4')
    await sleep(3000)
    let bal0_after = await getTokenBalanceForId(
      ContractId.fromSolidityAddress(HTS1400Contract.address).toString(),
      token0.toString(),
      'local'
    )

    let myBalance = await HTS1400Contract.userBalances(myRawPubKey, token0.toSolidityAddress())
    console.log() // ok

    expect(bal0_after.toString()).to.eq('100')
    expect(myBalance.toString()).to.eq('100')
  })

})
