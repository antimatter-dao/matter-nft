import { useMemo } from 'react'
import { Box } from '@mui/material'
import TextButton from 'components/Button/TextButton'
import ChainNetworkSelect from './ChainNetworkSelect'
import { Chain } from 'models/chain'
import SwitchButton from './SwitcherButton'

export default function ChainSwap({
  fromChain,
  toChain,
  chainList,
  onSelectTo,
  onSelectFrom,
  disabledFrom,
  disabledTo,
  activeFrom,
  activeTo,
  onSwitch
}: {
  fromChain: Chain | null
  toChain: Chain | null
  chainList: Chain[]
  onSelectFrom?: (chain: Chain) => void
  onSelectTo?: (chain: Chain) => void
  disabledFrom?: boolean
  disabledTo?: boolean
  activeFrom?: boolean
  activeTo?: boolean
  onSwitch?: () => void
}) {
  // const handleSwitch = () => {
  //   if (!onSelectTo || !onSelectFrom) return
  //   const from = fromChain
  //   const to = toChain
  //   onSelectFrom(to)
  //   onSelectTo(from)
  // }
  const fromChainList = useMemo(() => {
    return chainList.filter(chain => chain.id !== toChain?.id)
  }, [chainList, toChain])

  const toChainList = useMemo(() => {
    return chainList.filter(chain => chain.id !== fromChain?.id)
  }, [chainList, fromChain])

  return (
    <Box display="flex" justifyContent="space-between" alignItems={'flex-end'} position={'relative'} width="100%">
      <ChainNetworkSelect
        label="Send"
        selectedChain={fromChain}
        chainList={fromChainList}
        onChange={onSelectFrom}
        width="49%"
        disabled={disabledFrom}
        active={activeFrom}
      />
      <Box position={'absolute'} left={'calc(50% - 16px)'} zIndex={99} padding="0px" height="32px" bottom="35px">
        <TextButton onClick={onSwitch} disabled={disabledFrom || disabledTo || !onSelectTo || !onSelectFrom}>
          <SwitchButton />
        </TextButton>
      </Box>
      <ChainNetworkSelect
        label="Destination"
        selectedChain={toChain}
        chainList={toChainList}
        onChange={onSelectTo}
        width="49%"
        disabled={disabledTo}
        active={activeTo}
      />
    </Box>
  )
}
