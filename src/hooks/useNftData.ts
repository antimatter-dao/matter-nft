import { useMemo, useCallback, useState } from 'react'
import { useNFTBridgeContract, useNFTContract } from 'hooks/useContract'
import ERC721_ABI from 'constants/abis/erc721.json'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useActiveWeb3React } from 'hooks'
import { NFT } from 'models/nft'
import { getContract } from 'utils'
import { NFT_BRIDGE_ADDRESS } from 'constants/index'
import JSBI from 'jsbi'

export function useNftDataCallback(): [any, (contractAddress: string, tokenId: string) => void] {
  const { library, account, chainId } = useActiveWeb3React()
  const [nft, setNft] = useState<NFT | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const bridgeContract = useNFTBridgeContract()

  const cb = useCallback(
    (contractAddress: string, tokenId: string) => {
      if (!library || !account) return setError(true)
      const nftContract = getContract(contractAddress, ERC721_ABI, library, account)
      if (!bridgeContract || !nftContract) return setError(true)
      setLoading(true)

      Promise.all([bridgeContract.mappingNftInfo(contractAddress, tokenId), nftContract.ownerOf(tokenId)])
        .then((r: any) => {
          setLoading(false)
          const [nftRes, owner] = r
          setNft({
            tokenId,
            name: nftRes[0],
            symbol: nftRes[1],
            mainChainId: +JSBI.BigInt(nftRes[2]).toString(),
            contractAddress: nftRes[3],
            tokenUri: nftRes[4],
            owner: owner,
            chainId: chainId
          })
        })
        .catch((e: any) => {
          setError(true)
          setLoading(false)
          console.error(e)
        })
    },
    [account, bridgeContract, chainId, library]
  )
  const response = useMemo(
    (): [any, (contractAddress: string, tokenId: string) => void] => [
      {
        loading,
        error,
        nft: nft
      },
      cb
    ],
    [cb, error, loading, nft]
  )
  return response
}

export function useNftData(
  contractAddress: string,
  tokenId: string
): { nft: NFT; loading: boolean; error: boolean; isOwner: boolean | undefined; deposited: boolean | undefined } {
  const { chainId, account } = useActiveWeb3React()
  const arg = useMemo(() => [tokenId], [tokenId])

  const contract = useNFTContract(contractAddress ?? undefined)
  const tokenURIRes = useSingleCallResult(contract, 'tokenURI', arg)
  const nameRes = useSingleCallResult(contract, 'name')
  const ownerRes = useSingleCallResult(contract, 'ownerOf', arg)

  const res = useMemo(() => {
    return {
      loading: tokenURIRes.loading || nameRes.loading || ownerRes.loading,
      isOwner: ownerRes.result?.[0] ? ownerRes.result?.[0] === account : undefined,
      deposited: ownerRes.result?.[0] ? ownerRes.result?.[0] === NFT_BRIDGE_ADDRESS : undefined,
      nft: {
        chainId: chainId,
        contractAddress: contractAddress,
        tokenId: tokenId,
        tokenUri: tokenURIRes.result?.[0],
        name: nameRes.result?.[0],
        owner: ownerRes.result?.[0]
      },
      error: tokenURIRes.error || nameRes.error || ownerRes.error
    }
  }, [
    account,
    chainId,
    contractAddress,
    nameRes.error,
    nameRes.loading,
    nameRes.result,
    ownerRes.error,
    ownerRes.loading,
    ownerRes.result,
    tokenId,
    tokenURIRes.error,
    tokenURIRes.loading,
    tokenURIRes.result
  ])
  return res
}

interface localToken {
  address: string
  tokenId: string
  chainId: string
}

export function useAllNftData() {
  const { library, account } = useActiveWeb3React()
  const localList = JSON.parse(localStorage.getItem('nftLIst') ?? '[]')
  const list: localToken[] = [...localList]
  if (!account || !library) return null
  const contractList = list.map(({ address }) => getContract(address, ERC721_ABI, library, account))
  const uriListRes = Promise.all(
    contractList.map((contract, idx) => {
      return contract ? contract.tokenURI(list[idx].tokenId) : undefined
    })
  )
  const nameListRes = Promise.all(
    contractList.map((contract, idx) => {
      return contract ? contract.tokenURI(list[idx].tokenId) : undefined
    })
  )
  return Promise.all([uriListRes, nameListRes])
    .then(r => console.debug(r))
    .catch(e => console.debug(e))
}
