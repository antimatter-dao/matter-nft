import { createAction } from '@reduxjs/toolkit'
import { NFT } from 'models/nft'
import { ChainId } from '../../constants/chain'

export interface SerializableTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
}

export const addTransaction = createAction<{
  chainId: ChainId
  hash: string
  from: string
  approval?: { tokenAddress: string; spender: string }
  ERC721Approval?: { contractAddress: string; spender: string; tokenId: string }
  claim?: { recipient: string }
  summary?: string
  deposit?: { fromChain: number; toChain: number; nft: NFT }
}>('transactions/addTransaction')
export const clearAllTransactions = createAction<{ chainId: ChainId }>('transactions/clearAllTransactions')
export const finalizeTransaction = createAction<{
  chainId: ChainId
  hash: string
  receipt: SerializableTransactionReceipt
}>('transactions/finalizeTransaction')
export const checkedTransaction = createAction<{
  chainId: ChainId
  hash: string
  blockNumber: number
}>('transactions/checkedTransaction')

export const finalizeLog = createAction<{
  chainId: ChainId
  hash: string
  log: any
  parsedLog: any
}>('transactions/finalizeLog')
