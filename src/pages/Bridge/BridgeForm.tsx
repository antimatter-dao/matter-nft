import { useState, useCallback, useEffect } from 'react'
import AppBody from 'components/AppBody'
import { Typography, Box } from '@material-ui/core'
import Input from 'components/Input'
import Image from 'components/Image'
import PlaceholderImg from 'assets/images/placeholder_image.png'
import { Chain } from 'models/chain'
import ChainSwap from 'components/Select/ChainSwap'
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
import { ChainList, ChainListMap } from 'constants/chain'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useERC721ApproveCallback } from 'hooks/useERC721ApproveCallback'
import { NFT_BRIDGE_ADDRESS } from 'constants/index'
import { useBridgeCallback } from 'hooks/useBridgeCallback'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import { useTransaction, useTransactionAdder } from 'state/transactions/hooks'
import ActionButton from 'components/Button/ActionButton'
import JSBI from 'jsbi'
import TransacitonPendingModal from 'components/Modal/TransactionModals/TransactionPendingModal'
import { Axios } from 'utils/httpRequest/axios'

export default function BridgeForm({ token, onReturnClick }: { token: NFT | undefined; onReturnClick: () => void }) {
  const [fromChain, setFromChain] = useState<Chain | null>(null)
  const [toChain, setToChain] = useState<Chain | null>(null)
  const [deposited, setDeposited] = useState(false)
  const [depositing, setDepositing] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawed, setWithdrawed] = useState(false)
  const [depositHash, setDepositHash] = useState<undefined | string>(undefined)
  const [withdrawHash, setWithdrawHash] = useState<undefined | string>(undefined)
  const [withdrawModalOpen, setwithdrawModalOpen] = useState(false)
  const [error, setError] = useState('')

  const tokenAddress = token?.contractAddress ?? ''
  const tokenId = token?.tokenId ?? ''
  const tokenUri = token?.tokenUri ? token?.tokenUri : PlaceholderImg

  const { account, chainId, library } = useActiveWeb3React()
  const [approvalState, approvalCallback] = useERC721ApproveCallback(
    token?.contractAddress ?? undefined,
    NFT_BRIDGE_ADDRESS,
    tokenId
  )
  const { deposit, withdraw, getNonce } = useBridgeCallback()
  const addTransaction = useTransactionAdder()
  const depositReceipt = useTransaction(depositHash)
  const withdrawReceipt = useTransaction(withdrawHash)

  const approved = approvalState === ApprovalState.APPROVED
  const approving = approvalState === ApprovalState.PENDING

  const isUpToSM = useBreakpoint()
  const { showModal, hideModal } = useModal()

  const handleTo = useCallback(chain => {
    setToChain(chain)
  }, [])

  const handleWithdraw = useCallback(async () => {
    if (!token || !toChain || !account) return
    showModal(<TransacitonPendingModal />)
    try {
      const nonce = await getNonce(token.contractAddress, toChain.hex, account)
      const sign = await Axios.post('getNftRecvSignData', {
        from: {
          chainId: toChain?.id,
          fromChainId: fromChain?.id,
          mainChainId: token.mainChainId,
          name: token.name,
          nft: token.contractAddress,
          nonce: JSBI.toNumber(JSBI.BigInt(nonce.toString())),
          symbol: token.symbol,
          to: account,
          tokenId: token.tokenId,
          tokenURI: token.tokenUri
        }
      })

      console.log(10086, nonce, sign)
      setwithdrawModalOpen(false)
      withdraw(
        {
          fromChainId: fromChain?.hex,
          toAddress: account,
          nonce: JSBI.BigInt(nonce.toString()),
          name: token.name,
          symbol: token?.symbol,
          mainChainId: token?.chainId,
          nftAddress: token?.contractAddress,
          tokenId: token?.tokenId,
          tokenURI: token?.tokenUri,
          signatures: []
        },
        {
          gasLimit: 3500000,
          value: '10000000000000000'
        }
      )
        .then(r => {
          hideModal()
          setWithdrawing(true)
          setWithdrawHash(r.hash)
          addTransaction(r, {
            summary: `Withdraw NFT(${token?.name}) from ${toChain?.name}`
          })
          showModal(<TransactionSubmittedModal />)
          console.log('withdraw', 888, r)
        })
        .catch(e => {
          hideModal()
          showModal(<MessageBox type="error">{e.message}</MessageBox>)
          setWithdrawing(false)
          console.log('withdrawError', 888, e)
        })
    } catch (e) {
      return console.error(e)
    }
  }, [account, addTransaction, fromChain?.hex, fromChain?.id, getNonce, hideModal, showModal, toChain, token, withdraw])

  const handleDeposit = useCallback(() => {
    showModal(<TransacitonPendingModal />)

    if (!token) return
    deposit(token?.contractAddress ?? '', toChain?.id ?? 1, account ?? '', token.tokenId, {
      gasLimit: 3500000,
      value: '10000000000000000'
    })
      .then((r: any) => {
        hideModal()
        setDepositHash(r.hash)
        setDepositing(true)
        addTransaction(r, {
          summary: `Deposit NFT(${token.name}) from ${fromChain?.name}`
        })
        showModal(<TransactionSubmittedModal />)
      })
      .catch(e => {
        hideModal()
        setDepositing(false)
        showModal(<MessageBox type="error">{e.message}</MessageBox>)
      })
  }, [account, addTransaction, deposit, fromChain?.name, hideModal, showModal, toChain?.id, token])

  useEffect(() => {
    if (approvalState === ApprovalState.APPROVED) {
      hideModal()
    }
  }, [approvalState, approving, hideModal, showModal])

  useEffect(() => {
    console.log('depositReceipt', depositReceipt)
    if (token?.owner === NFT_BRIDGE_ADDRESS) {
      setDeposited(true)
    }
    if (depositReceipt?.status === 1) {
      setDeposited(true)
      setDepositing(false)
    }
    if (depositReceipt?.status === 0) {
      setDepositing(false)
      setDepositing(false)
    }
  }, [chainId, depositReceipt, depositReceipt?.status, token?.chainId, token?.owner, withdrawReceipt])

  useEffect(() => {
    console.log('withdrawReceipt', withdrawReceipt)
    if (withdrawReceipt?.status === 1) {
      setWithdrawed(true)
      setWithdrawing(false)
    }
    if (withdrawReceipt?.status === 0) {
      setWithdrawed(false)
      setWithdrawing(false)
    }
  }, [withdrawReceipt, withdrawReceipt?.status])

  useEffect(() => {
    if (!tokenAddress) return setError('Enter token contract address')
    if (tokenAddress && !tokenId) return setError('Enter token ID')
    if (tokenAddress && tokenId && (!fromChain || !toChain)) return setError('Select Chain')
    setError('')
  }, [fromChain, toChain, tokenAddress, tokenId])

  useEffect(() => {
    chainId && setFromChain(ChainListMap[chainId])
  }, [chainId])

  const WithdrawModal = useCallback(
    () => (
      <WithdrawConfirmationModal
        isOpen={withdrawModalOpen}
        onDismiss={() => {
          setwithdrawModalOpen(false)
        }}
        destinationAddress={account}
        fromChain={fromChain}
        toChain={toChain}
        onConfirm={handleWithdraw}
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
                        library?.send('wallet_switchEthereumChain', [{ chainId: toChain?.hex }, account])
                        hideModal()
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
        isStep3Active={!!(toChain && chainId === toChain.id)}
      >
        <Box display="grid" width="100%" justifyContent="center">
          <Image src={tokenUri} style={{ width: 100, borderRadius: 10 }} altSrc={PlaceholderImg} />
        </Box>
      </WithdrawConfirmationModal>
    ),
    [
      account,
      chainId,
      fromChain,
      hideModal,
      library,
      showModal,
      toChain,
      token?.chainId,
      token?.contractAddress,
      token?.name,
      token?.symbol,
      token?.tokenId,
      token?.tokenUri,
      tokenUri,
      withdraw,
      withdrawModalOpen
    ]
  )
  const DepositModal = useCallback(
    () => (
      <DepositConfirmationModal
        destinationAddress={account}
        fromChain={fromChain}
        toChain={toChain}
        onConfirm={handleDeposit}
      >
        <Box display="grid" gridGap="28px" justifyItems="center">
          <Typography variant="h6">Confirm Deposit</Typography>
          <Image src={tokenUri} style={{ width: 180 }} altSrc={PlaceholderImg} />
          <Box display="flex" width="100%" justifyContent="space-between" alignItems="center">
            <Typography variant="body1">{tokenId}</Typography>
            <Typography variant="body1">{account && shortenAddress(account)}</Typography>
          </Box>
        </Box>
      </DepositConfirmationModal>
    ),
    [account, fromChain, handleDeposit, toChain, tokenId, tokenUri]
  )

  return (
    <>
      <WithdrawModal />
      <AppBody maxWidth="800px" width="100%" onReturnClick={onReturnClick} closeIcon>
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
                chainList={ChainList}
                onSelectTo={handleTo}
                disabledFrom={true}
                disabledTo={!(tokenAddress && tokenId)}
                activeTo={!!fromChain && !!tokenAddress && !!tokenId && !toChain}
              />
              {account && <DestinationAddress address={account} margin="-10px 0 10px" />}
            </Box>
            <Box style={{ margin: isUpToSM ? '0 auto' : 'unset' }}>
              <Image
                src={tokenUri}
                altSrc={PlaceholderImg}
                style={{
                  width: 240,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  maxHeight: 252,
                  objectFit: 'cover'
                }}
              />
            </Box>
          </Box>
          <>
            {!approved && !deposited ? (
              <ActionButton
                error={error}
                pending={approving}
                onAction={() => {
                  approvalCallback()
                  showModal(<TransacitonPendingModal />)
                }}
                successText="Approved"
                pendingText="approving"
                actionText="Approve"
              />
            ) : (
              <>
                <Box display={isUpToSM ? 'grid' : 'flex'} gridGap="16px">
                  <ActionButton
                    error={error}
                    onAction={() => {
                      showModal(<DepositModal />)
                    }}
                    actionText={`Deposite in ${fromChain?.symbol} Chain`}
                    pending={depositing}
                    pendingText="Depositing"
                    success={deposited}
                    successText={`Deposited Successfully`}
                  />
                  {!error && (
                    <ActionButton
                      error={deposited ? '' : `Withdraw in ${toChain?.symbol} Chain`}
                      onAction={() => {
                        setwithdrawModalOpen(true)
                      }}
                      actionText={`Withdraw in ${toChain?.symbol} Chain`}
                      pending={withdrawing}
                      pendingText="Withdrawing"
                      success={withdrawed}
                      successText={`Withdrawed Successfully`}
                    />
                  )}
                </Box>
                {!error && (
                  <Box width="70%" style={{ margin: '0 auto' }}>
                    <Stepper steps={[1, 2]} activeStep={deposited ? 1 : withdrawed ? 2 : 0} />
                  </Box>
                )}
              </>
            )}
          </>
        </Box>
      </AppBody>
    </>
  )
}
