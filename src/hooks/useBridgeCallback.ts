import { useCallback, useMemo } from 'react'
import { useNFTBridgeContract } from './useContract'

export function useBridgeCallback(): {
  deposit: (...args: any[]) => Promise<any>
  withdraw: (...args: any[]) => Promise<any>
  getNonce: (...args: any[]) => Promise<any>
} {
  const contract = useNFTBridgeContract()

  const deposit = useCallback(
    (nftAddress: string, toChainId: number, toAddress: string, tokenId: string, options?: any): Promise<any> =>
      contract?.send(nftAddress, toChainId, toAddress, tokenId, options),
    [contract]
  )
  const withdraw = useCallback(
    (
      args: {
        fromChainId: string
        toAddress: string
        nonce: string
        name: string
        symbol: string
        mainChainId: string
        nftAddress: string
        tokenId: string
        tokenURI: string
        signatures: any[]
      },
      options?: any
    ): Promise<any> => {
      const {
        fromChainId,
        toAddress,
        nonce,
        name,
        symbol,
        mainChainId,
        nftAddress,
        tokenId,
        tokenURI,
        signatures
      } = args
      return contract?.recv(
        fromChainId,
        toAddress,
        nonce,
        name,
        symbol,
        mainChainId,
        nftAddress,
        tokenId,
        tokenURI,
        signatures,
        options
      )
    },
    [contract]
  )

  const getNonce = useCallback(
    (nftAddress: string, toChainId: string, toAddress: string): Promise<any> => {
      return contract?.nonces(nftAddress, toChainId, toAddress)
    },
    [contract]
  )
  return useMemo(() => ({ deposit, withdraw, getNonce }), [deposit, withdraw, getNonce])
}
