import { useState, useCallback, useEffect, useContext } from 'react'
import { Typography, Box, Grid } from '@mui/material'
import Axios, { AxiosResponse } from 'axios'
import { useHistory } from 'react-router'
import AppBody from 'components/AppBody'
import Input from 'components/Input'
import Image from 'components/Image'
import { Chain } from 'models/chain'
import ChainSwap from 'components/Select/ChainSwap'
import TextButton from 'components/Button/TextButton'
import Stepper from 'components/Stepper'
import useBreakpoint from 'hooks/useBreakpoint'
import { StatusIcon } from 'components/Modal/TransactionModals/DestinationAddress'
import DepositConfirmationModal from 'components/Modal/TransactionModals/DepositConfirmationModal'
import useModal from 'hooks/useModal'
import { useActiveWeb3React } from 'hooks'
import { shortenAddress } from 'utils'
import TransactionSubmittedModal, {
  SwapSuccessModal
} from 'components/Modal/TransactionModals/TransactiontionSubmittedModal'
import WithdrawConfirmationModal from 'components/Modal/TransactionModals/WithdrawConfirmationModal'
import SwitchChainModal from 'components/Modal/SwitchChainModal'
import { ChainList, ChainListMap } from 'constants/chain'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useERC721ApproveAllCallback } from 'hooks/useERC721ApproveAllCallback'
import { NFT_BRIDGE_ADDRESS } from 'constants/index'
import { useBridgeCallback } from 'hooks/useBridgeCallback'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import { useTransactionAdder } from 'state/transactions/hooks'
import ActionButton from 'components/Button/ActionButton'
import TransacitonPendingModal from 'components/Modal/TransactionModals/TransactionPendingModal'
import { SignatureResponse, ResponseType } from 'utils/httpRequest/axios'
import { useNFTImageByUri } from 'hooks/useNFTImage'
import { useFeeSend, useRecvSend } from 'hooks/useNftData'
import { SwapContext } from 'context/SwapContext'
import { routes } from 'constants/routes'
import NFTPlaceholder from 'assets/images/nft_placeholder.png'
import NFTCard from 'components/NFTCard'
import { HideOnMobile, ShowOnMobile } from 'theme'
import InputLabel from 'components/Input/InputLabel'
import { OutlinedCard } from 'components/Card'

const emptyNft = {
  tokenUri: NFTPlaceholder,
  name: '-',
  mainAddress: '-',
  contractAddress: '',
  tokenId: '-'
}

