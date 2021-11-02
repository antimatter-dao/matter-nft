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
import { useERC721ApproveAllCallback } from 'hooks/useERC721ApproveAllCallback'
import { NFT_BRIDGE_ADDRESS } from 'constants/index'
import { useBridgeCallback } from 'hooks/useBridgeCallback'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import { useTransactionAdder } from 'state/transactions/hooks'
import ActionButton from 'components/Button/ActionButton'
import TransacitonPendingModal from 'components/Modal/TransactionModals/TransactionPendingModal'
import { Axios, SignatureResponse } from 'utils/httpRequest/axios'
import { useNFTImageByUri } from 'hooks/useNFTImage'
import { useFeeSend } from 'hooks/useNftData'
import { TransactionDetails } from 'state/transactions/reducer'

export default function BridgeForm({
  token,
  onReturnClick,
  depositTxn,
  withdrawTxn
}: {
  token: NFT | undefined
  onReturnClick: () => void
  depositTxn: TransactionDetails | undefined
  withdrawTxn: TransactionDetails | undefined
}) {
  const [fromChain, setFromChain] = useState<Chain | null>(null)
  const [toChain, setToChain] = useState<Chain | null>(null)
  const [deposited, setDeposited] = useState(false)
  const [depositing, setDepositing] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawed, setWithdrawed] = useState(false)
  // const [withdrawHash, setWithdrawHash] = useState<undefined | string>(undefined)
  const [withdrawModalOpen, setwithdrawModalOpen] = useState(false)
  const [error, setError] = useState('')

  const tokenAddress = token?.contractAddress ?? ''
  const tokenId = token?.tokenId ?? ''
  const tokenUri = useNFTImageByUri(token?.tokenUri)

  const { account, chainId, library } = useActiveWeb3React()

  // TOTD
  const sendFee = useFeeSend(
    chainId !== toChain?.id ? token?.contractAddress || token?.mainAddress : token?.mainAddress
  )

  const [approvalState, approvalCallback] = useERC721ApproveAllCallback(
    token?.contractAddress ?? undefined,
    NFT_BRIDGE_ADDRESS
  )
  const { deposit, withdraw } = useBridgeCallback()
  const addTransaction = useTransactionAdder()

  // const withdrawTxn = useTransaction(withdrawHash)

  const approved = approvalState === ApprovalState.APPROVED
  const approving = approvalState === ApprovalState.PENDING

  const isUpToSM = useBreakpoint()
  const { showModal, hideModal } = useModal()

  const handleTo = useCallback(chain => {
    setToChain(chain)
  }, [])

  const handleWithdraw = useCallback(async () => {
    if (!token || !toChain || !fromChain || !account || !library || !sendFee) return
    showModal(<TransacitonPendingModal />)
    try {
      const signRoutes = ['getNftRecvSignData']
      const nonce = depositTxn?.deposit?.log?.parsedLog.nonce
      if (nonce === undefined) throw Error('No nonce')
      const requestList = await Promise.all(
        signRoutes.map(route =>
          Axios.post<SignatureResponse>(route, {
            chainId: toChain?.id,
            fromChainId: depositTxn?.deposit?.fromChain,
            mainChainId: token.mainChainId,
            name: token.name,
            nft: token.contractAddress,
            nonce: +nonce,
            symbol: token.symbol,
            to: account,
            tokenId: token.tokenId,
            tokenURI: token.tokenUri
          })
        )
      )
      const resList = await requestList
      const signsList = resList.map(({ data: { data: response } }: { data: { data: any } }) => [
        response.signatory,
        response.signV,
        response.signR,
        response.signS
      ])
      setwithdrawModalOpen(false)
      const r: any = await withdraw(
        {
          fromChainId: token.chainId,
          toAddress: account,
          nonce: nonce,
          name: token.name,
          symbol: token.symbol,
          mainChainId: token.mainChainId,
          nftAddress: token.mainAddress,
          tokenId: token.tokenId,
          tokenURI: token.tokenUri,
          signatures: signsList
        },
        {
          gasLimit: 3500000,
          value: sendFee
        }
      )

      hideModal()
      setWithdrawing(true)
      addTransaction(r, {
        summary: `Withdraw NFT(${token?.name}) from ${toChain?.name}`,
        withdraw: {
          depositHash: depositTxn?.hash || '',
          fromChain: depositTxn?.deposit?.fromChain || fromChain.id || 1,
          toChain: depositTxn?.deposit?.toChain || toChain.id || 1
        }
      })
      showModal(<TransactionSubmittedModal />)
    } catch (e) {
      hideModal()
      showModal(<MessageBox type="error">{(e as Error).message}</MessageBox>)
      setWithdrawing(false)
      return console.error(e)
    }
  }, [
    account,
    addTransaction,
    depositTxn?.deposit?.fromChain,
    depositTxn?.deposit?.log?.parsedLog.nonce,
    depositTxn?.deposit?.toChain,
    depositTxn?.hash,
    fromChain,
    hideModal,
    library,
    sendFee,
    showModal,
    toChain,
    token,
    withdraw
  ])

  const handleDeposit = useCallback(() => {
    if (!token || !toChain || !fromChain || !sendFee) return
    showModal(<TransacitonPendingModal />)
    deposit(token?.contractAddress ?? '', toChain?.id ?? 1, account ?? '', token.tokenId, {
      gasLimit: 3500000,
      value: sendFee
    })
      .then((r: any) => {
        hideModal()
        setDepositing(true)
        addTransaction(r, {
          summary: `Deposit NFT(${token.name}) from ${fromChain?.name}`,
          deposit: { fromChain: fromChain.id ?? 1, toChain: toChain.id ?? 1, nft: token }
        })
        showModal(<TransactionSubmittedModal />)
      })
      .catch(e => {
        hideModal()
        setDepositing(false)
        showModal(<MessageBox type="error">{e.message}</MessageBox>)
      })
  }, [account, addTransaction, deposit, fromChain, hideModal, sendFee, showModal, toChain, token])

  useEffect(() => {
    if (approvalState === ApprovalState.APPROVED) {
      hideModal()
    }
  }, [approvalState, approving, hideModal, showModal])

  useEffect(() => {
    if (token?.owner === NFT_BRIDGE_ADDRESS) {
      setDeposited(true)
    }
    if (depositTxn?.receipt?.status === 1) {
      setDeposited(true)
      setDepositing(false)
    }
    if (depositTxn?.receipt?.status === 0) {
      setDepositing(false)
      setDepositing(false)
    }
  }, [chainId, depositTxn, token?.chainId, token?.owner])

  useEffect(() => {
    if (withdrawTxn && !withdrawTxn) {
      setWithdrawed(false)
      setWithdrawing(true)
    }
    if (withdrawTxn?.receipt?.status === 1) {
      setWithdrawed(true)
      setWithdrawing(false)
    }
    if (withdrawTxn?.receipt?.status === 0) {
      setWithdrawed(false)
      setWithdrawing(false)
    }
  }, [withdrawTxn])

  useEffect(() => {
    if (!account) return setError('Please connect wallet')
    if (!tokenAddress) return setError('Enter token contract address')
    if (tokenAddress && !tokenId) return setError('Enter token ID')
    if (tokenAddress && tokenId && (!fromChain || !toChain)) return setError('Select Chain')
    setError('')
  }, [account, fromChain, toChain, tokenAddress, tokenId])

  useEffect(() => {
    token?.chainId && setFromChain(ChainListMap[token?.chainId])
    depositTxn?.deposit?.fromChain && setFromChain(ChainListMap[depositTxn.deposit.fromChain])
    depositTxn?.deposit?.toChain && setToChain(ChainListMap[depositTxn.deposit.toChain])
  }, [depositTxn?.deposit?.fromChain, depositTxn?.deposit?.toChain, token])

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
        error={
          depositTxn?.deposit?.log?.parsedLog.from && depositTxn?.deposit?.log?.parsedLog.from !== account
            ? 'Account unmatched'
            : undefined
        }
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
              &nbsp;your wallet network&nbsp;
            </b>
            to {toChain?.name || ''} to complete token swap.
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
      depositTxn?.deposit?.log?.parsedLog.from,
      fromChain,
      handleWithdraw,
      hideModal,
      library,
      showModal,
      toChain,
      tokenUri,
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
                disabledTo={!(tokenAddress && tokenId) || deposited || withdrawed || depositing || withdrawing}
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
                success={approved}
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
                      onAction={
                        chainId === toChain?.id
                          ? () => {
                              setwithdrawModalOpen(true)
                            }
                          : () => {
                              library?.send('wallet_switchEthereumChain', [{ chainId: toChain?.hex }, account])
                            }
                      }
                      actionText={
                        chainId === toChain?.id ? `Withdraw in ${toChain?.symbol} Chain` : `Switch to ${toChain?.name}`
                      }
                      pending={withdrawing}
                      pendingText="Withdrawing"
                      success={withdrawed}
                      successText={`Withdrawed Successfully`}
                    />
                  )}
                </Box>
                {!error && (
                  <Box width="70%" style={{ margin: '0 auto' }}>
                    <Stepper steps={[1, 2]} activeStep={withdrawed ? 2 : deposited ? 1 : 0} />
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
