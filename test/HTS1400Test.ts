import EnvContainer from '../EnvContainer'
import { approveToken, associateToken, dissociateToken, sleep, transferToken } from '../utils/hederaUtils'
import { ContractId, TokenId, TopicId } from '@hashgraph/sdk'
import { solidity } from 'ethereum-waffle'
import hardhat, { ethers, hethers } from 'hardhat'
import { Wallet } from '@hashgraph/hethers'
import chai, { assert, expect } from 'chai'
import { HTS1400ContractFixture } from './shared/fixture'
import { getHbarBalanceForId, getTokenBalanceForId, getTokenInfo, getTokensForId } from '../utils/mirrorNodeUtils'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { HTS1400 } from '../typechain'
import { keccak256 } from 'ethers/lib/utils'
import Web3 from 'web3'
import { BigNumber } from 'ethers'

  chai.use(solidity)

  function isError(err: any): err is Error {
    return err instanceof Error;
  }
  let web3 = new Web3()

  let env: EnvContainer
  let signersWithAddress: any

  let wallet: Wallet
  let other: Wallet

  let myRawPubKey: string
  let aliceRawPubKey: string
  let bobRawPubKey: string
  let operatorRawPubKey: string

  let mySigner: SignerWithAddress;
  let aliceSigner: any;
  let bobSigner: any;
  let charlieSigner: any;
  let operatorSigner: any;
  let controllerSigner: any;
  let ownerSigner: any;

  let HTS1400Contract: HTS1400
  let HTS1400ContractId: ContractId
  let token: TokenId

  let emptyBytes32Str = web3.utils.padLeft(0, 64)

  async function HTS1400ContractFixtureLocal(): Promise<HTS1400>{
    let web3 = new Web3()
    return await HTS1400ContractFixture(
        "MySecurityToken",
        "MST",
        "Testing only",
        8,
        env.ownerPrivateKey.publicKey.toEthereumAddress(),
        env.controllerPrivateKey.publicKey.toEthereumAddress(),
        emptyBytes32Str, //[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        20
    )  
  }
  
