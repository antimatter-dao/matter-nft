import { Web3Provider } from '@ethersproject/providers'
import { ChainId, SUPPORTED_NETWORKS } from 'constants/chain'

export function triggerSwitchChain(library: Web3Provider | undefined, chainId: ChainId, account: string) {
  if (chainId === ChainId.MAINNET) {
    library?.send('wallet_switchEthereumChain', [{ chainId: '0x1' }, account])
  } else if (chainId === ChainId.ROPSTEN) {
    library?.send('wallet_switchEthereumChain', [{ chainId: '0x3' }, account])
  } else if (chainId === ChainId.RINKEBY) {
    library?.send('wallet_switchEthereumChain', [{ chainId: '0x4' }, account])
  } else {
    const params = SUPPORTED_NETWORKS[chainId as ChainId]
    library?.send('wallet_addEthereumChain', [params, account])
  }
}
