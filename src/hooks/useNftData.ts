import { useMemo } from 'react'
import { useContract, useNFTBridgeContract } from 'hooks/useContract'
import ERC721_ABI from 'constants/abis/erc721.json'
import { useActiveWeb3React } from 'hooks'
import JSBI from 'jsbi'
import { useSingleCallResult } from 'state/multicall/hooks'
import { isAddress } from 'utils'

export function useNftDataCallback(contractAddress: string, tokenId: string) {
  const { chainId } = useActiveWeb3React()
  const arg = useMemo(() => [tokenId /*, { gasLimit: 3500000 }*/], [tokenId])
  const args = useMemo(() => [contractAddress, tokenId /*, { gasLimit: 3500000 }*/], [contractAddress, tokenId])
  const bridgeContract = useNFTBridgeContract()
  const nftContract = useContract(isAddress(contractAddress) ? contractAddress : undefined, ERC721_ABI)
  const ownerRes = useSingleCallResult(tokenId ? nftContract : null, 'ownerOf', arg)
  const nftRes = useSingleCallResult(tokenId ? bridgeContract : null, 'mappingNftInfo', args)

  const response = useMemo(
    () => ({
      loading: ownerRes.loading || nftRes.loading,
      error: ownerRes.error || nftRes.error ? 'Contract Error' : '',
      nft: {
        tokenId,
        name: nftRes?.result?.[0],
        symbol: nftRes?.result?.[1],
        mainChainId: nftRes?.result?.[2] ? +JSBI.BigInt(nftRes?.result?.[2]).toString() : undefined,
        contractAddress: nftRes?.result?.[3],
        tokenUri: nftRes?.result?.[4],
        owner: ownerRes.result?.[0],
        chainId: chainId
      }
    }),
    [chainId, nftRes.error, nftRes.loading, nftRes?.result, ownerRes.error, ownerRes.loading, ownerRes.result, tokenId]
  )

  return response
}
