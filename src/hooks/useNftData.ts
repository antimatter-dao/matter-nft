import { useMemo } from 'react'
import { useContract } from 'hooks/useContract'
import ERC721_ABI from 'constants/abis/erc721.json'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useActiveWeb3React } from 'hooks'
import { NFT } from 'models/nft'

export function useNftData(contractAddress: string, tokenId: string): any | NFT {
  const { chainId } = useActiveWeb3React()
  const contract = useContract(contractAddress ?? undefined, ERC721_ABI)
  const tokenURIRes = useSingleCallResult(contract, 'tokenURI', [tokenId])
  const nameRes = useSingleCallResult(contract, 'name')

  return useMemo(
    () => ({
      loading: tokenURIRes.loading || nameRes.loading,
      nft: {
        chainId: chainId,
        contractAddress: contractAddress,
        tokenId: tokenId,
        tokenUri: tokenURIRes.result,
        name: nameRes.result
      },
      error: tokenURIRes.error || nameRes.error
    }),
    [
      chainId,
      contractAddress,
      nameRes.error,
      nameRes.loading,
      nameRes.result,
      tokenId,
      tokenURIRes.error,
      tokenURIRes.loading,
      tokenURIRes.result
    ]
  )
}
