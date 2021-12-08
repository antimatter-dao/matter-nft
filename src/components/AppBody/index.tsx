import React from 'react'
import { styled } from '@mui/material/styles'
import { CloseIcon } from 'theme/components'

const Root = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  background: theme.palette.background.paper,
  justifyContent: 'center',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxSizing: 'border-box',
  overflow: 'auto',
  [theme.breakpoints.down('lg')]: {
    width: '100%!important',
    maxWidth: 'unset'
  }
}))

export default function AppBody({
  children,
  closeIcon,
  onReturnClick,
  width,
  maxWidth,
  height
}: {
  children: React.ReactNode
  width?: number | string
  onReturnClick?: () => void
  title?: string
  maxWidth?: string
  closeIcon?: boolean
  height?: string | number
}) {
  return (
    <Root
      sx={{
        width: width || 560,
        maxWidth: maxWidth || 560,
        height: height
      }}
    >
      {closeIcon && <CloseIcon onClick={onReturnClick} />}
      {children}
    </Root>
  )
}
