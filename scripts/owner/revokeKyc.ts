import { ContractId } from "@hashgraph/sdk"
import EnvContainer from "../../EnvContainer"
import hardhat, { hethers } from 'hardhat'
import { HTS1400 } from '../../typechain'
import HTS1400JSON from '../../artifacts/contracts/HTS1400.sol/HTS1400.json'

async function main() {
    let env = new EnvContainer(hardhat.network.name, './.env')
    
    let HTS1400ContractId = env.HTS1400Contract
    if (!HTS1400ContractId) {
        throw new Error('HTS1400ContractId not set in EnvContainer.ts')
    }
    let signersWithAddress = await (hethers as any).getSigners()
    let ownerSigner = signersWithAddress[6]

    let hts1400 = await hardhat.hethers.getContractAtFromArtifact(
        HTS1400JSON, 
        HTS1400ContractId.toSolidityAddress()
    ) as unknown as HTS1400

    let gasLimit = 75_000
    let evm_addr = ""+env.alicePrivateKey.publicKey.toEthereumAddress()
    let tx = await hts1400.connect(ownerSigner).ownerRevokeTokenKyc(evm_addr, {gasLimit: gasLimit})
    let receipt = await tx.wait()

    console.log(receipt.transactionHash)
    process.exit()
}

main()