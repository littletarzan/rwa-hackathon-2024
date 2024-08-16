import {
    TokenId,
    AccountId,
    TokenAssociateTransaction,
    Client,
    TransferTransaction,
    AccountAllowanceApproveTransaction,
    TokenDissociateTransaction
} from "@hashgraph/sdk";
import BigNumber, { BigNumber as BigNumberJs } from 'bignumber.js'
import Long from "long";

    export async function approveToken(token: TokenId, owner: string, spender: string, amount: number|BigNumber, clientToUse: Client) {
        const approve = await new AccountAllowanceApproveTransaction()
            .approveTokenAllowance(token, owner, spender, Long.fromString(amount.toString()))
            .execute(clientToUse);

        return await approve.getReceipt(clientToUse);
    }

    export async function associateToken(tokens: TokenId[], accountId: AccountId, clientToUse: Client) {
        const associate = await new TokenAssociateTransaction()
            .setTokenIds(tokens)
            .setAccountId(accountId)
            .execute(clientToUse);

        return await associate.getReceipt(clientToUse);
    }

    export async function dissociateToken(tokens: TokenId[], accountId: AccountId, clientToUse: Client) {
        const associate = await new TokenDissociateTransaction()
            .setTokenIds(tokens)
            .setAccountId(accountId)
            .execute(clientToUse);

        return await associate.getReceipt(clientToUse);
    }

    export async function transferToken(tokenId: TokenId, from: AccountId, to: AccountId, amount: number, clientToUse: Client) {
        const tokenTransfer = new TransferTransaction()
            .addTokenTransfer(tokenId, from, -amount)
            .addTokenTransfer(tokenId, to, amount)
            .freezeWith(clientToUse)

        const tokenTransferSubmit = await tokenTransfer.execute(clientToUse);
        const receipt = tokenTransferSubmit.getReceipt(clientToUse);
        return receipt;
    }
    
    export async function sleep(ms: number): Promise<void> {
        return new Promise(
            (resolve) => setTimeout(resolve, ms));
    }
