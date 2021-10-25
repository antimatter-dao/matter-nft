import { useState } from 'react'
import { Typography, Box } from '@material-ui/core'
import AppBody from 'components/AppBody'
import Button from 'components/Button/Button'
import BridgeForm from './BridgeForm'
import ImportInventory from './ImportInventory'
import ImportManual from './ImportManual'
import { NFT } from 'models/nft'

export enum PAGE_STATE_TYPE {
  DEFAULT,
  BRIDGE
}

export default function Bridge() {
  const [pageState, setPageState] = useState<PAGE_STATE_TYPE | undefined>(PAGE_STATE_TYPE.DEFAULT)
  const [selectedToken, setSelectedToken] = useState<NFT | undefined>(undefined)
  const [showInventory, setShowInventory] = useState(false)
  const [showManual, setShowManual] = useState(false)

  return (
    <>
      {pageState === PAGE_STATE_TYPE.DEFAULT && (
        <AppBody>
          <Box display="grid" gridGap="29px" padding="20px 40px 52px">
            <Typography variant="h5">NFT Bridge</Typography>
            <Button
              onClick={() => {
                setShowInventory(true)
              }}
            >
              Select From Inventory
            </Button>
            <Button
              onClick={() => {
                setShowManual(true)
              }}
            >
              Import Manually
            </Button>
          </Box>
        </AppBody>
      )}
      {pageState === PAGE_STATE_TYPE.BRIDGE && <BridgeForm token={selectedToken} />}
      <ImportInventory
        isOpen={showInventory}
        selectedToken={selectedToken}
        onSelect={(nft: NFT) => {
          setSelectedToken(nft)
        }}
        onDismiss={() => {
          setShowInventory(false)
          selectedToken ? setPageState(PAGE_STATE_TYPE.BRIDGE) : setPageState(PAGE_STATE_TYPE.DEFAULT)
        }}
        onManual={() => {
          setSelectedToken(undefined)
          setPageState(PAGE_STATE_TYPE.DEFAULT)
          setShowInventory(false)
          setShowManual(true)
        }}
      />
      <ImportManual
        isOpen={showManual}
        onImport={(nft: NFT) => {
          setSelectedToken(nft)
          nft ? setPageState(PAGE_STATE_TYPE.BRIDGE) : setPageState(PAGE_STATE_TYPE.DEFAULT)
          setShowManual(false)
        }}
        onDismiss={() => {
          setShowManual(false)
          selectedToken ? setPageState(PAGE_STATE_TYPE.BRIDGE) : setPageState(PAGE_STATE_TYPE.DEFAULT)
        }}
      />
    </>
  )
}
