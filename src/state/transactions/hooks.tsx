import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { ChainId } from 'constants/chain'
import { NFT } from 'models/nft'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'
import { AppDispatch, AppState } from '../index'
import { addTransaction, cleanUpOutdatedDeposit, addWithdrawHashToDeposit, cleanUpOutdatedWithdraw } from './actions'
import { TransactionDetails } from './reducer'

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: TransactionResponse,
  customData?: {
    summary?: string
    approval?: { tokenAddress: string; spender: string }
    claim?: { recipient: string }
    ERC721Approval?: { contractAddress: string; spender: string; tokenId: string }
    deposit?: { fromChain: number; toChain: number; nft: NFT }
    withdraw?: { fromChain: number; toChain: number; depositHash: string }
  }
) => void {
  const { chainId, account } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (
      response: TransactionResponse,
      {
        summary,
        approval,
        claim,
        ERC721Approval,
        deposit,
        withdraw
      }: {
        summary?: string
        claim?: { recipient: string }
        approval?: { tokenAddress: string; spender: string }
        ERC721Approval?: { contractAddress: string; spender: string; tokenId: string }
        deposit?: { fromChain: number; toChain: number; nft: NFT }
        withdraw?: { fromChain: number; toChain: number; depositHash: string }
      } = {}
    ) => {
      if (!account) return
      if (!chainId) return

      const { hash } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(
        addTransaction({ hash, from: account, chainId, approval, summary, claim, ERC721Approval, deposit, withdraw })
      )
      if (deposit) {
        dispatch(cleanUpOutdatedDeposit({ newestHash: hash, chainId }))
        dispatch(cleanUpOutdatedWithdraw({ newestHash: '', chainId }))
      }
      if (withdraw) {
        dispatch(cleanUpOutdatedWithdraw({ newestHash: hash, chainId }))
        dispatch(
          addWithdrawHashToDeposit({
            withdrawHash: hash,
            depositHash: withdraw.depositHash,
            fromChainId: withdraw.fromChain
          })
        )
      }
    },
    [dispatch, chainId, account]
  )
}

// returns all the transactions for the current chain
export function useAllTransactions(chain?: number): { [txHash: string]: TransactionDetails } {
  const { chainId } = useActiveWeb3React()

  const state = useSelector<AppState, AppState['transactions']>(state => state.transactions)

  return chain ? state[chain] : chainId ? state[chainId] ?? {} : {}
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return !transactions[transactionHash].receipt
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some(hash => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.approval
          if (!approval) return false
          return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx)
        }
      }),
    [allTransactions, spender, tokenAddress]
  )
}

export function useERC721HasPendingApproval(
  contractAddress: string | undefined,
  spender: string | undefined,
  tokenId: string
): boolean {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof contractAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some(hash => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.ERC721Approval
          if (!approval) return false
          return (
            approval.spender === spender &&
            approval.contractAddress === contractAddress &&
            tokenId === approval.tokenId &&
            isTransactionRecent(tx)
          )
        }
      }),
    [contractAddress, spender, allTransactions, tokenId]
  )
}

// watch for submissions to claim
// return null if not done loading, return undefined if not found
export function useUserHasSubmittedClaim(
  account?: string
): { claimSubmitted: boolean; claimTxn: TransactionDetails | undefined } {
  const allTransactions = useAllTransactions()

  // get the txn if it has been submitted
  const claimTxn = useMemo(() => {
    const txnIndex = Object.keys(allTransactions).find(hash => {
      const tx = allTransactions[hash]
      return tx.claim && tx.claim.recipient === account
    })
    return txnIndex && allTransactions[txnIndex] ? allTransactions[txnIndex] : undefined
  }, [account, allTransactions])

  return { claimSubmitted: Boolean(claimTxn), claimTxn }
}

export function useTransaction(transactionHash?: string): TransactionDetails | undefined {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return undefined

  return transactions[transactionHash]
}

export function useTransactionFromOneChain(
  chainId: ChainId | undefined,
  transactionHash: string
): TransactionDetails | undefined {
  const state = useSelector<AppState, AppState['transactions']>(state => state.transactions)
  if (!chainId || !transactionHash) return undefined
  const transactions = state[chainId]
  if (!transactions || !transactionHash || !transactions[transactionHash]) return undefined
  return transactions[transactionHash]
}

export function useAllDepositTxn(): { [chainId: number]: { [key: string]: any } } {
  const state = useSelector<AppState, AppState['transactions']>(state => state.transactions)

  return useMemo(
    () =>
      Object.keys(state).reduce((acc, chain) => {
        const allTransactions = state[+chain as keyof typeof state]
        const list: { [key: string]: TransactionDetails } = {}
        Object.keys(allTransactions).map(hash => {
          const tx = allTransactions[hash]
          if (!tx) return false
          if (!!tx.deposit) {
            list[hash] = allTransactions[hash]
          }
          return !!tx.deposit
        })
        acc[+chain] = list
        return acc
      }, {} as any),
    [state]
  )
}

export function useDepositTxn(): TransactionDetails | undefined {
  const allDepositTxn = useAllDepositTxn()
  const depositTxn = useMemo(() => {
    let hash: string | undefined = ''
    let chainId: number | undefined = undefined
    Object.keys(allDepositTxn).map(key => {
      const txn = allDepositTxn[+key]
      if (!txn) return undefined
      if (!txn) return undefined
      const hashRes: string | undefined = Object.keys(txn).find((hashStr: any) => {
        const deposit = txn[hashStr as keyof typeof txn]

        return deposit && deposit.deposit && (deposit?.receipt?.status === 1 || !deposit?.receipt)
      })
      if (hashRes) {
        hash = hashRes
        chainId = +key
      }
      return
    })

    return hash && chainId ? allDepositTxn?.[chainId]?.[hash] : undefined
  }, [allDepositTxn])
  return depositTxn
}
