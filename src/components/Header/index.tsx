import { NavLink } from 'react-router-dom'
import { AppBar, Box, makeStyles, styled } from '@material-ui/core'
import Web3Status from './Web3Status'
import { HideOnMobile } from 'theme/muiTheme'
import Image from 'components/Image'
import ChainSwap from '../../assets/svg/chain_swap.svg'
import MobileHeader from './MobileHeader'
import { Check, ChevronDown } from 'react-feather'
import { ChainList, ChainListMap } from 'constants/chain'
import { useActiveWeb3React } from 'hooks'
import { triggerSwitchChain } from 'utils/triggerSwitchChain'

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
  height: 36,
  padding: '5px 15px',
  cursor: 'pointer',
  '& .dropdown_wrapper': {
    display: 'none'
  },
  '& img, & svg': {
    width: 20,
    height: 20
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
          {account && chainId && ChainListMap[chainId] && (
            <NetworkCard>
              <span>
                {ChainListMap[chainId].icon}
                {ChainListMap[chainId].symbol}
              </span>
              <ChevronDown size="18" />
              <div className="dropdown_wrapper">
                <Dropdown>
                  {ChainList.map(chain => (
                    <div
                      key={chain.symbol}
                      onClick={() => {
                        triggerSwitchChain(library, chain.id, account)
                      }}
                    >
                      {chain.id === chainId && (
                        <span style={{ position: 'absolute', left: '15px' }}>
                          <Check size={18} />
                        </span>
                      )}
                      {chain.icon ?? chain.icon}
                      {chain.symbol}
                    </div>
                  ))}
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
