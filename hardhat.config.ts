import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-watcher'
import "@hashgraph/hardhat-hethers";
import 'hardhat-typechain'
import * as config from './config';

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.8.20',
  settings: {
    optimizer: {
      enabled: true,
      runs: 6_000,
    },
    // metadata: {
    //   bytecodeHash: 'none',
    // },
  },

}

export default {
  hedera: {
		networks: config.networks,
		gasLimit: 2_000_000
	},
  defaultNetwork: 'local', // testnet
  mocha: {
    timeout: 100000000
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
  },
  watcher: {
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },
}
