import { TransactionDetails } from 'state/transactions/reducer'
import { useDispatch } from 'react-redux'
import { useNftBaseData } from 'hooks/useNftData'
import { ActivityItemProp } from 'hooks/useAccount'
import { cleanUpOutdatedDeposit, importDeposit } from 'state/transactions/actions'
import { useState, useMemo, useCallback, useEffect, useContext } from 'react'
import { SwapContext } from 'context/SwapContext'

const now = () => new Date().getTime()

export function useImportDepositCallback() {
  const [item, setItem] = useState<ActivityItemProp | undefined>(undefined)
  const { setSelectedToken } = useContext(SwapContext)
  const dispatch = useDispatch()
  const nft = useNftBaseData(item?.fromChainId, item?.contract, item?.tokenId ? item.tokenId + '' : undefined)

  const importDepositCallback = useCallback((item: ActivityItemProp) => {
    setItem(item)
  }, [])

  useEffect(() => {
    if (!item || !nft || !item.hash) return
    setSelectedToken(nft)
    const txn: TransactionDetails = {
      hash: item.hash,
      addedTime: now(),
      confirmedTime: now(),
      from: item.fromAddress,
      receipt: {
        to: item.toAddress,
        from: item.fromAddress,
        status: 1,
        contractAddress: '',
        transactionIndex: 16,
        blockHash: '',
        transactionHash: '',
        blockNumber: 11353167
      },
      deposit: {
        nft,
        fromChain: item.fromChainId,
        toChain: item.toChainId,
        nonce: item.nonce,
        tokenId: item.tokenId ? item.tokenId + '' : '',
        from: item.fromAddress
      }
    }
    dispatch(cleanUpOutdatedDeposit({ newestHash: txn.hash, chainId: item.fromChainId }))
    dispatch(importDeposit({ fromChainId: item.fromChainId, txn }))
  }, [dispatch, item, nft, setSelectedToken])

  return useMemo(
    () => ({
      importDeposit: importDepositCallback
    }),
    [importDepositCallback]
  )
}
