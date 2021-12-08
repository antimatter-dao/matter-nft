import { ReactComponent as SuccessIcon } from 'assets/componentsIcon/statusIcon/success_icon.svg'
import { ReactComponent as ErrorIcon } from 'assets/componentsIcon/statusIcon/error_icon.svg'
import { Typography, Box } from '@mui/material'
import { useActiveWeb3React } from 'hooks/'
import { ExternalLink } from 'theme/components'
import { getEtherscanLink } from 'utils'

export default function TransactionPopup({
  hash,
  success,
  summary
}: {
  hash: string
  success?: boolean
  summary?: string
}) {
  const { chainId } = useActiveWeb3React()

  return (
    <Box display="grid" gap="8px">
      <Box display="flex" alignItems="flex-start" flexWrap="nowrap">
        <div style={{ paddingRight: 16 }}>
          {success ? (
            <SuccessIcon style={{ height: 20, width: 20 }} />
          ) : (
            <ErrorIcon style={{ height: 20, width: 20 }} />
          )}
        </div>
        <Typography variant="inherit">{summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}</Typography>{' '}
      </Box>
      {chainId && (
        <ExternalLink
          underline="always"
          href={getEtherscanLink(chainId ? chainId : 1, hash, 'transaction')}
          style={{ margin: '9px 32px', color: '#ffffff' }}
        >
          View on Etherscan
        </ExternalLink>
      )}
    </Box>
  )
}