export default function BridgeForm() {
  const { selectedToken: token, depositTxn, withdrawTxn } = useContext(SwapContext)
  const [fromChain, setFromChain] = useState<Chain | null>(null)
  const [toChain, setToChain] = useState<Chain | null>(null)
  const [deposited, setDeposited] = useState(false)
  const [depositing, setDepositing] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawed, setWithdrawed] = useState(false)
  const [withdrawModalOpen, setwithdrawModalOpen] = useState(false)
  const [error, setError] = useState('')

  const tokenAddress = token?.contractAddress ?? ''
  const tokenId = token?.tokenId ?? ''
  const tokenUri = useNFTImageByUri(token?.tokenUri)

  const { account, chainId, library } = useActiveWeb3React()

  const sendFee = useFeeSend(token?.contractAddress)
  const recvFee = useRecvSend(token?.mainChainId, token?.mainAddress)

  const [approvalState, approvalCallback] = useERC721ApproveAllCallback(
    token?.contractAddress ?? undefined,
    NFT_BRIDGE_ADDRESS
  )
  const { deposit, withdraw } = useBridgeCallback()
  const addTransaction = useTransactionAdder()

  const approved = approvalState === ApprovalState.APPROVED
  const approving = approvalState === ApprovalState.PENDING

  const isUpToSM = useBreakpoint()
  const { showModal, hideModal } = useModal()
  const history = useHistory()

  const handleReturnClick = useCallback(() => {
    history.push(routes.home)
  }, [history])

  const handleTo = useCallback(chain => {
    setToChain(chain)
  }, [])

  const handleWithdraw = useCallback(async () => {
    if (!token || !toChain || !fromChain || !account || !library || !recvFee) return
    showModal(<TransacitonPendingModal />)
    try {
      const signRoutes = [
        'https://node1.chainswap.com/web/getNftRecvSignData',
        'https://node2.chainswap.com/web/getNftRecvSignData',
        'https://node3.chainswap.com/web/getNftRecvSignData',
        'https://node4.chainswap.com/web/getNftRecvSignData',
        'https://node5.chainswap.com/web/getNftRecvSignData'
      ]
      const nonce = depositTxn?.deposit?.nonce
      if (nonce === undefined) throw Error('No nonce')
      const httpRequestsList = signRoutes.map(route =>
        Axios.post<any, AxiosResponse<ResponseType<SignatureResponse>>>(route, {
          chainId: toChain?.id,
          fromChainId: depositTxn?.deposit?.fromChain,
          mainChainId: token.mainChainId ? token.mainChainId : 1,
          name: token.name,
          nft: token.contractAddress,
          nonce: +nonce,
          symbol: token.symbol,
          to: account,
          tokenId: token.tokenId,
          tokenURI: token.tokenUri
        })
      )

      const aggregated: any[] = []
      let error = 0
      const requestList: Promise<AxiosResponse<ResponseType<SignatureResponse>>[]> = new Promise((resolve, reject) => {
        httpRequestsList.map(promise => {
          promise
            .then(r => {
              aggregated.push(r)
              if (aggregated.length >= 3) {
                resolve(aggregated.slice(0, 3))
              }
            })
            .catch(() => {
              if (error > 2) {
                reject('signature request fail')
              } else {
                error++
              }
            })
        })
      })

      const resList: AxiosResponse<ResponseType<SignatureResponse>>[] = await requestList
      const signsList = resList.map(({ data: { data: response, code } }) => {
        if (code === 500) {
          return
        }
        return [response.signatory, response.signV, response.signR, response.signS]
      })
      if (signsList.length !== 3) {
        showModal(<MessageBox type="error">Signature request failed</MessageBox>)
        return
      }

      setwithdrawModalOpen(false)
      const res = resList[0].data.data
      const r: any = await withdraw(
        {
          fromChainId: res.fromChainId,
          toAddress: res.to,
          nonce: res.nonce,
          name: res.name,
          symbol: res.symbol,
          mainChainId: res.mainChainId,
          nftAddress: res.nft,
          tokenId: res.tokenId,
          tokenURI: res.tokenURI,
          signatures: signsList
        },
        {
          // gasLimit: 3500000,
          value: recvFee
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
      showModal(
        <MessageBox type="error" header="Withdraw Failed">
          {(e as any)?.error?.message || (e as Error).message}
        </MessageBox>
      )
      setWithdrawing(false)
      return console.error(e)
    }
  }, [
    account,
    addTransaction,
    depositTxn?.deposit?.fromChain,
    depositTxn?.deposit?.nonce,
    depositTxn?.deposit?.toChain,
    depositTxn?.hash,
    fromChain,
    hideModal,
    library,
    recvFee,
    showModal,
    toChain,
    token,
    withdraw
  ])

  const handleDeposit = useCallback(() => {
    if (!token || !toChain || !fromChain || !sendFee) return
    showModal(<TransacitonPendingModal />)
    deposit(token?.contractAddress ?? '', toChain?.id ?? 1, account ?? '', token.tokenId, {
      // gasLimit: 3500000,
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
      showModal(<SwapSuccessModal hash={withdrawTxn.receipt.transactionHash} />)
    }
    if (withdrawTxn?.receipt?.status === 0) {
      setWithdrawed(false)
      setWithdrawing(false)
    }
  }, [showModal, withdrawTxn])

  useEffect(() => {
    if (!token) return setError('Please import token')
    if (!account) return setError('Please connect wallet')
    if (!tokenAddress) return setError('Enter token contract address')
    if (tokenAddress && !tokenId) return setError('Enter token ID')
    if (tokenAddress && tokenId && (!fromChain || !toChain)) return setError('Select Chain')
    setError('')
  }, [account, fromChain, toChain, token, tokenAddress, tokenId])

  useEffect(() => {
    token?.chainId && setFromChain(ChainListMap[token?.chainId])
    depositTxn?.deposit?.fromChain && setFromChain(ChainListMap[depositTxn.deposit.fromChain])
    depositTxn?.deposit?.toChain && setToChain(ChainListMap[depositTxn.deposit.toChain])
  }, [depositTxn?.deposit?.fromChain, depositTxn?.deposit?.toChain, history, token])

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
          depositTxn?.deposit?.from && account && depositTxn?.deposit?.from?.toLowerCase() !== account?.toLowerCase()
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
            to {toChain?.name || 'BSC'} to complete token swap.
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
        <OutlinedCard color="rgba(22, 22, 22, 0.1)" style={{ overflow: 'hidden' }}>
          <Box display="flex" width="100%" justifyContent="flex-start" height="100px" gap="20px" alignItems="center">
            <Image
              src={tokenUri ? tokenUri : NFTPlaceholder}
              style={{ width: 100, borderRadius: 10 }}
              altSrc={NFTPlaceholder}
            />
            <Box display="grid" gap="14px">
              <Typography sx={{ color: '#16161660' }} fontWeight={500}>
                {token?.name ?? '-'}
              </Typography>
              <Box display="flex" gap="20">
                <Typography sx={{ color: '#16161660' }}>{token?.contractAddress ?? '-'}</Typography>
                <Typography ml={20} sx={{ color: '#16161660' }}>
                  {token?.tokenId ? '#' + token.tokenId : '-'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </OutlinedCard>
      </WithdrawConfirmationModal>
    ),
    [
      account,
      chainId,
      depositTxn?.deposit?.from,
      fromChain,
      handleWithdraw,
      hideModal,
      library,
      showModal,
      toChain,
      token?.contractAddress,
      token?.name,
      token?.tokenId,
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
        <Box display="grid" gap="28px" justifyItems="center">
          <Typography variant="h6">Confirm Deposit</Typography>
          <Box width="218px">
            <NFTCard nft={token ?? emptyNft} />
          </Box>
        </Box>
      </DepositConfirmationModal>
    ),
    [account, fromChain, handleDeposit, toChain, token]
  )

  return (
    <>
      <WithdrawModal />
      <Grid container display="flex" maxWidth="1192px" width="100%" spacing={'24'} justifyContent="center">
        <Grid item xs={12} md={8}>
          <AppBody maxWidth="unset" width="100%" onReturnClick={handleReturnClick} closeIcon>
            <Box display="grid" gap="29px" padding="20px 40px 52px" width="100%">
              <Typography variant="h5">NFT Bridge</Typography>

              <Box display="grid" gap="24px" maxWidth={'unset'} flexGrow={1}>
                <Input
                  value={tokenAddress}
                  label="Token Contract Address (ERC721)"
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
                {account && (
                  <Box marginBottom="10px">
                    <InputLabel>Destination</InputLabel>
                    <Box
                      sx={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        padding: 24,
                        gap: 12
                      }}
                    >
                      <StatusIcon />
                      <Typography>{isUpToSM ? account && shortenAddress(account) : account}</Typography>
                    </Box>
                  </Box>
                )}
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
                    <Box display={isUpToSM ? 'grid' : 'flex'} gap="16px">
                      <ActionButton
                        error={error}
                        onAction={() => {
                          showModal(<DepositModal />)
                        }}
                        actionText={`Deposite in ${fromChain?.symbol} Chain`}
                        disableAction={!!depositTxn}
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
                            chainId === toChain?.id
                              ? `Withdraw in ${toChain?.symbol} Chain`
                              : `Switch to ${toChain?.name}`
                          }
                          disableAction={!!withdrawTxn}
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
        </Grid>
        <Grid item xs={12} md={4}>
          <AppBody width="100%" height="100%">
            <Box display="grid" gap="29px" padding="20px 40px 52px" width="100%">
              <Typography variant="h5">NFT Information</Typography>
              <HideOnMobile>
                <Box maxWidth="280px" margin="0 auto">
                  <NFTCard nft={token ?? emptyNft} />
                </Box>
              </HideOnMobile>
              <ShowOnMobile>
                <Image
                  src={tokenUri ? tokenUri : NFTPlaceholder}
                  altSrc={NFTPlaceholder}
                  style={{
                    width: 240,
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    maxHeight: 252,
                    objectFit: 'cover'
                  }}
                />
              </ShowOnMobile>
            </Box>
          </AppBody>
        </Grid>
      </Grid>
    </>
  )
}
