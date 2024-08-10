import EnvContainer from "../../EnvContainer"
import hardhat, { hethers } from 'hardhat'
import { HTS1400 } from '../../typechain'
import HTS1400JSON from '../../artifacts/contracts/HTS1400.sol/HTS1400.json'
import Web3 from 'web3'
import { approveToken } from "../../utils/hederaUtils"

async function main() {
    let env = new EnvContainer(hardhat.network.name)
    let web3 = new Web3()

    let HTS1400ContractId = env.HTS1400Contract
    if (!HTS1400ContractId) {
        throw new Error('HTS1400ContractId not set in EnvContainer.ts')
    }
    let HTS1400Token = env.HTS1400Token
    if (!HTS1400Token) {
        throw new Error('HTS1400Token not set in EnvContainer.ts')
    }

    let signersWithAddress = await (hethers as any).getSigners()
    let signer = signersWithAddress[1];

    let hts1400 = await hardhat.hethers.getContractAtFromArtifact(
        HTS1400JSON, 
        HTS1400ContractId.toSolidityAddress()
    ) as unknown as HTS1400

    let gasLimit = 250_000
    let partition = web3.utils.padLeft(1, 64)
    let to = env.bobPrivateKey.publicKey.toEthereumAddress();
    let amount = 1e7;
    let data = web3.utils.padLeft(0, 64)

    await approveToken(HTS1400Token, env.aliceId.toString(), HTS1400ContractId.toString(), amount, env.aliceClient)
    let tx = await hts1400.connect(signer).transferByPartition(
        partition,
        to,
        amount,
        data,
        {gasLimit: gasLimit}
    )
    let receipt = await tx.wait()

    console.log(receipt.transactionHash)
    process.exit()
}

main()