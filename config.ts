// @ts-nocheck
import { NetworksUserConfig } from 'hardhat/types';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' })

export const networks: NetworksUserConfig = {

	local: {
		consensusNodes: [
			{
				url: '127.0.0.1:50211',
				url: '127.0.0.1:50211',
				nodeId: '0.0.3'
			}
		],
		mirrorNodeUrl: 'http://127.0.0.1:5551',
		chainId: 0,
		accounts: [
			{
				"account": process.env.LOCAL_MYACCOUNTID,
				"privateKey": process.env.LOCAL_MYPRIVATEKEY 
			  },
			  {
				"account": process.env.LOCAL_ALICE_ID,
				"privateKey": process.env.LOCAL_ALICE_PRIVATEKEY 
			  },
			  {
				"account": process.env.LOCAL_BOB_ID,
				"privateKey": process.env.LOCAL_BOB_PRIVATEKEY 
			  },
			  {
				"account": process.env.LOCAL_CHARLIE_ID,
				"privateKey": process.env.LOCAL_CHARLIE_PRIVATEKEY 
			  },
			  {
				"account": process.env.LOCAL_OPERATOR_ID,
				"privateKey": process.env.LOCAL_OPERATOR_PRIVATEKEY 
			  },
			  {
				"account": process.env.LOCAL_CONTROLLER_ID,
				"privateKey": process.env.LOCAL_CONTROLLER_PRIVATEKEY 
			  },
			  {
				"account": process.env.LOCAL_OWNER_ID,
				"privateKey": process.env.LOCAL_OWNER_PRIVATEKEY 
			  }
		]
	},
	testnet: { // add other roles for unit tests if using non-local chain
		mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
		accounts: [
			{
				"account": process.env.TESTNET_MYACCOUNTID,
				"privateKey": process.env.TESTNET_MYPRIVATEKEY 
			  },
			  {
				"account": process.env.TESTNET_ALICE_ID,
				"privateKey": process.env.TESTNET_ALICE_PRIVATEKEY 
			  },
			  {
				"account": process.env.TESTNET_BOB_ID,
				"privateKey": process.env.TESTNET_BOB_PRIVATEKEY 
			  },
			  {
				"account": process.env.TESTNET_CHARLIE_ID,
				"privateKey": process.env.TESTNET_CHARLIE_PRIVATEKEY 
			  },
			  {
				"account": process.env.TESTNET_OPERATOR_ID,
				"privateKey": process.env.TESTNET_OPERATOR_PRIVATEKEY 
			  },
			  {
				"account": process.env.TESTNET_CONTROLLER_ID,
				"privateKey": process.env.TESTNET_CONTROLLER_PRIVATEKEY 
			  },
			  {
				"account": process.env.TESTNET_OWNER_ID,
				"privateKey": process.env.TESTNET_OWNER_PRIVATEKEY 
			  }
		]
	}
};