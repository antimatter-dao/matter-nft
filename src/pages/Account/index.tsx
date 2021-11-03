import { Box, makeStyles, Typography } from '@material-ui/core'
import Button from 'components/Button/Button'
import { ReactComponent as UcenterIcon } from 'assets/svg/ucenter.svg'
import { useActiveWeb3React } from 'hooks'
import { shortenAddress } from 'utils'
import TextButton from 'components/Button/TextButton'
import Copy from 'components/Copy'
import { useHistory } from 'react-router'
import { SwitchTabWrapper, Tab } from 'components/SwitchTab'
import { useParams } from 'react-router-dom'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import NetworkSelect from 'components/Header/NetworkSelect'
import ImportManual from 'pages/Home/ImportManual'
import { NFT } from 'models/nft'
import NFTCard from 'components/NFTCard'
import { ZERO_ADDRESS } from '../../constants'
import NFTPlaceholder from 'assets/images/nft_placeholder.png'
import PaginationView from 'components/Pagination'
import OutlineButton from 'components/Button/OutlineButton'
import TableView from 'components/Table'
import { ActivityItemProp, useMyActivity } from '../../hooks/useAccount'
import Spinner from 'components/Spinner'
import { ChainListMap } from 'constants/chain'
import { useNftBaseData } from 'hooks/useNftData'
import { ReactComponent as ReceiveIcon } from 'assets/svg/receive_icon.svg'
import { ReactComponent as SendIcon } from 'assets/svg/send_icon.svg'
import { useNFTImageByUri } from 'hooks/useNFTImage'
import Image from 'components/Image'
import { SwapContext } from 'context/SwapContext'
import { routes } from 'constants/routes'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    width: '100%',
    maxWidth: 1248,
    padding: '0 24px',
    minHeight: `calc(100vh - ${theme.height.header} - ${theme.height.footer})`,
    boxSizing: 'border-box',
    overflow: 'auto',
    [theme.breakpoints.down('sm')]: {
      maxWidth: 'unset'
    }
  },
  name: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    width: 160,
    height: 40,
    display: 'grid',
    padding: '0 20px',
    gridTemplateColumns: '1fr 20px',
    alignContent: 'center',
    justifyContent: 'center'
  },
  cardHover: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    opacity: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    transition: 'opacity 0.6s',
    '&:hover': {
      opacity: 1
    }
  },
  cardButton: {
    backgroundColor: '#fff',
    color: '#000',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: '#ddd'
    }
  }
}))

// const SwitchTabWrapper = styled('div')(({ theme }) => ({
//   borderBottom: '1px solid rgb(255,255,255, 0.1)',
//   whiteSpace: 'nowrap'
// }))
//   border-bottom: 1px solid ${({ theme, isWhite }) => (isWhite ? theme.text5 : theme.text2)};
//   white-space: nowrap;
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     border-color:${theme.text5};
//     overflow-x: auto;
//     overflow-y: hidden;
//     `};
// `

export enum UserInfoTabs {
  INVENTORY = 'Inventory',
  ACTIVITY = 'Activity'
}
export const UserInfoTabRoute = {
  [UserInfoTabs.INVENTORY]: 'Inventory',
  [UserInfoTabs.ACTIVITY]: 'Activity'
}

const DummyNFTList = [
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS,
    mainAddress: ZERO_ADDRESS,
    tokenId: '1234',
    name: 'Berserk - Red EthRanger #04 ttttttttttt',
    tokenUri: NFTPlaceholder
  },
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS,
    mainAddress: ZERO_ADDRESS,
    tokenId: '1235',
    name: 'Berserk - Red EthRanger #04 ttttttttttt',
    tokenUri: NFTPlaceholder
  },
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS,
    mainAddress: ZERO_ADDRESS,
    tokenId: '1236',
    name: 'Berserk - Red EthRanger #04 ttttttttttt',
    tokenUri: NFTPlaceholder
  },
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS,
    mainAddress: ZERO_ADDRESS,
    tokenId: '1237',
    name: 'Berserk - Red EthRanger #04 ttttttttttt',
    tokenUri: NFTPlaceholder
  },
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS,
    mainAddress: ZERO_ADDRESS,
    tokenId: '1238',
    name: 'Berserk - Red EthRanger #04 ttttttttttt',
    tokenUri: NFTPlaceholder
  }
]

export enum AccountEventType {
  ALL = 'All',
  SEND = 'Send',
  RECEIVE = 'Receive'
}
export enum AccountActivityRecvStatus {
  UNKNOWN,
  NORECV,
  RECVD
}

function SwitchTab({
  currentTab,
  onTabClick
}: {
  currentTab: UserInfoTabs
  onTabClick: (tab: UserInfoTabs) => () => void
}) {
  return (
    <SwitchTabWrapper>
      {Object.keys(UserInfoTabRoute).map(tab => {
        const tabName = UserInfoTabRoute[tab as keyof typeof UserInfoTabRoute]
        return (
          <Tab key={tab} onClick={onTabClick(tab as UserInfoTabs)} selected={currentTab === tab}>
            {tabName}
          </Tab>
        )
      })}
    </SwitchTabWrapper>
  )
}

function AccountNFTCardChild() {
  const classes = useStyles()
  return (
    <Box width="100%" position="absolute" className={classes.cardHover}>
      <Box width="100%" height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Button width="70%" height="20%" classname={classes.cardButton} style={{ marginBottom: '5%' }}>
          Bridge
        </Button>
        <Button width="70%" height="20%" classname={classes.cardButton} onClick={() => alert('Transfer')}>
          Transfer
        </Button>
      </Box>
    </Box>
  )
}

