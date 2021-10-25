import { useState, useCallback } from 'react'
import AppBody from 'components/AppBody'
import { Typography, Box } from '@material-ui/core'
import Input from 'components/Input'
import Image from 'components/Image'
import PlaceholderImg from 'assets/images/placeholder_image.png'
import { Chain } from 'models/chain'
import ChainSwap from 'components/Select/ChainSwap'
import DummyLogo from 'assets/images/ethereum-logo.png'
import Button from 'components/Button/Button'
import OutlineButton from 'components/Button/OutlineButton'
import Spinner from 'components/Spinner'
import TextButton from 'components/Button/TextButton'
import Stepper from 'components/Stepper'
import useBreakpoint from 'hooks/useBreakpoint'
import DestinationAddress from 'components/Modal/TransactionModals/DestinationAddress'
import DepositConfirmationModal from 'components/Modal/TransactionModals/DepositConfirmationModal'
import useModal from 'hooks/useModal'
import { useActiveWeb3React } from 'hooks'
import { shortenAddress } from 'utils'
import TransactionSubmittedModal from 'components/Modal/TransactionModals/TransactiontionSubmittedModal'
import WithdrawConfirmationModal from 'components/Modal/TransactionModals/WithdrawConfirmationModal'
import SwitchChainModal from 'components/Modal/SwitchChainModal'
import { NFT } from 'models/nft'

export const DummyChainList = [
  {
    logo: DummyLogo,
    symbol: 'ETH',
    id: 1,
    address: 'XXXXXXXXXXXXXXXXXXXX',
    name: 'Ethereum Mainnet'
  },
  {
    logo: DummyLogo,
    symbol: 'BSC',
    id: 1,
    address: 'XXXXXXXXXXXXXXXXXXXX',
    name: 'Binance Smart Chain'
  }
]

export default function BridgeForm({ token }: { token: NFT | undefined }) {
  const [fromChain] = useState<Chain | null>({
    logo: DummyLogo,
    symbol: 'ETH',
    id: 1,
    address: 'XXXXXXXXXXXXXXXXXXXX',
    name: 'Ethereum Mainnet'
  })
  const [toChain, seToChain] = useState<Chain | null>(null)
  const [chain, setChain] = useState(1)

  const [deposited, setDeposited] = useState(false)
  const [depositing, setDepositing] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawed, setWithdrawed] = useState(false)

  const tokenAddress = token?.contractAddress ?? ''
  const tokenId = token?.tokenId ?? ''
  const imgUrl = token?.imgUrl ? token?.imgUrl : PlaceholderImg

  const { account } = useActiveWeb3React()
  const isUpToSM = useBreakpoint()
  const { showModal, hideModal } = useModal()

  const handleTo = useCallback(chain => {
    seToChain(chain)
  }, [])

  const WithdrawModal = (
    <WithdrawConfirmationModal
      destinationAddress={account}
      fromChain={fromChain}
      toChain={toChain}
      onConfirm={() => {
        hideModal()
        setWithdrawing(true)
        setTimeout(() => {
          setWithdrawing(false)
          setWithdrawed(true)
          showModal(<TransactionSubmittedModal />)
        }, 1000)
      }}
      step1={
        <>
          <b>
            Please&nbsp;
            <TextButton
              primary
              onClick={() => {
                showModal(
                  <SwitchChainModal
                    fromChain={fromChain}
                    toChain={toChain}
                    onConfirm={() => {
                      setChain(2)
                      hideModal()
                      showModal(WithdrawModal)
                    }}
                  />
                )
              }}
            >
              switch
            </TextButton>
            &nbsp;your wallet network
          </b>
          to BSC to complete token swap.
        </>
      }
      step2={
        <>
          Please make your connected wallet address is the address where you wish to receive your bridged NFT and the
          correct destination chain.
        </>
      }
      isStep3Active={chain === 2}
    >
      <Box display="grid" width="100%" justifyContent="center">
        <Image src={imgUrl} style={{ width: 100 }} />
      </Box>
    </WithdrawConfirmationModal>
  )

  return (
    <AppBody maxWidth="800px" width="100%">
      <Box display="grid" gridGap="29px" padding="20px 40px 52px" width="100%">
        <Typography variant="h5">NFT Bridge</Typography>
        <Box display={isUpToSM ? 'grid' : 'flex'} gridGap={isUpToSM ? '24px' : '40px'} width="100%">
          <Box display="grid" gridGap="24px" maxWidth={isUpToSM ? 'unset' : '428px'} flexGrow="1">
            <Input
              value={tokenAddress}
              label="Token Contact Address"
              disabled={true}
              placeholder="Enter your token contract address"
            />
            <Input value={tokenId} label="Token ID" disabled={true} placeholder="Enter your token ID" />
            <ChainSwap
              fromChain={fromChain}
              toChain={toChain}
              chainList={DummyChainList}
              onSelectTo={handleTo}
              disabledFrom={true}
              disabledTo={!(tokenAddress && tokenId)}
            />
            {account && <DestinationAddress address={account} margin="-10px 0 10px" />}
          </Box>
          <Box style={{ margin: isUpToSM ? '0 auto' : 'unset' }}>
            <Image
              src={imgUrl}
              style={{ width: 252, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            />
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
                  showModal(
                    <DepositConfirmationModal
                      destinationAddress={account}
                      fromChain={fromChain}
                      toChain={toChain}
                      onConfirm={() => {
                        hideModal()
                        setDepositing(true)
                        setTimeout(() => {
                          setDepositing(false)
                          setDeposited(true)
                          showModal(<TransactionSubmittedModal />)
                        }, 1000)
                      }}
                    >
                      <Box display="grid" gridGap="28px" justifyItems="center">
                        <Typography variant="h6">Confirm Deposit</Typography>
                        <Image src={imgUrl} style={{ width: 180 }} />
                        <Box display="flex" width="100%" justifyContent="space-between" alignItems="center">
                          <Typography variant="body1">{tokenId}</Typography>
                          <Typography variant="body1">{account && shortenAddress(account)}</Typography>
                        </Box>
                      </Box>
                    </DepositConfirmationModal>
                  )
                }}
                disabled={depositing || deposited}
              >
                {depositing && <Spinner size="20px" marginRight={16} color="#ffffff" />}
                Deposite in ETH Chain
              </Button>
              <OutlineButton
                primary
                onClick={() => {
                  showModal(WithdrawModal)
                }}
                disabled={withdrawing || !deposited || withdrawed}
              >
                {withdrawing && <Spinner size="20px" marginRight={16} />}
                Withdrawing
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
