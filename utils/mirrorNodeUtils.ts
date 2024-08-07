import axios from 'axios';
import hardhat from 'hardhat'

function getMirrorNodeURL(environment: String) {
    switch (environment) {
        case 'mainnet':
            return 'https://mainnet-public.mirrornode.hedera.com/';
        case 'previewnet':
            return 'https://previewnet.mirrornode.hedera.com/';
        case 'local':
            return 'http://localhost:5551/'
        case 'testnet':
        default:
            return 'https://testnet.mirrornode.hedera.com/'
    }
}

export function getMirrorNodeIPAddress(environment: string) {
    switch (environment) {
        case 'mainnet':
            return '';
        case 'previewnet':
            return '';
        case 'local':
            return ''
        case 'testnet':
        default:
            return 'hcs.testnet.mirrornode.hedera.com:5600'
    }
}

export async function getTokenInfo(tokenId: string, network: string = hardhat.network.name) {
    let url = getMirrorNodeURL(network)
    let endpoint = `${url}api/v1/tokens/${tokenId}`;

    let data;

    try {
        data = await axios.get(endpoint)
    } catch (error) {
        console.log('error fetching token info')
        return null;
    }
    if(!data || !data.data ) {
        return null;
    }
    return data.data;
}

export async function getHbarBalanceForId(accountId: string, network: string = hardhat.network.name) {
    let url = getMirrorNodeURL(network)
    let endpoint = `${url}api/v1/balances/?account.id=${accountId}`
    let data = await axios.get(endpoint)
      if(!data || !data.data) {
        return -1
    }
    return data.data.balances[0].balance
}

export async function getTokensForId(id: string, tokenId: string, network: string = hardhat.network.name) {
    let url = getMirrorNodeURL(network)
    let endpoint = `${url}api/v1/accounts/${id}/tokens?token.id=${tokenId}`
    let data = await axios.get(endpoint)
      if(!data || !data.data) {
        return -1
    }

    return data.data
}