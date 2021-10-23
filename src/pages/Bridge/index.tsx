import { useState } from 'react'
import { Typography, Box } from '@material-ui/core'
import AppBody from 'components/AppBody'
import Button from 'components/Button/Button'
import BridgeForm from './BridgeForm'

export enum IMPORT_TYPE {
  FROM_INVENTORY,
  MANUAL
}

export default function Bridge() {
  const [importType, setImportType] = useState<IMPORT_TYPE | undefined>(undefined)

  return (
    <>
      {importType === undefined && (
        <AppBody>
          <Box display="grid" gridGap="29px" padding="20px 40px 52px">
            <Typography variant="h5">NFT Bridge</Typography>
            <Button
              onClick={() => {
                setImportType(IMPORT_TYPE.FROM_INVENTORY)
              }}
            >
              Select From Inventory
            </Button>
            <Button
              onClick={() => {
                setImportType(IMPORT_TYPE.MANUAL)
              }}
            >
              Import Manually
            </Button>
          </Box>
        </AppBody>
      )}
      {importType === IMPORT_TYPE.FROM_INVENTORY && <BridgeForm importType={importType} />}
      {importType === IMPORT_TYPE.MANUAL && <BridgeForm importType={importType} />}
    </>
  )
}
