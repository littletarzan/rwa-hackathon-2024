import EnvContainer from "../../EnvContainer"
import hardhat from 'hardhat'
import Web3 from 'web3'
import { HTS1400ContractFixture } from "../../test/shared/fixture"

async function main() {
    let env = new EnvContainer(hardhat.network.name, './.env')
    let web3 = new Web3()

    let hts1400 = await HTS1400ContractFixture(
        "MySecurityToken",
        "MST",
        "Testing only",
        8,
        env.ownerPrivateKey.publicKey.toEthereumAddress(),
        env.controllerPrivateKey.publicKey.toEthereumAddress(),
        web3.utils.padLeft(0, 64),
        20
    )
    console.log('contract address = ' + hts1400.address)
    console.log('token address = ' + await hts1400.token())
    process.exit()
}

main()