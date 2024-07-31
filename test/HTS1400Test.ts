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

  let mySigner: SignerWithAddress;
  let aliceSigner: any;
  let bobSigner: any;
  let charlieSigner: any;
  let operatorSigner: any;
  let controllerSigner: any;
  let ownerSigner: any;

  let HTS1400Contract: HTS1400
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
    it.only('Issue', async () => { // acts on default partition
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
  })
})
