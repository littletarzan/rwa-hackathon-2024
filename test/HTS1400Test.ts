import EnvContainer from '../EnvContainer'
import { approveToken, associateToken, createAccountAndAssociateToken, dissociateToken, sleep, transferToken } from '../utils/hederaUtils'
import { ContractId, TokenId, TopicId } from '@hashgraph/sdk'
import { solidity } from 'ethereum-waffle'
import hardhat, { ethers, hethers } from 'hardhat'
import { Wallet } from '@hashgraph/hethers'
import chai, { assert, expect } from 'chai'
import { HTS1400ContractFixture } from './shared/fixture'
import { getTokenBalanceForId, getTokenInfo, getTokensForId } from '../utils/mirrorNodeUtils'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { HTS1400 } from '../typechain'

  chai.use(solidity)

  function isError(err: any): err is Error {
    return err instanceof Error;
  }

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

  async function HTS1400ContractFixtureLocal(): Promise<HTS1400>{

    return await HTS1400ContractFixture(
        "MySecurityToken",
        "MST",
        "Testing only",
        8,
        env.ownerPrivateKey.publicKey.toEthereumAddress(),
        env.controllerPrivateKey.publicKey.toEthereumAddress(),
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
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
      await sleep(4000) // wait for mirror node to catch up
      tokenInfo = await getTokenInfo(token.toString())
      expect(tokenInfo.pause_status).to.eq('PAUSED')

      await HTS1400Contract.connect(ownerSigner).ownerUnpauseToken()
      await sleep(4000) // wait for mirror node to catch up
      tokenInfo = await getTokenInfo(token.toString())
      expect(tokenInfo.pause_status).to.eq('UNPAUSED')
    })
    it.only('Can grant/revoke kyc', async () => {
      
      // let { newAccountId, alias}  = await createAccountAndAssociateToken(token, env.myPrivateKey, env.myClient)
      await associateToken([token], env.aliceId, env.aliceClient)
      console.log()
      await sleep(4000)
      let tokenInfo = await getTokensForId(env.aliceId.toString(), token.toString())
      console.log()
      expect(tokenInfo.tokens[0].kyc_status).to.eq('REVOKED')
      
      await HTS1400Contract.connect(ownerSigner).ownerGrantTokenKyc(aliceRawPubKey)
      await sleep(4000) // wait for mirror node to catch up
      tokenInfo = await getTokensForId(env.aliceId.toString(), token.toString())
      expect(tokenInfo.tokens[0].kyc_status).to.eq('GRANTED')

      await HTS1400Contract.connect(ownerSigner).ownerRevokeTokenKyc(aliceRawPubKey)
      await sleep(4000) // wait for mirror node to catch up
      tokenInfo = await getTokensForId(env.aliceId.toString(), token.toString())
      expect(tokenInfo.tokens[0].kyc_status).to.eq('REVOKED')
    })
  })
})
