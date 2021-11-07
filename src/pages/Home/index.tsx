import { useState, useCallback, useEffect, useContext } from 'react'
import { Typography, Box } from '@material-ui/core'
import AppBody from 'components/AppBody'
import Button from 'components/Button/Button'
import ImportInventory from './ImportInventory'
import ImportManual from './ImportManual'
import { NFT } from 'models/nft'
import { useActiveWeb3React } from 'hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import { SwapContext } from 'context/SwapContext'
import { useHistory } from 'react-router'
import { routes } from 'constants/routes'

// export enum PAGE_STATE_TYPE {
//   DEFAULT,
//   BRIDGE
// }
let marker = 0

export default function Bridge() {
  const { account } = useActiveWeb3React()
  // const [pageState, setPageState] = useState<PAGE_STATE_TYPE | undefined>(PAGE_STATE_TYPE.DEFAULT)
  const { selectedToken, setSelectedToken, depositTxn } = useContext(SwapContext)
  const [showInventory, setShowInventory] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const history = useHistory()

  const toggleWalletModal = useWalletModalToggle()

  const handleImport = useCallback(
    (nft: NFT) => {
      setSelectedToken(nft)
    },
    [setSelectedToken]
  )

  const handleProceed = useCallback(() => {
    setShowManual(false)
    setShowInventory(false)
    history.push(routes.bridge)
  }, [history])

  const handleDismiss = useCallback(() => {
    setShowManual(false)
    setShowInventory(false)
    setSelectedToken(undefined)
  }, [setSelectedToken])

  const handleChangeToManual = useCallback(() => {
    setSelectedToken(undefined)
    setShowInventory(false)
    setShowManual(true)
  }, [setSelectedToken])

  useEffect(() => {
    if (depositTxn && depositTxn.deposit && !marker) {
      history.push(routes.bridge)
      marker = 1
    }
  }, [depositTxn, history, setSelectedToken])

  return (
    <>
      <AppBody>
        <Box display="grid" gridGap="29px" padding="20px 40px 52px">
          <Typography variant="h5">NFT Bridge</Typography>
          {/* <Button
            disabled={!account}
            onClick={() => {
              setSelectedToken(undefined)
              setShowInventory(true)
            }}
          >
            Select From Inventory
          </Button> */}
          <Button
            disabled={!account}
            onClick={() => {
              setSelectedToken(undefined)
              setShowManual(true)
            }}
          >
            Import Manually
          </Button>
          {!account && (
            <Button
              disabled={!!account}
              onClick={() => {
                toggleWalletModal()
              }}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </AppBody>

      {showInventory && (
        <ImportInventory
          isOpen={showInventory}
          selectedToken={selectedToken}
          onSelect={handleImport}
          onDismiss={handleDismiss}
          onProceed={handleProceed}
          onManual={handleChangeToManual}
        />
      )}
      {showManual && (
        <ImportManual isOpen={showManual} onImport={handleImport} onDismiss={handleDismiss} onProceed={handleProceed} />
      )}
    </>
  )
}
