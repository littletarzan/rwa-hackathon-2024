import hardhat from 'hardhat'
import { HTS1400 } from '../../typechain'
import { BytesLike } from '@hashgraph/hethers'

export async function HTS1400ContractFixture(
  _tokenName: string,
  _tokenSymbol: string,
  _tokenMemo: string,
  _decimals: number,
  _initOwner: string,
  _controller: string,
  _defaultPartition: BytesLike,
  _hbarPayable: number,
  _gasLimit: number = 1_000_000
): Promise<HTS1400> {
  
  let contractFactory = await hardhat.hethers.getContractFactory('HTS1400')
  const contract = (await contractFactory.deploy(
    _tokenName,
    _tokenSymbol,
    _tokenMemo,
    _decimals,
    _initOwner,
    _controller,
    _defaultPartition,
  {value: _hbarPayable}, {gasLimit: _gasLimit})) as unknown as HTS1400

  return contract
}
