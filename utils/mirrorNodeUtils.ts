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

export async function getTokenBalanceWithParams(tokenId: string, accountId: string, timestamp: string, network: string = hardhat.network.name) {
    let url = getMirrorNodeURL(network)
    let endpoint = `${url}api/v1/tokens/${tokenId}/balances?`;

    // append the endpoint with params
    // https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.731861/balances?account.id=0.0.1077627&timestamp=eq%3A1710547837

    endpoint += 'account.id=' + accountId + '&'
    endpoint += 'timestamp=eq%3A' + timestamp

    let data;
    try {
        data = await axios.get(endpoint)
    } catch (error) {
        console.log('GTBWP: error fetching token info: ' +  endpoint)
        console.log('error = ' + error)
        return null;
    }
    if(!data || !data.data ) {
        return null;
    }
    return data.data;
}

export async function getDataFromArbitraryString(link: string, network: string = hardhat.network.name) {
    let url = getMirrorNodeURL(network)
    let endpoint = `${url.slice(0, -1)}${link}`;

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

export async function getTokenDecimals(tokenId: string, network: string = hardhat.network.name) {
    return (await getTokenInfo(tokenId, network)).decimals;
}

export async function getAssociatedAccounts(startId: string|undefined, tokenId: string, network: string = hardhat.network.name) {
    let result: any[] = []
    let url = getMirrorNodeURL(network)
    let endpoint;

    // if no start id is specified, just get all of the associated ids
    if(!startId || startId == undefined || startId == '') {
        endpoint = `${url}api/v1/tokens/${tokenId}/balances?limit=100&order=desc`;
    } else {
        endpoint = `${url}api/v1/tokens/${tokenId}/balances?limit=100&order=desc&account.id=gt:${startId}`;
    }
    
    let bal = await axios.get(endpoint);
    result = result.concat(bal.data.balances)

    while(bal.data.links['next']) {
        bal = await axios.get(`${url.slice(0, -1)}${bal.data.links['next']}`)
        result = result.concat(bal.data.balances)
    }
    return result.reduce((acc, curr) => { return acc.concat(curr.account) }, [])
}

export async function getAssociatedAccount(id: string, tokenId: string, network: string = hardhat.network.name) {
    let result: any[] = []
    let url = getMirrorNodeURL(network)
    let endpoint =`${url}api/v1/tokens/${tokenId}/balances?account.id=${id}`;
    
    try {
        let bal = await axios.get(endpoint);
        result = result.concat(bal.data.balances)
        return (bal.data.balances.length == 1)
    } catch (error) {
        console.log(error)
    }

    return false
}

export async function getTokenBalanceForId(id: string, tokenId: string, network: string = hardhat.network.name) {
    let url = getMirrorNodeURL(network)
    let endpoint = `${url}api/v1/accounts/${id}/tokens?token.id=${tokenId}`
    // console.log(endpoint)
    let data = await axios.get(endpoint)
      if(!data || !data.data || data.data.tokens.length == 0) {
        return -1
    }
    return data.data.tokens[0].balance
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

export async function getHbarExchangeRateInUsd(network: string = hardhat.network.name) {
    let url = getMirrorNodeURL(network)
    let endpoint = `${url}api/v1/network/exchangerate`
    let data = await axios.get(endpoint)
      if(!data || !data.data) {
        return -1
    }

    // price of hbar in USD is (cent_equivalent/hbar_equivalent) / 100
    return (data.data.current_rate.cent_equivalent / data.data.current_rate.hbar_equivalent) / 100
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