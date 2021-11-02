import { useEffect, useMemo, useState } from 'react'
import { useContract, useNFTBridgeContract } from 'hooks/useContract'
import ERC721_ABI from 'constants/abis/erc721.json'
import { useActiveWeb3React } from 'hooks'
import JSBI from 'jsbi'
import { useSingleCallResult } from 'state/multicall/hooks'
import { getContract, isAddress } from 'utils'
import { useBlockNumber } from 'state/application/hooks'
import { getOtherNetworkLibrary } from 'connectors/MultiNetworkConnector'
import NFT_BRIDGE_ABI from 'constants/abis/nft_bridge.json'
import { NFT } from 'models/nft'
import { NFT_BRIDGE_ADDRESS } from '../constants'

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
        await nftContract.ownerOf(tokenId)
        setOwnerError(false)
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
        contractAddress: contractAddress,
        mainAddress: nftRes?.result?.[3],
        tokenUri: nftRes?.result?.[4],
        owner: ownerRes.result?.[0],
        chainId: chainId
      }
    }),
    [
      chainId,
      contractAddress,
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

export function useFeeSend(address: string | undefined): undefined | string {
  const nftContract = useNFTBridgeContract()
  const feeSendRes = useSingleCallResult(nftContract, 'feeSend', [address])
  return feeSendRes.result?.[0].toString()
}

export function useRecvSend(chainId: number | undefined, address: string | undefined): undefined | string {
  const nftContract = useNFTBridgeContract()
  const feeRecvRes = useSingleCallResult(nftContract, 'feeRecv', [chainId, address])
  return feeRecvRes.result?.[0].toString()
}

export function useNftBaseData(chainId: number, contractAddress: string, tokenId: string): NFT | undefined {
  const [nftData, setNftData] = useState<NFT | undefined>()

  useEffect(() => {
    const library = getOtherNetworkLibrary(chainId)
    if (!library || !tokenId || !contractAddress) return
    const bridgeContract = getContract(NFT_BRIDGE_ADDRESS, NFT_BRIDGE_ABI, library)
    bridgeContract
      .mappingNftInfo(contractAddress, tokenId)
      .then((res: any) => {
        const nft = {
          tokenId,
          name: res.name,
          symbol: res.symbol,
          mainChainId: Number(res.mainChainId.toString()),
          contractAddress: contractAddress,
          mainAddress: res[3],
          tokenUri: res.tokenURI,
          chainId: chainId
        }
        setNftData(nft)
      })
      .catch((e: any) => {
        setNftData(undefined)
        console.log('load error:', e)
      })
  }, [chainId, contractAddress, tokenId])
  return nftData
}
