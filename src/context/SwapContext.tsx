import { ActivityItemProp } from 'hooks/useAccount'
import { useImportDepositCallback } from 'hooks/useImportDeposit'
import { NFT } from 'models/nft'
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { cleanUpOutdatedDeposit } from 'state/transactions/actions'
import { useDepositTxn, useTransactionFromOneChain } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/reducer'

interface SwapContextType {
  selectedToken: NFT | undefined
  setSelectedToken: (nft: NFT | undefined) => void
  depositTxn: TransactionDetails | undefined
  withdrawTxn: TransactionDetails | undefined
  importDeposit: (item: ActivityItemProp) => void
}

export const SwapContext = React.createContext<SwapContextType>({
  selectedToken: undefined,
  setSelectedToken: () => {},
  depositTxn: undefined,
  withdrawTxn: undefined,
  importDeposit: () => {}
})

export const SwapProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedToken, setSelectedToken] = useState<NFT | undefined>(undefined)
  const depositTxn = useDepositTxn()
  const dispatch = useDispatch()
  const withdrawTxn = useTransactionFromOneChain(depositTxn?.deposit?.toChain, depositTxn?.deposit?.withdrawHash ?? '')
  const { importDeposit } = useImportDepositCallback()

  const handleSelectedToken = useCallback(
    token => {
      setSelectedToken(token)
      dispatch(cleanUpOutdatedDeposit({ newestHash: '', chainId: 1 }))
    },
    [dispatch]
  )

  useEffect(() => {
    if (depositTxn && depositTxn.deposit) {
      setSelectedToken(depositTxn.deposit.nft)
    }
  }, [depositTxn, setSelectedToken])

  const val = useMemo(
    () => ({
      selectedToken,
      setSelectedToken: handleSelectedToken,
      depositTxn,
      withdrawTxn,
      importDeposit
    }),
    [depositTxn, handleSelectedToken, importDeposit, selectedToken, withdrawTxn]
  )

  return <SwapContext.Provider value={val}>{children}</SwapContext.Provider>
}
