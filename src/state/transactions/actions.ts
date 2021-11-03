import { createAction } from '@reduxjs/toolkit'
import { NFT } from 'models/nft'
import { ChainId } from '../../constants/chain'
import { TransactionDetails } from './reducer'

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
  withdraw?: { fromChain: number; toChain: number; depositHash: string }
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
  nonce?: number | string
  from?: string
  tokenId?: string
}>('transactions/finalizeLog')

export const cleanUpOutdatedDeposit = createAction<{
  newestHash: string
  chainId: ChainId
}>('transactions/cleanUpOutdatedDeposit')

export const cleanUpOutdatedWithdraw = createAction<{
  newestHash: string
  chainId: ChainId
}>('transactions/cleanUpOutdatedWithdraw')

export const addWithdrawHashToDeposit = createAction<{
  withdrawHash: string
  depositHash: string
  fromChainId: ChainId
}>('transactions/addWithdrawHashToDeposit')

export const deleteWithdrawHashToDeposit = createAction<{
  depositHash: string
  fromChainId: ChainId
}>('transactions/deleteWithdrawHashToDeposit')

export const importDeposit = createAction<{
  fromChainId: ChainId
  txn: TransactionDetails
}>('transactions/importDeposit')
