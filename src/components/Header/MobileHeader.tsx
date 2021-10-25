import { NavLink } from 'react-router-dom'
import { Box, makeStyles, AppBar } from '@material-ui/core'
import ChainSwap from '../../assets/svg/chain_swap.svg'
import { ShowOnMobile } from 'theme/muiTheme'
import Image from 'components/Image'

const useMobileStyle = makeStyles(theme => ({
  root: {
    position: 'relative',
    height: theme.height.mobileHeader,
    backgroundColor: theme.palette.background.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: 'none',
    padding: '28px 24px'
  },
  mainLogo: {
    '& img': {
      width: 136,
      height: 34.7
    },
    '&:hover': {
      cursor: 'pointer'
    }
  }
}))

export default function MobileHeader() {
  const classes = useMobileStyle()

  return (
    <>
      <ShowOnMobile>
        <AppBar className={classes.root}>
          <Box display="flex" alignItems="center">
            <NavLink id={'chainswap'} to={'/'} className={classes.mainLogo}>
              <Image src={ChainSwap} alt={'chainswap'} />
            </NavLink>
          </Box>
        </AppBar>
      </ShowOnMobile>
    </>
  )
}
