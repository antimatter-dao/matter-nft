import { useState, useCallback } from 'react'
import { Typography, Box } from '@material-ui/core'
import AppBody from 'components/AppBody'
import Button from 'components/Button/Button'
import BridgeForm from './BridgeForm'
import ImportInventory from './ImportInventory'
import ImportManual from './ImportManual'
import { NFT } from 'models/nft'
import { useActiveWeb3React } from 'hooks'
import { useWalletModalToggle } from 'state/application/hooks'

export enum PAGE_STATE_TYPE {
  DEFAULT,
  BRIDGE
}

export default function Bridge() {
  const { account } = useActiveWeb3React()
  const [pageState, setPageState] = useState<PAGE_STATE_TYPE | undefined>(PAGE_STATE_TYPE.DEFAULT)
  const [selectedToken, setSelectedToken] = useState<(NFT & { deposited?: boolean | undefined }) | undefined>(undefined)
  const [showInventory, setShowInventory] = useState(false)
  const [showManual, setShowManual] = useState(false)

  const toggleWalletModal = useWalletModalToggle()

  const handleImport = useCallback((nft: NFT) => {
    setSelectedToken(nft)
  }, [])
  const handleProceed = useCallback(() => {
    setShowManual(false)
    setShowInventory(false)
    setPageState(PAGE_STATE_TYPE.BRIDGE)
  }, [])
  const handleDismiss = useCallback(() => {
    setShowManual(false)
    setShowInventory(false)
    setPageState(PAGE_STATE_TYPE.DEFAULT)
    setSelectedToken(undefined)
  }, [])

  const handleChangeToManual = useCallback(() => {
    setSelectedToken(undefined)
    setPageState(PAGE_STATE_TYPE.DEFAULT)
    setShowInventory(false)
    setShowManual(true)
  }, [])

  return (
    <>
      {pageState === PAGE_STATE_TYPE.DEFAULT && (
        <AppBody>
          <Box display="grid" gridGap="29px" padding="20px 40px 52px">
            <Typography variant="h5">NFT Bridge</Typography>
            <Button
              disabled={!account}
              onClick={() => {
                setSelectedToken(undefined)
                setShowInventory(true)
              }}
            >
              Select From Inventory
            </Button>
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
      )}
      {pageState === PAGE_STATE_TYPE.BRIDGE && <BridgeForm token={selectedToken} onReturnClick={handleDismiss} />}
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
