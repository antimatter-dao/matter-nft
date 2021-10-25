import { useState, useCallback } from 'react'
import AppBody from 'components/AppBody'
import { Typography, Box } from '@material-ui/core'
import Input from 'components/Input'
import Image from 'components/Image'
import PlaceholderImg from 'assets/images/placeholder_image.png'
import Matamask from 'assets/walletIcon/metamask.png'
import { Chain } from 'components/Select/ChainSelect'
import ChainSwap from 'components/Select/ChainSwap'
import DummyLogo from 'assets/images/ethereum-logo.png'
import Button from 'components/Button/Button'
import OutlineButton from 'components/Button/OutlineButton'
import Spinner from 'components/Spinner'
import { IMPORT_TYPE } from '.'
import Stepper from 'components/Stepper'
import useBreakpoint from 'hooks/useBreakpoint'

const DummyChainList = [
  {
    logo: DummyLogo,
    symbol: 'ETH',
    id: 'XXX',
    address: 'XXXXXXXXXXXXXXXXXXXX'
  },
  {
    logo: DummyLogo,
    symbol: 'BSC',
    id: 'XXX',
    address: 'XXXXXXXXXXXXXXXXXXXX'
  },
  {
    logo: DummyLogo,
    symbol: 'OEC',
    id: 'XXX',
    address: 'XXXXXXXXXXXXXXXXXXXX'
  }
]

export default function BridgeForm({ importType }: { importType?: IMPORT_TYPE }) {
  const [fromChain, setFromChain] = useState<Chain | null>(null)
  const [toChain, seToChain] = useState<Chain | null>(null)
  const [addressStr, setAddressStr] = useState('')
  const [idStr, setIdStr] = useState('')
  const [deposited, setDeposited] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const tokenAddressInfo = '0x33A9b7ED8C71C6910Fb4A9bc41de2391b74c2976'
  const tokenIdInfo = '#1234'

  const isManual = importType !== IMPORT_TYPE.FROM_INVENTORY
  const tokenAddress = isManual ? addressStr : tokenAddressInfo
  const tokenId = isManual ? idStr : tokenIdInfo

  const isUpToSM = useBreakpoint()
  const handleAddressStr = useCallback(e => {
    setAddressStr(e.target.value)
  }, [])

  const handleIdStr = useCallback(e => {
    setIdStr(e.target.value)
  }, [])

  const handleFrom = useCallback(chain => {
    setFromChain(chain)
  }, [])

  const handleTo = useCallback(chain => {
    seToChain(chain)
  }, [])

  return (
    <AppBody maxWidth="800px" width="100%">
      <Box display="grid" gridGap="29px" padding="20px 40px 52px" width="100%">
        <Typography variant="h5">NFT Bridge</Typography>
        <Box display={isUpToSM ? 'grid' : 'flex'} gridGap={isUpToSM ? '24px' : '40px'} width="100%">
          <Box display="grid" gridGap="24px" maxWidth={isUpToSM ? 'unset' : '428px'} flexGrow="1">
            <Input
              value={tokenAddress}
              label="Token Contact Address"
              disabled={!isManual}
              placeholder="Enter your token contract address"
              onChange={handleAddressStr}
            />
            <Input
              value={tokenId}
              label="Token ID"
              disabled={!isManual}
              placeholder="Enter your token ID"
              onChange={handleIdStr}
            />
            <ChainSwap
              fromChain={fromChain}
              toChain={toChain}
              chainList={DummyChainList}
              onSelectFrom={handleFrom}
              onSelectTo={handleTo}
              disabledFrom={!(tokenAddress && tokenId)}
              disabledTo={!(tokenAddress && tokenId)}
            />
            <Typography variant="caption">
              <Box display="flex" marginTop="-15px">
                Destination:
                <Image src={Matamask} style={{ height: 16, width: 16, objectFit: 'contain', margin: '0 15px' }} />
                0xKos369cd6vwd94wq1gt4hr87ujv
              </Box>
            </Typography>
          </Box>
          <Box style={{ width: 252, margin: isUpToSM ? '0 auto' : 'unset' }}>
            <Image src={PlaceholderImg} />
          </Box>
        </Box>
        {!tokenAddress && (
          <OutlineButton primary disabled>
            Enter token contract address
          </OutlineButton>
        )}
        {tokenAddress && !tokenId && (
          <OutlineButton primary disabled>
            Enter token ID
          </OutlineButton>
        )}
        {tokenAddress && tokenId && (!fromChain || !toChain) && (
          <OutlineButton primary disabled>
            Select Chain
          </OutlineButton>
        )}
        {tokenAddress && tokenId && fromChain && toChain && (
          <>
            <Box display="flex" gridGap="16px">
              <Button
                onClick={() => {
                  setDeposited(true)
                }}
                disabled={deposited}
              >
                Deposite in ETH Chain
              </Button>
              <OutlineButton
                primary
                onClick={() => {
                  setWithdrawing(true)
                }}
                disabled={withdrawing || !deposited}
              >
                {withdrawing && <Spinner size="20px" />}
                <span style={{ marginLeft: 16 }}>Withdrawing</span>
              </OutlineButton>
            </Box>
            <Box width="70%" style={{ margin: '0 auto' }}>
              <Stepper steps={[1, 2]} activeStep={deposited ? 1 : withdrawing ? 2 : 0} />
            </Box>
          </>
        )}
      </Box>
    </AppBody>
  )
}
