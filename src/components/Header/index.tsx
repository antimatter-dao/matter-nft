import { NavLink } from 'react-router-dom'
import { AppBar, Box, makeStyles, styled } from '@material-ui/core'
import Web3Status from './Web3Status'
import { HideOnMobile } from 'theme/muiTheme'
import Image from 'components/Image'
import ChainSwap from '../../assets/svg/chain_swap.svg'
import MobileHeader from './MobileHeader'
import { Check, ChevronDown } from 'react-feather'
import { ChainId } from 'constants/chain'
import { ReactComponent as ETH } from '../../assets/svg/eth_logo.svg'
import { useActiveWeb3React } from 'hooks'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    height: theme.height.header,
    backgroundColor: theme.palette.background.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: 'none',
    padding: '0 60px 00 40px',
    border: '1px solid rgba(255,255,255,0.1)',
    [theme.breakpoints.down('sm')]: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      top: 'unset',
      borderTop: '1px solid ' + theme.bgColor.bg4,
      justifyContent: 'center'
    }
  },
  actionButton: {
    [theme.breakpoints.down('sm')]: {
      maxWidth: 320,
      width: '100%',
      borderRadius: 49,
      height: 40
    }
  },
  mainLogo: {
    '& img': {
      width: 180.8,
      height: 34.7
    },
    '&:hover': {
      cursor: 'pointer'
    }
  }
}))
const NetworkCard = styled('div')({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 500,
  fontSize: 14,
  marginRight: 20,
  position: 'relative',
  color: 'rgba(255,255,255,0.5)',
  // backgroundColor: 'rgba(255, 255, 255, 0.1)',
  // borderRadius: 32,
  height: 36,
  padding: '5px 15px',
  cursor: 'pointer',
  '& .dropdown_wrapper': {
    display: 'none'
  },
  '&>span': {
    marginRight: 6,
    display: 'flex',
    alignItems: 'center',
    '&>img, &>svg': {
      marginRight: 5
    }
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 32,
    '& .dropdown_wrapper': {
      display: 'block',
      top: '100%',
      left: '-20px',
      height: '10px',
      position: 'absolute',
      width: '172px',
      '&>div': {
        height: 'auto',
        marginTop: '10px'
      }
    }
  }
})

const Dropdown = styled('div')({
  zIndex: 10,
  height: 0,
  position: 'absolute',
  borderRadius: 10,
  overflow: 'hidden',
  display: 'flex',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  background: '#1C1C1C',
  flexDirection: 'column',
  width: 172,
  '&>div': {
    color: '#ffffff',
    textDecoration: 'none',
    padding: '14px 17px 14px 40px',
    transition: '0.5s',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    '&>*': {
      marginRight: 5
    },
    '&:last-child': {
      border: 'none'
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  }
})

const NetworkInfo: {
  [key: number]: { title: string; color: string; icon: JSX.Element; link?: string; selectedIcon?: JSX.Element }
} = {
  // [ChainId.MAINNET]: {
  //   color: '#FFFFFF',
  //   icon: <ETH />,
  //   title: 'ETH'
  // },
  [ChainId.ROPSTEN]: {
    color: '#FFFFFF',
    icon: <ETH />,
    title: 'Ropsten'
  },
  [ChainId.RINKEBY]: {
    color: '#FFFFFF',
    icon: <ETH />,
    title: 'Rinkeby'
  }
}

export const SUPPORTED_NETWORKS: {
  [chainId in ChainId]?: {
    chainId: string
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
} = {
  [ChainId.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3'],
    blockExplorerUrls: ['https://etherscan.com']
  },
  [ChainId.ROPSTEN]: {
    chainId: '0x3',
    chainName: 'Ropsten',
    nativeCurrency: {
      name: 'Ropsten',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://ropsten.infura.io/v3/'],
    blockExplorerUrls: ['https://ropsten.etherscan.io/']
  },
  [ChainId.RINKEBY]: {
    chainId: '0x4',
    chainName: 'Rinkeby',
    nativeCurrency: {
      name: 'Rinkeby',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rinkeby.infura.io/v3/'],
    blockExplorerUrls: ['https://rinkeby.etherscan.io/']
  }
}

export default function Header() {
  const { account, chainId, library } = useActiveWeb3React()
  const classes = useStyles()
  return (
    <>
      <MobileHeader />
      <AppBar className={classes.root}>
        <HideOnMobile>
          <Box display="flex" alignItems="center">
            <NavLink id={'chainswap'} to={'/'} className={classes.mainLogo}>
              <Image src={ChainSwap} alt={'chainswap'} />
            </NavLink>
          </Box>
        </HideOnMobile>
        <Box display="flex" alignItems="center">
          {account && chainId && NetworkInfo[chainId] && (
            <NetworkCard>
              <span>
                {NetworkInfo[chainId].selectedIcon ? NetworkInfo[chainId].selectedIcon : NetworkInfo[chainId].icon}
                {NetworkInfo[chainId].title}
              </span>
              <ChevronDown size="18" />
              <div className="dropdown_wrapper">
                <Dropdown>
                  {Object.keys(NetworkInfo).map(key => {
                    const info = NetworkInfo[parseInt(key) as keyof typeof NetworkInfo]
                    if (!info) {
                      return null
                    }
                    return info.link ? (
                      <div>
                        {parseInt(key) === chainId && (
                          <span style={{ position: 'absolute', left: '15px' }}>
                            <Check size={18} />
                          </span>
                        )}
                        {info.icon ?? info.icon}
                        {info.title}
                      </div>
                    ) : (
                      <div
                        key={info.title}
                        onClick={() => {
                          if (parseInt(key) === ChainId.MAINNET) {
                            library?.send('wallet_switchEthereumChain', [{ chainId: '0x1' }, account])
                          } else if (parseInt(key) === ChainId.ROPSTEN) {
                            library?.send('wallet_switchEthereumChain', [{ chainId: '0x3' }, account])
                          } else if (parseInt(key) === ChainId.RINKEBY) {
                            library?.send('wallet_switchEthereumChain', [{ chainId: '0x4' }, account])
                          } else {
                            const params = SUPPORTED_NETWORKS[parseInt(key) as ChainId]
                            library?.send('wallet_addEthereumChain', [params, account])
                          }
                        }}
                      >
                        {parseInt(key) === chainId && (
                          <span style={{ position: 'absolute', left: '15px' }}>
                            <Check size={18} />
                          </span>
                        )}
                        {info.icon ?? info.icon}
                        {info.title}
                      </div>
                    )
                  })}
                </Dropdown>
              </div>
            </NetworkCard>
          )}
          <Web3Status />
        </Box>
      </AppBar>
    </>
  )
}
