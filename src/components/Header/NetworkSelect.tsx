import { MenuItem, makeStyles } from '@material-ui/core'
import SelectedIcon from 'assets/componentsIcon/selected_icon.svg'
import LogoText from 'components/LogoText'
import Select from 'components/Select/Select'
import { useActiveWeb3React } from 'hooks'
import { ChainId, ChainList, SUPPORTED_NETWORKS } from 'constants/chain'

const useStyles = makeStyles({
  menuItem: {
    '&::before': {
      content: '""',
      width: 30,
      height: 20,
      display: 'flex',
      justifyContent: 'center'
    },
    '&.Mui-selected::before': {
      content: `url(${SelectedIcon})`,
      width: 30,
      height: 20,
      display: 'flex',
      justifyContent: 'center'
    }
  }
})

export default function NetworkSelect() {
  const { chainId, account, library } = useActiveWeb3React()
  const classes = useStyles()

  return (
    <div style={{ width: 180 }}>
      <Select defaultValue={chainId} value={(chainId as unknown) as string} width="100%">
        {ChainList.map(option => (
          <MenuItem
            className={classes.menuItem}
            onClick={() => {
              if ([ChainId.MAINNET, ChainId.ROPSTEN, ChainId.RINKEBY, ChainId.KOVAN].includes(option.id)) {
                library?.send('wallet_switchEthereumChain', [
                  { chainId: SUPPORTED_NETWORKS[option.id as ChainId]?.chainId },
                  account
                ])
              } else {
                const params = SUPPORTED_NETWORKS[option.id as ChainId]
                library?.send('wallet_addEthereumChain', [params, account])
              }
            }}
            value={option.id}
            key={option.id}
            selected={chainId === option.id}
          >
            <LogoText logo={option.logo} text={option.symbol} gapSize={'small'} fontSize={14} />
          </MenuItem>
        ))}
      </Select>
    </div>
  )
}
