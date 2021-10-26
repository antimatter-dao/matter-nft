import { Box, Typography } from '@material-ui/core'
import Button from 'components/Button/Button'
import Divider from 'components/Divider'
import { Chain } from 'models/chain'
import React from 'react'
import Modal from '../index'
import DestinationAddress from './DestinationAddress'
import SwapChain from './SwapChain'

export default function TransacitonPendingModal({
  children,
  toChain,
  fromChain,
  destinationAddress,
  onConfirm,
  step1,
  step2,
  isStep3Active,
  isOpen,
  onDismiss
}: {
  isOpen: boolean
  onDismiss: () => void
  step1: React.ReactNode
  step2: React.ReactNode
  isStep3Active: boolean
  children: React.ReactNode
  toChain: Chain | null
  fromChain: Chain | null
  destinationAddress: string | undefined | null
  onConfirm?: () => void
}) {
  return (
    <Modal closeIcon customIsOpen={isOpen} customOnDismiss={onDismiss}>
      <Box display="grid" padding="40px" gridGap="24px" justifyItems="center" width="100%">
        <Box
          style={{
            opacity: isStep3Active ? 0.5 : 1
          }}
          display="grid"
          gridGap="12px"
          width="100%"
        >
          <Typography component="div" align="center" variant="inherit">
            1.&nbsp;{step1}
          </Typography>
          <Typography component="div" align="center" variant="inherit">
            2.&nbsp;{step2}
          </Typography>
          <Box justifySelf="start" width="100%" marginTop="10px">
            {fromChain && toChain && <SwapChain to={toChain} from={fromChain} />}
            <DestinationAddress address={destinationAddress ?? ''} />
          </Box>
        </Box>
        <Divider extension={40} />
        <Box
          style={{
            opacity: isStep3Active ? 1 : 0.5
          }}
          display="grid"
          gridGap="24px"
          width="100%"
        >
          <Typography component="div" align="center" variant="inherit">
            3. Confirm Withdraw
          </Typography>
          {children}

          <Button onClick={onConfirm} disabled={!isStep3Active}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
