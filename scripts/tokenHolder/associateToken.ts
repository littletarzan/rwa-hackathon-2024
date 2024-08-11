import { TokenId, Client, AccountId } from "@hashgraph/sdk"
import EnvContainer from "../../EnvContainer"
import hardhat from 'hardhat'
import { associateToken } from "../../utils/hederaUtils"

async function main() {
    let env = new EnvContainer(hardhat.network.name)

    let HTS1400Token = env.HTS1400Token
    if (!HTS1400Token) {
        throw new Error('HTS1400Token not set in EnvContainer.ts')
    }

    let tokens: TokenId[] = [HTS1400Token]
    let accountId: AccountId = env.aliceId
    let clientToUse: Client = env.aliceClient

    let resp = await associateToken(tokens, accountId, clientToUse)
    console.log(resp.status)
    process.exit()
}

main()