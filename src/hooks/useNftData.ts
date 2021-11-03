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

export function useNftDataCallback(
  contractAddress: string,
  tokenId: string
): {
  loading: boolean
  error: string
  nft: NFT
} {
  const { chainId } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const [ownerError, setOwnerError] = useState(false)
  const [ownerRes, setOwnerRes] = useState()
  const [ownerResLoading, setOwnerResLoading] = useState(false)
  const [nftError, setNftError] = useState(false)
  const [nftRes, setNftRes] = useState()
  const [nftResLoading, setNftResLoading] = useState(false)
  // const arg = useMemo(() => [tokenId], [tokenId])
  // const args = useMemo(() => [contractAddress, tokenId], [contractAddress, tokenId])
  const bridgeContract = useNFTBridgeContract()
  const nftContract = useContract(isAddress(contractAddress) ? contractAddress : undefined, ERC721_ABI)
  // const ownerRes = useSingleCallResult(tokenId ? nftContract : null, 'ownerOf', arg)
  // const nftRes = useSingleCallResult(tokenId ? bridgeContract : null, 'mappingNftInfo', args)

  useEffect(() => {
    const ownerOf = async () => {
      try {
        if (!tokenId || !nftContract) return
        setOwnerResLoading(true)
        const _ownerRes = await nftContract.ownerOf(tokenId)
        setOwnerRes(_ownerRes)
        setOwnerResLoading(false)
        setOwnerError(false)
      } catch (e) {
        setOwnerRes(undefined)
        setOwnerResLoading(false)
        setOwnerError(true)
      }
    }
    ownerOf()
  }, [blockNumber, nftContract, ownerRes, tokenId])

  useEffect(() => {
    if (!bridgeContract || !contractAddress || !tokenId) return
    setNftResLoading(true)
    bridgeContract
      .mappingNftInfo(contractAddress, tokenId)
      .then((res: any) => {
        setNftResLoading(false)
        setNftRes(res)
        setNftError(false)
      })
      .catch((e: any) => {
        setNftRes(undefined)
        setNftError(true)
        setNftResLoading(false)
        console.log('load error:', e)
      })
  }, [bridgeContract, contractAddress, tokenId])

  const response = useMemo(
    () => ({
      loading: ownerResLoading || nftResLoading,
      error: (!ownerRes && !ownerResLoading) || nftError || ownerError ? 'Contract Error' : '',
      nft: {
        tokenId,
        name: nftRes?.[0],
        symbol: nftRes?.[1],
        mainChainId: nftRes?.[2] ? +JSBI.BigInt(nftRes?.[2]).toString() : undefined,
        contractAddress: contractAddress,
        mainAddress: nftRes?.[3] || '',
        tokenUri: nftRes?.[4],
        owner: ownerRes || '',
        chainId: chainId
      }
    }),
    [chainId, contractAddress, nftError, nftRes, nftResLoading, ownerError, ownerRes, ownerResLoading, tokenId]
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

export function useNftBaseData(chainId?: number, contractAddress?: string, tokenId?: string): NFT | undefined {
  const [nftData, setNftData] = useState<NFT | undefined>()

  useEffect(() => {
    if (!tokenId || !contractAddress || !chainId) return
    const library = getOtherNetworkLibrary(chainId)
    if (!library || !tokenId || !contractAddress) return
    const bridgeContract = getContract(NFT_BRIDGE_ADDRESS, NFT_BRIDGE_ABI, library)
    bridgeContract
      .mappingNftInfo(contractAddress, tokenId)
      .then((res: any) => {
        console.log('success')
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
        console.log('fail')
        setNftData(undefined)
        console.log('load error:', e)
      })
  }, [chainId, contractAddress, tokenId])
  return nftData
}
