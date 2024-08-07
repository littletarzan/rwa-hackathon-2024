import EnvContainer from "../../EnvContainer"
import hardhat, { hethers } from 'hardhat'
import { HTS1400 } from '../../typechain'
import HTS1400JSON from '../../artifacts/contracts/HTS1400.sol/HTS1400.json'
import Web3 from 'web3'

async function main() {
    let env = new EnvContainer(hardhat.network.name, './.env')
    let web3 = new Web3()
    let HTS1400ContractId = env.HTS1400Contract
    if (!HTS1400ContractId) {
        throw new Error('HTS1400ContractId not set in EnvContainer.ts')
    }
    let signersWithAddress = await (hethers as any).getSigners()
    let signer = signersWithAddress[0]

    let hts1400 = await hardhat.hethers.getContractAtFromArtifact(
        HTS1400JSON, 
        HTS1400ContractId.toSolidityAddress()
    ) as unknown as HTS1400

    let gasLimit = 35_000
    let partition = web3.utils.padLeft(1, 64)
    let operator = env.operatorPrivateKey.publicKey.toEthereumAddress()
    let tokenHolder = env.alicePrivateKey.publicKey.toEthereumAddress()
    let resp = await hts1400.connect(signer).isOperatorForPartition(partition, operator, tokenHolder, {gasLimit: gasLimit})
    
    console.log("balance by partition = " + resp)
    process.exit()
}

main()