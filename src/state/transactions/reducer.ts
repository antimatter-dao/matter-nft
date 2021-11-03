import { createReducer } from '@reduxjs/toolkit'
import { NFT } from 'models/nft'
import {
  addTransaction,
  checkedTransaction,
  clearAllTransactions,
  finalizeTransaction,
  SerializableTransactionReceipt,
  finalizeLog,
  cleanUpOutdatedDeposit,
  cleanUpOutdatedWithdraw,
  addWithdrawHashToDeposit,
  deleteWithdrawHashToDeposit,
  importDeposit
} from './actions'

const now = () => new Date().getTime()

export interface TransactionDetails {
  hash: string
  approval?: { tokenAddress: string; spender: string }
  ERC721Approval?: { contractAddress: string; spender: string; tokenId: string }
  summary?: string
  claim?: { recipient: string }
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  deposit?: {
    fromChain: number
    toChain: number
    nft: NFT
    nonce?: number | string
    from?: string
    tokenId?: string
    withdrawHash?: string
  }
  withdraw?: { fromChain: number; toChain: number; depositHash: string }
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, builder =>
  builder
    .addCase(
      addTransaction,
      (
        transactions,
        { payload: { chainId, from, hash, approval, summary, claim, ERC721Approval, deposit, withdraw } }
      ) => {
        if (transactions[chainId]?.[hash]) {
          throw Error('Attempted to add existing transaction.')
        }
        const txs = transactions[chainId] ?? {}
        txs[hash] = { hash, approval, summary, claim, from, addedTime: now(), ERC721Approval, deposit, withdraw }
        transactions[chainId] = txs
      }
    )
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
    })
    .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
      }
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()
    })
    .addCase(finalizeLog, (transactions, { payload: { hash, chainId, nonce, from, tokenId } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx || !tx.deposit) {
        return
      }
      tx.deposit = { ...tx.deposit, nonce, from, tokenId }
      tx.confirmedTime = now()
    })
    .addCase(cleanUpOutdatedDeposit, (transactions, { payload: { newestHash } }) => {
      const keys = Object.keys(transactions)
      keys.map(key => {
        const tx = transactions[+key]
        if (!tx) return
        Object.keys(tx).map(hash => {
          if (hash === newestHash) return
          tx?.[hash]?.deposit && delete tx?.[hash].deposit
        })
      })
    })
    .addCase(cleanUpOutdatedWithdraw, (transactions, { payload: { newestHash } }) => {
      const keys = Object.keys(transactions)
      keys.map(key => {
        const tx = transactions[+key]
        if (!tx) return
        Object.keys(tx).map(hash => {
          if (hash === newestHash) return
          tx?.[hash]?.withdraw && delete tx?.[hash].withdraw
        })
      })
    })
    .addCase(addWithdrawHashToDeposit, (transactions, { payload: { withdrawHash, depositHash, fromChainId } }) => {
      const tx = fromChainId && transactions[fromChainId]
      if (!tx || !depositHash || !withdrawHash) return
      if (tx[depositHash]?.deposit && tx[depositHash].deposit !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tx[depositHash].deposit!.withdrawHash = withdrawHash
      }
    })
    .addCase(deleteWithdrawHashToDeposit, (transactions, { payload: { depositHash, fromChainId } }) => {
      const tx = fromChainId && transactions[fromChainId]
      if (!tx || !depositHash) return
      if (tx[depositHash]?.deposit && tx[depositHash].deposit !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tx[depositHash].deposit!.withdrawHash && delete tx[depositHash].deposit!.withdrawHash
      }
    })
    .addCase(importDeposit, (transactions, { payload: { txn, fromChainId } }) => {
      if (transactions[fromChainId]?.[txn.hash]) {
        // console.error('Attempted to add existing transaction.')
        transactions[fromChainId][txn.hash].deposit = txn.deposit
        return
      }
      const txs = transactions[fromChainId] ?? {}
      txs[txn.hash] = txn
      transactions[fromChainId] = txs
    })
)
