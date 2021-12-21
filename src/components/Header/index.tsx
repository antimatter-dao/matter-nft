import { NavLink } from 'react-router-dom'
import { AppBar, Box, MenuItem, styled as muiStyled, styled } from '@mui/material'
import { ExternalLink } from 'theme/components'
import Web3Status from './Web3Status'
import { HideOnMobile } from 'theme/index'
import { Check, ExpandMore } from '@mui/icons-material'
import PlainSelect from 'components/Select/PlainSelect'
import Image from 'components/Image'
import ChainSwap from '../../assets/svg/chain_swap.svg'
import MobileHeader from './MobileHeader'
import { useActiveWeb3React } from 'hooks'
import { ChainList, ChainListMap } from 'constants/chain'
import { triggerSwitchChain } from 'utils/triggerSwitchChain'
import { routes } from 'constants/routes'
import useBreakpoint from 'hooks/useBreakpoint'

interface TabContent {
  title: string
  route?: string
  link?: string
  titleContent?: JSX.Element
}

interface Tab extends TabContent {
  subTab?: TabContent[]
}

export const Tabs: Tab[] = [
  { title: 'Dashboard', link: 'https://exchange.chainswap.com/#/dashboard' },
  { title: 'Bridge Aggregator', link: 'https://exchange.chainswap.com/#/bridge' },
  { title: 'NFT Bridge', route: routes.home },
  { title: 'Statistics', link: 'https://exchange.chainswap.com/#/statistics' },
  { title: 'DAO', link: 'https://exchange.chainswap.com/#/dao' }
]

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: 'relative',
  height: theme.height.header,
  borderBottom: '1px solid #00000020',
  backgroundColor: theme.palette.background.default,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: 'none',
  padding: '0 60px 00 40px',
  zIndex: 2000,
  [theme.breakpoints.down('md')]: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    top: 'unset',
    borderTop: '1px solid ' + theme.bgColor.bg4,
    justifyContent: 'center'
  },
  '& .link': {
    textDecoration: 'none',
    fontSize: 16,
    fontWeight: 500,
    color: theme.palette.text.primary,
    opacity: 0.5,
    marginRight: 28,
    '&.active': {
      opacity: 1
    },
    '&:hover': {
      opacity: 1
    },
    [theme.breakpoints.down('md')]: {
      fontSize: 14
    }
  }
}))

const MainLogo = styled(NavLink)(({ theme }) => ({
  '& img': {
    width: 180.8,
    height: 34.7
  },
  '&:hover': {
    cursor: 'pointer'
  },
  [theme.breakpoints.between('md', 'lg')]: {
    '& img': {
      width: 100,
      height: 'auto'
    }
  }
}))

const LinksWrapper = muiStyled('div')(({ theme }) => ({
  marginLeft: 60.2,
  [theme.breakpoints.between('md', 'lg')]: {
    marginLeft: 20
  }
}))

const NetworkCard = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 500,
  fontSize: 14,
  marginRight: 20,
  position: 'relative',
  color: theme.palette.text.primary,
  border: '1px solid #000000',
  height: 44,
  borderRadius: 60,
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
}))

const Dropdown = styled('div')(({ theme }) => ({
  zIndex: 10,
  height: 0,
  position: 'absolute',
  borderRadius: 10,
  overflow: 'hidden',
  display: 'flex',
  border: '1px solid #ededed',
  background: '#FFFFFF',
  flexDirection: 'column',
  width: 172,
  '&>div': {
    color: theme.palette.text.primary,
    textDecoration: 'none',
    padding: '14px 17px 14px 40px',
    transition: '0.5s',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #ededed',
    '&>*': {
      marginRight: 5
    },
    '&:last-child': {
      border: 'none'
    },
    '&:hover': {
      backgroundColor: '#ededed'
    }
  }
}))

export default function Header() {
  const { account, chainId, library } = useActiveWeb3React()
  const isDownMd = useBreakpoint('md')

  return (
    <>
      <MobileHeader />
      <StyledAppBar>
        <HideOnMobile breakpoint="md">
          <Box display="flex" alignItems="center">
            <MainLogo id={'chainswap'} to={'/'}>
              <Image src={ChainSwap} alt={'chainswap'} />
            </MainLogo>
          </Box>
        </HideOnMobile>
        <HideOnMobile breakpoint="md">
          <LinksWrapper>
            {Tabs.map(({ title, route, subTab, link, titleContent }, idx) =>
              subTab ? (
                <PlainSelect placeholder="about" key={title + idx}>
                  {subTab.map((sub, idx) =>
                    sub.link ? (
                      <MenuItem key={sub.link + idx}>
                        <ExternalLink href={sub.link} className={'link'}>
                          {sub.titleContent ?? sub.title}
                        </ExternalLink>
                      </MenuItem>
                    ) : (
                      <MenuItem key={sub.title + idx}>
                        <NavLink to={sub.route ?? ''} className={'link'}>
                          {sub.titleContent ?? sub.title}
                        </NavLink>
                      </MenuItem>
                    )
                  )}
                </PlainSelect>
              ) : link ? (
                <ExternalLink href={link} className={'link'} key={link + idx}>
                  {titleContent ?? title}
                </ExternalLink>
              ) : (
                <NavLink key={title + idx} id={`${route}-nav-link`} to={route ?? ''} className={'link'}>
                  {titleContent ?? title}
                </NavLink>
              )
            )}
          </LinksWrapper>
        </HideOnMobile>
        <Box display="flex">
          {account && chainId && ChainListMap[chainId] && (
            <NetworkCard style={{ display: isDownMd ? 'none' : 'block' }}>
              <span>
                {ChainListMap[chainId].icon}
                {ChainListMap[chainId].symbol}
              </span>
              <ExpandMore sx={{ height: 18, width: 18 }} />
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
                          <Check sx={{ height: 18, width: 18 }} />
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
      </StyledAppBar>
    </>
  )
}
