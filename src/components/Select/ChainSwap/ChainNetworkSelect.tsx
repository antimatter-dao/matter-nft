import { useState, useRef } from 'react'
import { MenuItem, Box, Typography, Select, styled, useTheme } from '@mui/material'
import InputLabel from 'components/Input/InputLabel'
import { useCallback } from 'react'
import { Chain } from 'models/chain'
import Image from 'components/Image'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import SelectedIcon from 'assets/componentsIcon/selected_icon.svg'

interface Props {
  label?: string
  disabled?: boolean
  chainList: Chain[]
  selectedChain: Chain | null
  onChange?: (e: any) => void
  width?: string
  active?: boolean
  placeholder?: string
}

const StyledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  height: '102px',
  position: 'relative',
  '& .MuiSelect-icon': {
    color: theme.palette.primary.main,
    top: '65px',
    right: '22px'
  }
}))

const StyledImgBox = styled(Box)({
  '& img': {
    width: '28px',
    height: '28px'
  },
  '& span': {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#F7F7F8'
  }
})

export default function ChainSelect({ label, disabled, chainList, onChange, selectedChain, width }: Props) {
  const theme = useTheme()
  const node = useRef<any>()
  const [open, setOpen] = useState(false)

  useOnClickOutside(node, () => {
    setOpen(false)
  })

  const handleChange = useCallback(
    e => {
      const chain = chainList.find(chain => chain.name === e.target.value) ?? null
      onChange && onChange(chain)
    },
    [chainList, onChange]
  )

  const onOpen = useCallback(e => {
    if (e.target.tagName === 'BUTTON') {
      return setOpen(false)
    }

    setOpen(true)
  }, [])

  return (
    <Box sx={{ width }} ref={node}>
      {label && <InputLabel>{label}</InputLabel>}
      <StyledSelect
        sx={{
          paddingLeft: '10px',
          width: '100%',
          fieldset: {
            display: 'none'
          }
        }}
        open={open}
        onOpen={onOpen}
        displayEmpty
        // defaultValue={selectedChain?.name}
        value={selectedChain?.name ?? ''}
        disabled={disabled}
        MenuProps={{
          PaperProps: {
            style: {
              marginTop: '5px',
              background: theme.palette.background.default
            }
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left'
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left'
          }
        }}
        IconComponent={ExpandMoreIcon}
        onChange={handleChange}
        renderValue={() => {
          return (
            <MenuItem
              sx={{
                display: 'block',
                '&.Mui-selected': {
                  background: '#FFFFFF'
                },
                '&.Mui-selected:hover': {
                  background: '#FFFFFF'
                }
              }}
              value={selectedChain?.name ?? ''}
              key={selectedChain?.name ?? ''}
              selected={!!selectedChain}
            >
              <StyledImgBox sx={{ mb: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedChain ? (
                  <Image src={selectedChain.logo as string} alt={`${selectedChain.name} logo`} />
                ) : (
                  <span></span>
                )}
              </StyledImgBox>
              <Typography
                variant="body1"
                sx={{ fontSize: '16px', fontWeight: 500, color: selectedChain ? 'inherit' : 'rgba(22, 22, 22, 0.5)' }}
              >
                {selectedChain ? selectedChain.name : 'Select Network'}
              </Typography>
            </MenuItem>
          )
        }}
      >
        {chainList.map(option => (
          <MenuItem
            sx={{
              display: 'flex',
              alignItems: 'center',
              minHeight: 56,
              minWidth: 300,
              padding: '8px 24px',
              borderBottom: '1px solid rgba(66, 63, 71, 0.1)',
              '&.Mui-selected::after': {
                content: selectedChain?.name === option.name ? `url(${SelectedIcon})` : '""',
                position: 'absolute',
                right: 28
              },
              '& .MuiTypography-root': {
                fontWeight: 400
              }
            }}
            value={option.name}
            key={option.name}
            selected={selectedChain?.name === option.name}
          >
            <StyledImgBox
              sx={{ height: 40, mr: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Image src={option.logo as string} alt={`${option.name} logo`} />
            </StyledImgBox>
            <Typography variant="body1" sx={{ fontSize: '16px', fontWeight: 500 }}>
              {option.name}
            </Typography>
          </MenuItem>
        ))}
      </StyledSelect>
    </Box>
  )
}
