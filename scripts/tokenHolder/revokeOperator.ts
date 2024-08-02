import { ContractId } from "@hashgraph/sdk"
import EnvContainer from "../../EnvContainer"
import hardhat, { hethers } from 'hardhat'
import { HTS1400 } from '../../typechain'
import HTS1400JSON from '../../artifacts/contracts/HTS1400.sol/HTS1400.json'

async function main() {
    let env = new EnvContainer(hardhat.network.name, './.env')

    let HTS1400ContractId: ContractId = ContractId.fromString('')
    let signersWithAddress = await (hethers as any).getSigners()
    let mySigner = signersWithAddress[0];

    let hts1400 = await hardhat.hethers.getContractAtFromArtifact(
        HTS1400JSON, 
        HTS1400ContractId.toSolidityAddress()
    ) as unknown as HTS1400

    let gasLimit = 30_000
    let operator = env.aliceId.toSolidityAddress()
    let tx = await hts1400.connect(mySigner).revokeOperator(operator, {gasLimit: gasLimit})
    let receipt = await tx.wait()

    console.log(receipt.transactionHash)
    process.exit()
}

main()