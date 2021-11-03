import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Web3 from 'web3'
import { useActiveWeb3React } from '../../hooks'
import { useAddPopup, useBlockNumber } from '../application/hooks'
import { AppDispatch, AppState } from '../index'
import {
  checkedTransaction,
  finalizeTransaction,
  finalizeLog,
  cleanUpOutdatedWithdraw,
  cleanUpOutdatedDeposit,
  deleteWithdrawHashToDeposit
} from './actions'
const web3 = new Web3()

export function shouldCheck(
  lastBlockNumber: number,
  tx: { addedTime: number; receipt?: Record<string, unknown>; lastCheckedBlockNumber?: number }
): boolean {
  if (tx.receipt) return false
  if (!tx.lastCheckedBlockNumber) return true
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) return false
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2
  } else {
    // otherwise every block
    return true
  }
}

export default function Updater(): null {
  const { chainId, library } = useActiveWeb3React()

  const lastBlockNumber = useBlockNumber()

  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['transactions']>(state => state.transactions)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const transactions = chainId ? state[chainId] ?? ({} as any) : ({} as any)

  // show popup on confirm
  const addPopup = useAddPopup()

  useEffect(() => {
    if (!chainId || !library || !lastBlockNumber) return

    Object.keys(transactions)
      .filter(hash => shouldCheck(lastBlockNumber, transactions[hash]))
      .forEach(hash => {
        library
          .getTransactionReceipt(hash)
          .then(receipt => {
            if (receipt) {
              if (transactions[hash].deposit) {
                if (receipt.status === 1) {
                  const parsed = web3.eth.abi.decodeLog(
                    [
                      {
                        name: 'from',
                        type: 'address'
                      },
                      {
                        name: 'nonce',
                        type: 'uint256'
                      },
                      {
                        name: 'tokenId',
                        type: 'uint256'
                      }
                    ],
                    receipt.logs[3].data,
                    receipt.logs[3].topics
                  )
                  dispatch(
                    finalizeLog({
                      chainId,
                      hash,
                      nonce: parsed.nonce,
                      from: parsed.from,
                      tokenId: parsed.tokenId
                    })
                  )
                } else {
                  setTimeout(() => {
                    dispatch(cleanUpOutdatedDeposit({ newestHash: '', chainId }))
                  }, 3000)
                }
              }
              if (transactions[hash].withdraw) {
                setTimeout(() => {
                  dispatch(cleanUpOutdatedWithdraw({ newestHash: '', chainId }))
                }, 3000)

                if (receipt.status === 1) {
                  setTimeout(() => {
                    dispatch(cleanUpOutdatedDeposit({ newestHash: '', chainId }))
                  }, 3000)
                } else {
                  dispatch(
                    deleteWithdrawHashToDeposit({
                      depositHash: transactions[hash].withdraw.depositHash,
                      fromChainId: transactions[hash].withdraw.fromChain
                    })
                  )
                }
              }
              dispatch(
                finalizeTransaction({
                  chainId,
                  hash,
                  receipt: {
                    blockHash: receipt.blockHash,
                    blockNumber: receipt.blockNumber,
                    contractAddress: receipt.contractAddress,
                    from: receipt.from,
                    status: receipt.status,
                    to: receipt.to,
                    transactionHash: receipt.transactionHash,
                    transactionIndex: receipt.transactionIndex
                  }
                })
              )

              addPopup(
                {
                  txn: {
                    hash,
                    success: receipt.status === 1,
                    summary: transactions[hash]?.summary
                  }
                },
                hash
              )
            } else {
              dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }))
            }
          })
          .catch(error => {
            console.error(`failed to check transaction hash: ${hash}`, error)
          })
      })
  }, [chainId, library, transactions, lastBlockNumber, dispatch, addPopup])

  return null
}
