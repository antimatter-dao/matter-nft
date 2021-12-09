import React from 'react'
import { Dialog, useTheme } from '@mui/material'
import useModal from 'hooks/useModal'
import { useRef } from 'react'
import { CloseIcon } from 'theme/components'

interface Props {
  children?: React.ReactNode
  closeIcon?: boolean
  width?: string
  maxWidth?: string
  isCardOnMobile?: boolean
  customIsOpen?: boolean
  customOnDismiss?: () => void
  padding?: string
  hasBorder?: boolean
  bgColor?: string
  boxShadow?: string
  showHeader?: boolean
}

export default function Modal(props: Props) {
  const {
    children,
    closeIcon,
    isCardOnMobile,
    customIsOpen,
    customOnDismiss,
    hasBorder = true,
    width,
    maxWidth,
    padding,
    bgColor,
    boxShadow,
    showHeader
  } = props
  const { isOpen, hideModal } = useModal()
  const node = useRef<any>()
  const theme = useTheme()
  const hide = customOnDismiss ? customOnDismiss : hideModal

  return (
    <>
      <Dialog
        open={customIsOpen !== undefined ? !!customIsOpen : isOpen}
        sx={{
          '& *': {
            boxSizing: 'border-box',
            '& .MuiDialog-scrollPaper': {
              alignItems: !isCardOnMobile ? { mdDown: 'flex-end' } : {}
            }
          },
          top: theme => (showHeader ? { xs: theme.height.mobileHeader, md: theme.height.header } : undefined),
          maxHeight: theme =>
            showHeader
              ? {
                  xs: `calc(100vh - ${theme.height.header} - ${theme.height.mobileHeader})`,
                  md: `calc(100vh - ${theme.height.header})`
                }
              : undefined
        }}
        PaperProps={{
          ref: node,
          sx: {
            ...{
              width: { xs: 'calc(100vw - 32px)!important', md: width || 480 },
              maxWidth: maxWidth || 480,
              border: hasBorder ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
              padding: padding || 0,
              boxSizing: 'border-box',
              borderRadius: 2,
              marginBottom: { xs: '32px', md: 100 },
              overflowX: 'hidden',
              position: 'absolute',
              overflowY: 'auto',
              maxHeight: theme => ({
                xs: `calc(100vh - ${theme.height.header} - ${theme.height.mobileHeader})`,
                md: `calc(100vh - ${theme.height.header})`
              }),
              boxShadow: boxShadow
            },
            ...(!isCardOnMobile
              ? {
                  [theme.breakpoints.down('lg')]: {
                    border: 'none',
                    borderTop: '1px solid transparent',
                    borderBottom: '1px solid #00000020',
                    width: '100%!important',
                    maxWidth: 'unset!important',
                    maxHeight: 'unset',
                    height: `calc(100vh - ${theme.height.mobileHeader} - ${theme.height.header})`,
                    margin: theme.height.header,
                    borderRadius: '20px 20px 0 0',
                    boxShadow: 'none'
                  }
                }
              : {})
          }
        }}
        BackdropProps={{
          sx: {
            ...{
              backgroundColor: bgColor ?? 'rgba(0,0,0,0.28)',
              top: showHeader ? theme.height.header : undefined,
              [theme.breakpoints.down('md')]: {
                height: showHeader ? `calc(100vh - ${theme.height.header} - ${theme.height.mobileHeader})` : undefined
              }
            },
            ...(!isCardOnMobile
              ? {
                  [theme.breakpoints.down('lg')]: {
                    background: 'none'
                  }
                }
              : {})
          }
        }}
        onClose={hide}
      >
        {closeIcon && <CloseIcon onClick={hide} />}
        {children}
      </Dialog>
    </>
  )
}
