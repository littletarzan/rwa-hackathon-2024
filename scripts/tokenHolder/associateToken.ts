import { TokenId, Client, AccountId } from "@hashgraph/sdk"
import EnvContainer from "../../EnvContainer"
import hardhat from 'hardhat'
import { associateToken } from "../../utils/hederaUtils"

async function main() {
    let env = new EnvContainer(hardhat.network.name, './.env')

    let tokens: TokenId[] = [TokenId.fromString('0.0.1028')]
    let accountId: AccountId = env.bobId
    let clientToUse: Client = env.bobClient

    let resp = await associateToken(tokens, accountId, clientToUse)
    console.log(resp.status)
    process.exit()
}

main()