function ShowNFTName({ data }: { data: ActivityItemProp }) {
  const chain = data.type === AccountEventType.SEND ? data.fromChainId : data.toChainId
  const nft = useNftBaseData(chain, data.contract, data.tokenId.toString())
  const tokenUri = useNFTImageByUri(nft?.tokenUri)
  return (
    <Box display="flex" alignItems="center" gridColumnGap="5px">
      <Image src={tokenUri || NFTPlaceholder} alt="" altSrc={NFTPlaceholder} style={{ width: 48, height: 48 }} />
      {nft?.name || '--'}
    </Box>
  )
}

export default function Account() {
  const { account } = useActiveWeb3React()
  const classes = useStyles()
  const history = useHistory()
  const { tab } = useParams<{ tab: string }>()
  const [currentTab, setCurrentTab] = useState(UserInfoTabs.INVENTORY)
  const [showManual, setShowManual] = useState(false)
  const [currentEventType, setCurrentEventType] = useState(AccountEventType.ALL)
  const { setSelectedToken, importDeposit } = useContext(SwapContext)

  useEffect(() => {
    if (!account) history.replace('/')
  }, [account, history])

  const handleTabClick = useCallback(
    tab => () => {
      setCurrentTab(tab)
      history.push('/profile/' + tab)
    },
    [history]
  )
  useEffect(() => {
    if (tab && UserInfoTabRoute[tab as keyof typeof UserInfoTabRoute]) {
      setCurrentTab(tab as UserInfoTabs)
    }
  }, [tab])

  const { page: myActivityPage, data: myActivityList, loading: myActivityLoading } = useMyActivity(currentEventType)
  const myActivityListRows = useMemo(() => {
    return myActivityList.map(item => [
      <>
        {item.type === AccountEventType.RECEIVE ? <ReceiveIcon /> : <SendIcon />}
        {item.type}
      </>,
      <ShowNFTName key={0} data={item} />,
      1,
      <Box display="flex" alignItems="center" key="3">
        {ChainListMap[item.fromChainId]?.icon}
        {ChainListMap[item.fromChainId]?.name}
      </Box>,
      <Box display="flex" alignItems="center" key="4">
        {ChainListMap[item.toChainId]?.icon}
        {ChainListMap[item.toChainId]?.name}
      </Box>,
      new Date(item.timestamp * 1000).toLocaleString('en'),
      item.status === AccountActivityRecvStatus.NORECV ? (
        <Button
          key="5"
          onClick={() => {
            importDeposit(item)
            history.push(routes.bridge)
          }}
        >
          Withdraw{item.tokenId}
        </Button>
      ) : (
        <></>
      )
    ])
  }, [myActivityList, importDeposit, history])

  return (
    <div className={classes.root}>
      <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: 60 }}>
        <Box display="flex" alignContent={'center'}>
          <UcenterIcon width={60} height={60} style={{ marginRight: 20 }} />
          {account && (
            <Box display="flex" flexDirection="column" justifyContent="space-around">
              <Typography variant="body2" style={{ opacity: '0.5' }}>
                Connect with Metamask
              </Typography>
              <Box display="flex" className={classes.name}>
                <TextButton fontSize={14}>{shortenAddress(account)}</TextButton>
                {account && <Copy toCopy={account}></Copy>}
              </Box>
            </Box>
          )}
        </Box>

        <Button width={'170px'} height={'48px'} onClick={() => history.replace(routes.home)}>
          Back to Bridge
        </Button>
      </Box>

      <Box display="grid" gridGap="30px">
        <SwitchTab onTabClick={handleTabClick} currentTab={currentTab} />

        {currentTab === UserInfoTabs.INVENTORY && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <NetworkSelect />
              <TextButton fontSize={16} fontWeight={500} onClick={() => setShowManual(true)}>
                + Import Manually
              </TextButton>
            </Box>
            <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr" gridColumnGap="27px" gridRowGap="36px">
              {DummyNFTList.map(nft => (
                <NFTCard nft={nft} key={nft.tokenId} hoverChildren={<AccountNFTCardChild />} />
              ))}
            </Box>

            <Box display="flex" flexDirection="row-reverse">
              <PaginationView count={20} page={6} onChange={() => {}} setPage={() => {}} />
            </Box>
          </>
        )}

        {currentTab === UserInfoTabs.ACTIVITY && (
          <>
            <Box display="flex" gridGap="20px" flexWrap="wrap">
              {Object.values(AccountEventType).map(item =>
                currentEventType === item ? (
                  <Button key={item} width="120px" height="48px">
                    {item}
                  </Button>
                ) : (
                  <OutlineButton key={item} width="120px" height="48px" onClick={() => setCurrentEventType(item)}>
                    {item}
                  </OutlineButton>
                )
              )}
            </Box>
            <TableView
              header={['Event', 'Item', 'Quantity', 'From', 'To', 'Date', 'operate']}
              rows={myActivityListRows}
              isHeaderGray
            />
            {myActivityLoading && (
              <Box display="flex" justifyContent="center">
                <Spinner size="40px" />
              </Box>
            )}
            <Box display="flex" flexDirection="row-reverse">
              <PaginationView
                count={myActivityPage.totalPages}
                page={myActivityPage.currentPage}
                onChange={() => {}}
                setPage={myActivityPage.setCurrentPage}
              />
            </Box>
          </>
        )}
      </Box>

      <ImportManual
        isOpen={showManual}
        onImport={(nft: NFT) => {
          console.log(nft)
          setSelectedToken(nft)
        }}
        onProceed={() => {
          history.push(routes.bridge)
        }}
        onDismiss={() => {
          setShowManual(false)
        }}
      />
    </div>
  )
}
