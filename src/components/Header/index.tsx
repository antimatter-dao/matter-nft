import { NavLink } from 'react-router-dom'
import { AppBar, Box, makeStyles } from '@material-ui/core'
import Web3Status from './Web3Status'
import { HideOnMobile } from 'theme/muiTheme'
import Image from 'components/Image'
import ChainSwap from '../../assets/svg/chain_swap.svg'
import MobileHeader from './MobileHeader'

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

export default function Header() {
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
        <Web3Status />
      </AppBar>
    </>
  )
}
