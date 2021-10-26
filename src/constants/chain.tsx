import { Chain } from 'models/chain'
import { ReactComponent as ETH } from 'assets/svg/eth_logo.svg'
import EthUrl from 'assets/svg/eth_logo.svg'

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42
}

export const ChainList = [
  {
    icon: <ETH />,
    logo: EthUrl,
    symbol: 'Ropsten',
    name: 'Ropsten Test Network',
    id: ChainId.ROPSTEN,
    hex: '0x3'
  },
  {
    icon: <ETH />,
    logo: EthUrl,
    symbol: 'Rinkeby',
    name: 'Rinkeby Testnet',
    id: ChainId.RINKEBY,
    hex: '0x4'
  }
]

export const ChainListMap: {
  [key: number]: { icon: JSX.Element; link?: string; selectedIcon?: JSX.Element } & Chain
} = ChainList.reduce((acc, item) => {
  acc[item.id] = item
  return acc
}, {} as any)

// {
//   [ChainId.ROPSTEN]: {
//     icon: <ETH />,
//     logo: EthUrl,
//     symbol: 'Ropsten',
//     name: 'Ropsten Test Network',
//     id: ChainId.ROPSTEN,
//     hex: '0x3'
//   },
//   [ChainId.RINKEBY]: {
//     icon: <ETH />,
//     logo: EthUrl,
//     symbol: 'Rinkeby',
//     name: 'Rinkeby Testnet',
//     id: ChainId.RINKEBY,
//     hex: '0x4'
//   }
// }