describe('Contract', () => {

  before(async () => {
    env = new EnvContainer()

    myRawPubKey = ""+env.myPrivateKey.publicKey.toEthereumAddress()
    aliceRawPubKey = ""+env.alicePrivateKey.publicKey.toEthereumAddress()
    bobRawPubKey = ""+env.bobPrivateKey.publicKey.toEthereumAddress()
    operatorRawPubKey = ""+env.operatorPrivateKey.publicKey.toEthereumAddress()

    const wallets = await (hethers as any).getSigners()
    ;[wallet, other] = wallets
    signersWithAddress = await (hethers as any).getSigners()

    mySigner = signersWithAddress[0]
    aliceSigner = signersWithAddress[1]
    bobSigner = signersWithAddress[2]
    charlieSigner = signersWithAddress[3]
    operatorSigner = signersWithAddress[4]
    controllerSigner = signersWithAddress[5]
    ownerSigner = signersWithAddress[6]

    console.log()
  })
  
  beforeEach(async function () {

    HTS1400Contract = await HTS1400ContractFixtureLocal()
    HTS1400ContractId = ContractId.fromSolidityAddress(HTS1400Contract.address)
    token = TokenId.fromSolidityAddress(await HTS1400Contract.connect(mySigner).token())
    console.log()

  })

  describe('#Owner Controlled Functions', () => {
    it('Can pause/unpause the token', async () => {
      let tokenInfo = await getTokenInfo(token.toString())
      expect(tokenInfo.pause_status).to.eq('UNPAUSED')

      let resp = await HTS1400Contract.connect(ownerSigner).ownerPauseToken()
      await sleep(2000) // wait for mirror node to catch up
      tokenInfo = await getTokenInfo(token.toString())
      expect(tokenInfo.pause_status).to.eq('PAUSED')

      await HTS1400Contract.connect(ownerSigner).ownerUnpauseToken()
      await sleep(2000) // wait for mirror node to catch up
      tokenInfo = await getTokenInfo(token.toString())
      expect(tokenInfo.pause_status).to.eq('UNPAUSED')
    })
    it('Can grant/revoke kyc', async () => {
      
      await associateToken([token], env.aliceId, env.aliceClient)
      console.log()
      await sleep(2000)
      let tokenInfo = await getTokensForId(env.aliceId.toString(), token.toString())
      console.log()
      expect(tokenInfo.tokens[0].kyc_status).to.eq('REVOKED')
      
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(aliceRawPubKey)
      await sleep(2000) // wait for mirror node to catch up
      tokenInfo = await getTokensForId(env.aliceId.toString(), token.toString())
      expect(tokenInfo.tokens[0].kyc_status).to.eq('GRANTED')

      await HTS1400Contract.connect(ownerSigner).ownerRevokeTokenKyc(aliceRawPubKey)
      await sleep(2000) // wait for mirror node to catch up
      tokenInfo = await getTokensForId(env.aliceId.toString(), token.toString())
      expect(tokenInfo.tokens[0].kyc_status).to.eq('REVOKED')
    })
    it('Can withdraw hbar', async () => {
      
      let balance = await getHbarBalanceForId(HTS1400Contract.address) // dust left over from token create
      expect(+balance).to.be.gt(0)
      await HTS1400Contract.connect(ownerSigner).withdrawHbar(balance)
      await sleep(3000)
      let balanceAfter = await getHbarBalanceForId(HTS1400Contract.address)
      expect(+balanceAfter).to.eq(0)
    })
    it('Can update keys', async () => { // TODO
    })
  })
  describe('#Controller controlled functions', () => {
    describe('#HTS1643', () => {
      it('Get, set, remove document', async () => {
        const nameBytes = web3.utils.hexToBytes(web3.utils.padLeft(web3.utils.toHex('name1'), 64))
        const uri = 'uri1'
        const docHash = web3.utils.hexToBytes(web3.utils.keccak256('name1'))
        await HTS1400Contract.connect(controllerSigner).setDocument(nameBytes, uri, docHash)

        let docInfo = await HTS1400Contract.getDocument(nameBytes)
        expect(docInfo[0]).to.eq('uri1')
        expect(docInfo[1]).to.eq(web3.utils.bytesToHex(docHash))
        // docInfo[2] is timestamp, dont need to check accuracy

        let allDocs = await HTS1400Contract.getAllDocuments()
        expect(allDocs.length).to.eq(1)
        expect(allDocs[0]).to.eq(web3.utils.bytesToHex(nameBytes))

        await HTS1400Contract.connect(controllerSigner).removeDocument(nameBytes)
        allDocs = await HTS1400Contract.getAllDocuments()
        expect(allDocs.length).to.eq(0)

        docInfo = await HTS1400Contract.getDocument(nameBytes)
        expect(docInfo[0]).to.eq('')
        expect(docInfo[1]).to.eq(emptyBytes32Str)
        expect(docInfo[2]).to.eq(BigNumber.from(0))
      })
    })
    it('Issue', async () => { 
      await associateToken([token], env.aliceId, env.aliceClient)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(aliceRawPubKey)
      await HTS1400Contract.connect(controllerSigner).issue(aliceRawPubKey, 1e8, emptyBytes32Str)

      await sleep(4000)
      let data = await getTokensForId(env.aliceId.toString(), token.toString())
      let aliceBalance = data.tokens[0].balance
      expect(+aliceBalance).to.eq(Math.pow(10, 8))
      let aliceFreezeStatus = data.tokens[0].freeze_status
      expect(aliceFreezeStatus).to.eq('FROZEN')      

      // expect only one partition and 10^8 tokens to be in default partition
      let alicePartitions = await HTS1400Contract.partitionsOf(aliceRawPubKey)
      expect(alicePartitions.length).to.eq(1)
      expect(alicePartitions[0]).to.eq(emptyBytes32Str)

      let aliceDefaultPartitionBalance = await HTS1400Contract.balanceOfByPartition(emptyBytes32Str, aliceRawPubKey)
      expect(aliceDefaultPartitionBalance.toNumber()).to.eq(Math.pow(10, 8))
    })
    it('Issue by partition', async () => {
      await associateToken([token], env.aliceId, env.aliceClient)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(aliceRawPubKey)
      let newPartition = web3.utils.padLeft(1, 64)
      await HTS1400Contract.connect(controllerSigner).issueByPartition(
        newPartition, 
        aliceRawPubKey, 
        1e8,
        emptyBytes32Str
      )

      await sleep(4000)
      let data = await getTokensForId(env.aliceId.toString(), token.toString())
      let aliceBalance = data.tokens[0].balance
      expect(+aliceBalance).to.eq(Math.pow(10, 8))
      let aliceFreezeStatus = data.tokens[0].freeze_status
      expect(aliceFreezeStatus).to.eq('FROZEN')      

      // expect only one partition and 10^8 tokens to be in default partition
      let alicePartitions = await HTS1400Contract.partitionsOf(aliceRawPubKey)
      expect(alicePartitions.length).to.eq(1)
      expect(alicePartitions[0]).to.eq(newPartition)

      let aliceNewPartitionBalance = await HTS1400Contract.balanceOfByPartition(newPartition, aliceRawPubKey)
      expect(aliceNewPartitionBalance.toNumber()).to.eq(Math.pow(10, 8))
    })
    it('Controller transfer', async () => {
      // getting DUPLICATE_TRANSACTION errors on ContractCallQuery without all the sleeps
      // issue to alice to default partition, confiscate 4 and send to bob
      await associateToken([token], env.aliceId, env.aliceClient)
      await sleep(2000)
      await associateToken([token], env.bobId, env.bobClient)
      await sleep(2000)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(aliceRawPubKey)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(bobRawPubKey)
      await HTS1400Contract.connect(controllerSigner).issue(aliceRawPubKey, 1e8, emptyBytes32Str)

      await HTS1400Contract.connect(controllerSigner).controllerTransfer(
        aliceRawPubKey,
        bobRawPubKey,
        emptyBytes32Str,
        4e7,
        emptyBytes32Str,
        emptyBytes32Str
      )

      await sleep(4000)
      let data = await getTokensForId(env.aliceId.toString(), token.toString())
      let balance = data.tokens[0].balance
      expect(+balance).to.eq(6 * Math.pow(10, 7))
      let freezeStatus = data.tokens[0].freeze_status
      expect(freezeStatus).to.eq('FROZEN')
 
      data = await getTokensForId(env.bobId.toString(), token.toString())
      balance = data.tokens[0].balance
      expect(+balance).to.eq(4 * Math.pow(10, 7))
      freezeStatus = data.tokens[0].freeze_status
      expect(freezeStatus).to.eq('FROZEN')

      await sleep(2000)
      // expect only one partition and 6e7 tokens to be in default partition for alice and bob
      let alicePartitions = await HTS1400Contract.partitionsOf(aliceRawPubKey)
      expect(alicePartitions.length).to.eq(1)
      expect(alicePartitions[0]).to.eq(emptyBytes32Str)

      await sleep(2000)
      let aliceDefaultPartitionBalance = await HTS1400Contract.balanceOfByPartition(emptyBytes32Str, aliceRawPubKey)
      expect(aliceDefaultPartitionBalance.toNumber()).to.eq(6 * Math.pow(10, 7))

      await sleep(2000)
      let bobPartitions = await HTS1400Contract.partitionsOf(bobRawPubKey)
      expect(bobPartitions.length).to.eq(1)
      expect(bobPartitions[0]).to.eq(emptyBytes32Str)
      
      await sleep(2000)
      let bobDefaultPartitionBalance = await HTS1400Contract.balanceOfByPartition(emptyBytes32Str, bobRawPubKey)
      expect(bobDefaultPartitionBalance.toNumber()).to.eq(4 * Math.pow(10, 7))
    })
  })
  describe('#TokenHolder controlled functions', () => {
    it('Transfer', async () => {
      await associateToken([token], env.aliceId, env.aliceClient)
      // await sleep(2000)
      await associateToken([token], env.bobId, env.bobClient)
      // await sleep(2000)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(aliceRawPubKey)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(bobRawPubKey)
      await HTS1400Contract.connect(controllerSigner).issue(aliceRawPubKey, 1e8, emptyBytes32Str)

      await approveToken(token, env.aliceId.toString(), HTS1400ContractId.toString(), 1e8, env.aliceClient)
      await HTS1400Contract.connect(aliceSigner).transfer(bobRawPubKey, 4e7)

      await sleep(4000)
      let data = await getTokensForId(env.aliceId.toString(), token.toString())
      let balance = data.tokens[0].balance
      expect(+balance).to.eq(6 * Math.pow(10, 7))
      let freezeStatus = data.tokens[0].freeze_status
      expect(freezeStatus).to.eq('FROZEN')
 
      data = await getTokensForId(env.bobId.toString(), token.toString())
      balance = data.tokens[0].balance
      expect(+balance).to.eq(4 * Math.pow(10, 7))
      freezeStatus = data.tokens[0].freeze_status
      expect(freezeStatus).to.eq('FROZEN')

      await sleep(2000)

      let alicePartitions = await HTS1400Contract.partitionsOf(aliceRawPubKey)
      expect(alicePartitions.length).to.eq(1)
      expect(alicePartitions[0]).to.eq(emptyBytes32Str)

      await sleep(2000)
      let aliceDefaultPartitionBalance = await HTS1400Contract.balanceOfByPartition(emptyBytes32Str, aliceRawPubKey)
      expect(aliceDefaultPartitionBalance.toNumber()).to.eq(6 * Math.pow(10, 7))

      await sleep(2000)
      let bobPartitions = await HTS1400Contract.partitionsOf(bobRawPubKey)
      expect(bobPartitions.length).to.eq(1)
      expect(bobPartitions[0]).to.eq(emptyBytes32Str)
      
      await sleep(2000)
      let bobDefaultPartitionBalance = await HTS1400Contract.balanceOfByPartition(emptyBytes32Str, bobRawPubKey)
      expect(bobDefaultPartitionBalance.toNumber()).to.eq(4 * Math.pow(10, 7))
    })
    it('TransferByPartition', async () => {
      await associateToken([token], env.aliceId, env.aliceClient)
      await associateToken([token], env.bobId, env.bobClient)
      let newPartition = web3.utils.padLeft(1, 64)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(aliceRawPubKey)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(bobRawPubKey)
      await HTS1400Contract.connect(controllerSigner).issueByPartition(
        newPartition, 
        aliceRawPubKey, 
        1e8,
        emptyBytes32Str
      )
  
      await approveToken(token, env.aliceId.toString(), HTS1400ContractId.toString(), 1e8, env.aliceClient)
      await HTS1400Contract.connect(aliceSigner).transferByPartition(newPartition, bobRawPubKey, 4e7, emptyBytes32Str)

      await sleep(4000)
      let data = await getTokensForId(env.aliceId.toString(), token.toString())
      let balance = data.tokens[0].balance
      expect(+balance).to.eq(6 * Math.pow(10, 7))
      let freezeStatus = data.tokens[0].freeze_status
      expect(freezeStatus).to.eq('FROZEN')
 
      data = await getTokensForId(env.bobId.toString(), token.toString())
      balance = data.tokens[0].balance
      expect(+balance).to.eq(4 * Math.pow(10, 7))
      freezeStatus = data.tokens[0].freeze_status
      expect(freezeStatus).to.eq('FROZEN')

      await sleep(2000)

      let alicePartitions = await HTS1400Contract.partitionsOf(aliceRawPubKey)
      expect(alicePartitions.length).to.eq(1)
      expect(alicePartitions[0]).to.eq(newPartition)

      await sleep(2000)
      let aliceNewPartitionBalance = await HTS1400Contract.balanceOfByPartition(newPartition, aliceRawPubKey)
      expect(aliceNewPartitionBalance.toNumber()).to.eq(6 * Math.pow(10, 7))

      await sleep(2000)
      let bobPartitions = await HTS1400Contract.partitionsOf(bobRawPubKey)
      expect(bobPartitions.length).to.eq(1)
      expect(bobPartitions[0]).to.eq(newPartition)
      
      await sleep(2000)
      let bobNewPartitionBalance = await HTS1400Contract.balanceOfByPartition(newPartition, bobRawPubKey)
      expect(bobNewPartitionBalance.toNumber()).to.eq(4 * Math.pow(10, 7))
    })
    it('Redeem', async () => { 
      await associateToken([token], env.aliceId, env.aliceClient)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(aliceRawPubKey)
      await HTS1400Contract.connect(controllerSigner).issue(aliceRawPubKey, 1e8, emptyBytes32Str)

      // redeem some and check subtraction in contract

      await approveToken(token, env.aliceId.toString(), HTS1400ContractId.toString(), 1e8, env.aliceClient)
      await HTS1400Contract.connect(aliceSigner).redeem(4e7, emptyBytes32Str)

      let alicePartitions = await HTS1400Contract.partitionsOf(aliceRawPubKey)
      expect(alicePartitions.length).to.eq(1)
      expect(alicePartitions[0]).to.eq(emptyBytes32Str)

      let aliceDefaultPartitionBalance = await HTS1400Contract.balanceOfByPartition(emptyBytes32Str, aliceRawPubKey)
      expect(aliceDefaultPartitionBalance.toNumber()).to.eq(6 * Math.pow(10, 7))

      await sleep(4000)
      let data = await getTokensForId(env.aliceId.toString(), token.toString())
      let aliceBalance = data.tokens[0].balance
      expect(+aliceBalance).to.eq(6 * Math.pow(10, 7))
      let aliceFreezeStatus = data.tokens[0].freeze_status
      expect(aliceFreezeStatus).to.eq('FROZEN')
      
      // redeem the rest

      await HTS1400Contract.connect(aliceSigner).redeem(6e7, emptyBytes32Str)

      // expect no more partitions for alice and balance to return 0
      alicePartitions = await HTS1400Contract.partitionsOf(aliceRawPubKey)
      expect(alicePartitions.length).to.eq(0)

      aliceDefaultPartitionBalance = await HTS1400Contract.balanceOfByPartition(emptyBytes32Str, aliceRawPubKey)
      expect(aliceDefaultPartitionBalance.toNumber()).to.eq(0)

      await sleep(4000)
      data = await getTokensForId(env.aliceId.toString(), token.toString())
      aliceBalance = data.tokens[0].balance
      expect(+aliceBalance).to.eq(0)
      aliceFreezeStatus = data.tokens[0].freeze_status
      expect(aliceFreezeStatus).to.eq('FROZEN')
    })
    it('RedeemByPartition', async () => {
      await associateToken([token], env.aliceId, env.aliceClient)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(aliceRawPubKey)
      let newPartition = web3.utils.padLeft(1, 64)
      await HTS1400Contract.connect(controllerSigner).issueByPartition(
        newPartition, 
        aliceRawPubKey, 
        1e8,
        emptyBytes32Str
      )

      // redeem some and check subtraction in contract

      await approveToken(token, env.aliceId.toString(), HTS1400ContractId.toString(), 1e8, env.aliceClient)
      await HTS1400Contract.connect(aliceSigner).redeemByPartition(
        newPartition, 
        4e7, 
        emptyBytes32Str
      )

      let alicePartitions = await HTS1400Contract.partitionsOf(aliceRawPubKey)
      expect(alicePartitions.length).to.eq(1)
      expect(alicePartitions[0]).to.eq(newPartition)

      let aliceNewPartitionBalance = await HTS1400Contract.balanceOfByPartition(newPartition, aliceRawPubKey)
      expect(aliceNewPartitionBalance.toNumber()).to.eq(6 * Math.pow(10, 7))

      await sleep(4000)
      let data = await getTokensForId(env.aliceId.toString(), token.toString())
      let aliceBalance = data.tokens[0].balance
      expect(+aliceBalance).to.eq(6 * Math.pow(10, 7))
      let aliceFreezeStatus = data.tokens[0].freeze_status
      expect(aliceFreezeStatus).to.eq('FROZEN')
      
      // redeem the rest

      await HTS1400Contract.connect(aliceSigner).redeemByPartition(
        newPartition, 
        6e7, 
        emptyBytes32Str
      )

      // expect no more partitions for alice and balance to return 0
      alicePartitions = await HTS1400Contract.partitionsOf(aliceRawPubKey)
      expect(alicePartitions.length).to.eq(0)

      aliceNewPartitionBalance = await HTS1400Contract.balanceOfByPartition(newPartition, aliceRawPubKey)
      expect(aliceNewPartitionBalance.toNumber()).to.eq(0)

      await sleep(4000)
      data = await getTokensForId(env.aliceId.toString(), token.toString())
      aliceBalance = data.tokens[0].balance
      expect(+aliceBalance).to.eq(0)
      aliceFreezeStatus = data.tokens[0].freeze_status
      expect(aliceFreezeStatus).to.eq('FROZEN')
    })
  })
  describe('#Operator', () => {
    it('Authorize and revoke', async () => {
      await HTS1400Contract.authorizeOperator(aliceRawPubKey)
      let isAuth = await HTS1400Contract.isOperator(aliceRawPubKey, myRawPubKey)
      expect(isAuth).to.eq(true)

      await HTS1400Contract.revokeOperator(aliceRawPubKey)
      isAuth = await HTS1400Contract.isOperator(aliceRawPubKey, myRawPubKey)
      expect(isAuth).to.eq(false)
    })
    it('Authorize and revoke by partition', async () => {
      let newPartition = web3.utils.padLeft(1, 64)
      await HTS1400Contract.authorizeOperatorByPartition(newPartition, aliceRawPubKey)
      let isAuth = await HTS1400Contract.isOperatorForPartition(newPartition, aliceRawPubKey, myRawPubKey)
      expect(isAuth).to.eq(true)

      await HTS1400Contract.revokeOperatorByPartition(newPartition, aliceRawPubKey)
      isAuth = await HTS1400Contract.isOperatorForPartition(newPartition, aliceRawPubKey, myRawPubKey)
      expect(isAuth).to.eq(false)
    })
    it('Operator transfer by partition', async () => {
      // authorize operator to transfer from alice to bob
      await associateToken([token], env.aliceId, env.aliceClient)
      await associateToken([token], env.bobId, env.bobClient)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(aliceRawPubKey)
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(bobRawPubKey)
      let newPartition = web3.utils.padLeft(1, 64)
      await HTS1400Contract.connect(controllerSigner).issueByPartition(
        newPartition, 
        aliceRawPubKey, 
        1e8,
        emptyBytes32Str
      )

      await HTS1400Contract.connect(aliceSigner).authorizeOperator(operatorRawPubKey)
      let isAuth = await HTS1400Contract.isOperator(operatorRawPubKey, aliceRawPubKey)
      expect(isAuth).to.eq(true)

      await approveToken(token, env.aliceId.toString(), HTS1400ContractId.toString(), 1e8, env.aliceClient)
      await HTS1400Contract.connect(operatorSigner).operatorTransferByPartition(
        newPartition,
        aliceRawPubKey,
        bobRawPubKey,
        4e7,
        emptyBytes32Str,
        emptyBytes32Str
      )

      await sleep(4000)
      let data = await getTokensForId(env.aliceId.toString(), token.toString())
      let balance = data.tokens[0].balance
      expect(+balance).to.eq(6 * Math.pow(10, 7))
      let freezeStatus = data.tokens[0].freeze_status
      expect(freezeStatus).to.eq('FROZEN')
 
      data = await getTokensForId(env.bobId.toString(), token.toString())
      balance = data.tokens[0].balance
      expect(+balance).to.eq(4 * Math.pow(10, 7))
      freezeStatus = data.tokens[0].freeze_status
      expect(freezeStatus).to.eq('FROZEN')

      let alicePartitions = await HTS1400Contract.partitionsOf(aliceRawPubKey)
      expect(alicePartitions.length).to.eq(1)
      expect(alicePartitions[0]).to.eq(newPartition)

      await sleep(2000)
      let aliceNewPartitionBalance = await HTS1400Contract.balanceOfByPartition(newPartition, aliceRawPubKey)
      expect(aliceNewPartitionBalance.toNumber()).to.eq(6 * Math.pow(10, 7))

      await sleep(2000)
      let bobPartitions = await HTS1400Contract.partitionsOf(bobRawPubKey)
      expect(bobPartitions.length).to.eq(1)
      expect(bobPartitions[0]).to.eq(newPartition)
      
      await sleep(2000)
      let bobNewPartitionBalance = await HTS1400Contract.balanceOfByPartition(newPartition, bobRawPubKey)
      expect(bobNewPartitionBalance.toNumber()).to.eq(4 * Math.pow(10, 7))

      // should revert if stranger tries
      try {
        await HTS1400Contract.operatorTransferByPartition(
          newPartition,
          aliceRawPubKey,
          bobRawPubKey,
          1e7,
          emptyBytes32Str,
          emptyBytes32Str
        )
        assert("notnull" === null, 'this should not succeed')
      } catch (err) {
        assert(isError(err), 'unexpected error type');
        if (isError(err)) {
          assert(err.message.indexOf('CONTRACT_REVERT_EXECUTED') !== -1, 'did not have CONTRACT_REVERT_EXECUTED in error message: ' + err.message)
        }
      }
    })
  })

})
