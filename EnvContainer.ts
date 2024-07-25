import { AccountId, Client, ContractId, PrivateKey, TokenId } from "@hashgraph/sdk"
import hardhat from 'hardhat'

/**
 * Container to hold environment variables from dotenv
 */
export default class EnvContainer {

    // feeToId: AccountId
    feeToSetterId?: AccountId
    myAccountId?: AccountId
    aliceId: AccountId
    bobId?: AccountId
    charlieId?: AccountId
    devId?: AccountId
    minterId?: AccountId
    feeRecId?: AccountId

    ftsPk?: PrivateKey
    myPrivateKey?: PrivateKey
    alicePrivateKey: PrivateKey
    bobPrivateKey?: PrivateKey
    charliePrivateKey?: PrivateKey
    devPrivateKey?: PrivateKey
    minterPrivateKey?: PrivateKey
    feeRecKey?: PrivateKey

    clientfts?: Client
    myClient?: Client
    aliceClient: Client
    bobClient?: Client
    charlieClient?: Client
    devClient?: Client
    minterClient?: Client
    feeRecClient?: Client

    sauce?: TokenId
    usdc?: TokenId
    strudel?: TokenId
    dai?: TokenId
    mic?: TokenId

    whbarContractId?: ContractId
    whbar?: TokenId

    constructor(network: string = hardhat.network.name, path: string="./.env") {
        switch(network) {
            case 'local':
            
                this.myAccountId = AccountId.fromString(process.env.LOCAL_MYACCOUNTID!);
                this.myPrivateKey = PrivateKey.fromStringECDSA(process.env.LOCAL_MYPRIVATEKEY!);
                this.myClient = Client.forLocalNode().setOperator(this.myAccountId, this.myPrivateKey);

                this.aliceId = AccountId.fromString(process.env.LOCAL_ALICE_ID!);
                this.alicePrivateKey = PrivateKey.fromStringECDSA(process.env.LOCAL_ALICE_PRIVATEKEY!);
                this.aliceClient = Client.forLocalNode().setOperator(this.aliceId, this.alicePrivateKey);
              
                this.feeRecId = AccountId.fromString(process.env.LOCAL_FEEREC_ID!);
                this.feeRecKey = PrivateKey.fromStringECDSA(process.env.LOCAL_FEEREC_PRIVATEKEY!);
                this.feeRecClient = Client.forLocalNode().setOperator(this.feeRecId!, this.feeRecKey!);

                break;            
            case 'previewnet':

                this.myAccountId = AccountId.fromString(process.env.PREVNET_MYACCOUNTID!);
                this.myPrivateKey = PrivateKey.fromStringECDSA(process.env.PREVNET_MYPRIVATEKEY!);
                this.myClient = Client.forPreviewnet().setOperator(this.myAccountId, this.myPrivateKey);

                this.aliceId = AccountId.fromString(process.env.PREVNET_ALICE_ID!);
                this.alicePrivateKey = PrivateKey.fromStringECDSA(process.env.PREVNET_ALICE_PRIVATEKEY!);
                this.aliceClient = Client.forPreviewnet().setOperator(this.aliceId, this.alicePrivateKey);
            
                this.feeRecId = AccountId.fromString(process.env.PREVNET_FEEREC_ID!);
                this.feeRecKey = PrivateKey.fromStringECDSA(process.env.PREVNET_FEEREC_PRIVATEKEY!);
                this.feeRecClient = Client.forPreviewnet().setOperator(this.feeRecId!, this.feeRecKey!);   
                
                break;
            case 'testnet':
            default:
                
                this.myAccountId = AccountId.fromString(process.env.TESTNET_MYACCOUNTID!);
                this.myPrivateKey = PrivateKey.fromStringECDSA(process.env.TESTNET_MYPRIVATEKEY!);
                this.myClient = Client.forTestnet().setOperator(this.myAccountId, this.myPrivateKey);

                this.aliceId = AccountId.fromString(process.env.TESTNET_ALICE_ID!);
                this.alicePrivateKey = PrivateKey.fromStringECDSA(process.env.TESTNET_ALICE_PRIVATEKEY!);
                this.aliceClient = Client.forTestnet().setOperator(this.aliceId, this.alicePrivateKey);
            
                this.feeRecId = AccountId.fromString(process.env.TESTNET_FEEREC_ID!);
                this.feeRecKey = PrivateKey.fromStringECDSA(process.env.TESTNET_FEEREC_PRIVATEKEY!);
                this.feeRecClient = Client.forTestnet().setOperator(this.feeRecId!, this.feeRecKey!);       
                break;
        }

    }
}