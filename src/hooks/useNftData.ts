import { useEffect, useMemo, useState } from 'react'
import { useContract, useNFTBridgeContract } from 'hooks/useContract'
import ERC721_ABI from 'constants/abis/erc721.json'
import { useActiveWeb3React } from 'hooks'
import JSBI from 'jsbi'
import { useSingleCallResult } from 'state/multicall/hooks'
import { isAddress } from 'utils'
import { useBlockNumber } from 'state/application/hooks'

export function useNftDataCallback(contractAddress: string, tokenId: string) {
  const { chainId } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const [ownerError, setOwnerError] = useState(false)
  const arg = useMemo(() => [tokenId], [tokenId])
  const args = useMemo(() => [contractAddress, tokenId], [contractAddress, tokenId])
  const bridgeContract = useNFTBridgeContract()
  const nftContract = useContract(isAddress(contractAddress) ? contractAddress : undefined, ERC721_ABI)
  const ownerRes = useSingleCallResult(tokenId ? nftContract : null, 'ownerOf', arg)
  const nftRes = useSingleCallResult(tokenId ? bridgeContract : null, 'mappingNftInfo', args)

  useEffect(() => {
    const ownerOf = async () => {
      try {
        if (!tokenId || !nftContract) return
        const ownerResponse = await nftContract.ownerOf(tokenId)
        console.log(ownerResponse)
      } catch (e) {
        setOwnerError(true)
      }
    }
    ownerOf()
  }, [blockNumber, nftContract, tokenId])

  const response = useMemo(
    () => ({
      loading: ownerRes.loading || nftRes.loading,
      error: ownerRes.error || nftRes.error || ownerError ? 'Contract Error' : '',
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
    [
      chainId,
      nftRes.error,
      nftRes.loading,
      nftRes?.result,
      ownerError,
      ownerRes.error,
      ownerRes.loading,
      ownerRes.result,
      tokenId
    ]
  )

  return response
}
