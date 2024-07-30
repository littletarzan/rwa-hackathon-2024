import { AccountId, Client, ContractId, PrivateKey, TokenId } from "@hashgraph/sdk"
import hardhat from 'hardhat'

/**
 * Container to hold environment variables from dotenv
 */
export default class EnvContainer {

    // feeToId: AccountId
    myAccountId: AccountId
    aliceId: AccountId
    bobId: AccountId
    charlieId: AccountId
    operatorId: AccountId
    controllerId: AccountId
    ownerId: AccountId

    myPrivateKey: PrivateKey
    alicePrivateKey: PrivateKey
    bobPrivateKey: PrivateKey
    charliePrivateKey: PrivateKey
    operatorPrivateKey: PrivateKey
    controllerPrivateKey: PrivateKey
    ownerPrivateKey: PrivateKey

    myClient: Client
    aliceClient: Client
    bobClient: Client
    charlieClient: Client
    operatorClient: Client
    controllerClient: Client
    ownerClient: Client

    // fill in other cases if network is not local
    constructor(network: string = hardhat.network.name, path: string="./.env") {
        // switch(network) {
            // case 'local':
            
                this.myAccountId = AccountId.fromString(process.env.LOCAL_MYACCOUNTID!);
                this.myPrivateKey = PrivateKey.fromStringECDSA(process.env.LOCAL_MYPRIVATEKEY!);
                this.myClient = Client.forLocalNode().setOperator(this.myAccountId, this.myPrivateKey);

                this.aliceId = AccountId.fromString(process.env.LOCAL_ALICE_ID!);
                this.alicePrivateKey = PrivateKey.fromStringECDSA(process.env.LOCAL_ALICE_PRIVATEKEY!);
                this.aliceClient = Client.forLocalNode().setOperator(this.aliceId, this.alicePrivateKey);
              
                this.bobId = AccountId.fromString(process.env.LOCAL_BOB_ID!);
                this.bobPrivateKey = PrivateKey.fromStringECDSA(process.env.LOCAL_BOB_PRIVATEKEY!);
                this.bobClient = Client.forLocalNode().setOperator(this.bobId, this.bobPrivateKey);

                this.charlieId = AccountId.fromString(process.env.LOCAL_CHARLIE_ID!);
                this.charliePrivateKey = PrivateKey.fromStringECDSA(process.env.LOCAL_CHARLIE_PRIVATEKEY!);
                this.charlieClient = Client.forLocalNode().setOperator(this.charlieId, this.charliePrivateKey);

                this.operatorId = AccountId.fromString(process.env.LOCAL_OPERATOR_ID!);
                this.operatorPrivateKey = PrivateKey.fromStringECDSA(process.env.LOCAL_OPERATOR_PRIVATEKEY!);
                this.operatorClient = Client.forLocalNode().setOperator(this.operatorId, this.operatorPrivateKey);

                this.controllerId = AccountId.fromString(process.env.LOCAL_CONTROLLER_ID!);
                this.controllerPrivateKey = PrivateKey.fromStringECDSA(process.env.LOCAL_CONTROLLER_PRIVATEKEY!);
                this.controllerClient = Client.forLocalNode().setOperator(this.controllerId, this.controllerPrivateKey);

                this.ownerId = AccountId.fromString(process.env.LOCAL_OWNER_ID!);
                this.ownerPrivateKey = PrivateKey.fromStringECDSA(process.env.LOCAL_OWNER_PRIVATEKEY!);
                this.ownerClient = Client.forLocalNode().setOperator(this.ownerId, this.ownerPrivateKey);

            //     break;            
            // case 'previewnet': // add the rest to previewnet and local if using those

            
            //     break;
            // case 'testnet':
            // default:
                
            //     this.myAccountId = AccountId.fromString(process.env.TESTNET_MYACCOUNTID!);
            //     this.myPrivateKey = PrivateKey.fromStringECDSA(process.env.TESTNET_MYPRIVATEKEY!);
            //     this.myClient = Client.forTestnet().setOperator(this.myAccountId, this.myPrivateKey);

            //     this.aliceId = AccountId.fromString(process.env.TESTNET_ALICE_ID!);
            //     this.alicePrivateKey = PrivateKey.fromStringECDSA(process.env.TESTNET_ALICE_PRIVATEKEY!);
            //     this.aliceClient = Client.forTestnet().setOperator(this.aliceId, this.alicePrivateKey);

            //     break;
        // }

    }
}