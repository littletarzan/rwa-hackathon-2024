import { ContractId } from "@hashgraph/sdk"
import EnvContainer from "../../EnvContainer"
import hardhat, { hethers } from 'hardhat'
import { HTS1400 } from '../../typechain'
import HTS1400JSON from '../../artifacts/contracts/HTS1400.sol/HTS1400.json'
import Web3 from 'web3'

async function main() {
    let env = new EnvContainer(hardhat.network.name)
    let web3 = new Web3()
    let HTS1400ContractId = env.HTS1400Contract
    if (!HTS1400ContractId) {
        throw new Error('HTS1400ContractId not set in EnvContainer.ts')
    }
    let signersWithAddress = await (hethers as any).getSigners()
    let signer = signersWithAddress[1]

    let hts1400 = await hardhat.hethers.getContractAtFromArtifact(
        HTS1400JSON, 
        HTS1400ContractId.toSolidityAddress()
    ) as unknown as HTS1400

    let gasLimit = 75_000
    let tokenHolder = env.alicePrivateKey.publicKey.toEthereumAddress()
    let partition = web3.utils.padLeft(0, 64)
    let bytes = await hts1400.connect(signer).canTransfer(
        tokenHolder,
        1,
        partition,
        {gasLimit: gasLimit}
      )
    
    console.log("can transfer = " + bytes[0])
    console.log("reason = " + bytes[1])
    process.exit()
}

main()