import { Box, Typography, makeStyles } from '@material-ui/core'
import { Text } from 'rebass'
import { OutlinedCard } from 'components/Card'
import Image from 'components/Image'
import { NFT } from 'models/nft'
import NFTPlaceholder from 'assets/images/nft_placeholder.png'
import { shortenAddress } from 'utils'
import TextButton from 'components/Button/TextButton'
import Copy from 'components/Copy'
import { ReactComponent as Check } from 'assets/componentsIcon/statusIcon/success_icon.svg'

const useStyles = makeStyles(() => ({
  box: {
    position: 'relative',
    width: '100%',
    '&::before': {
      content: '""',
      display: 'block',
      paddingTop: '100%'
    }
  },
  content: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  selected: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 2
  }
}))

export default function NFTCard({
  nft,
  onClick,
  isSmall,
  selected
}: {
  nft: NFT
  onClick: () => void
  isSmall?: boolean
  selected?: boolean
}) {
  const classes = useStyles()

  return (
    <TextButton onClick={onClick} style={{ width: '100%' }}>
      <OutlinedCard style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
        <Box display="grid">
          {selected && <Check className={classes.selected} />}
          <div className={classes.box} style={{ opacity: selected ? 0.5 : 1 }}>
            <Image src={nft.imgUrl || NFTPlaceholder} className={classes.content} />
          </div>

          <Box display="grid" padding="16px" gridGap="8px">
            <Text
              fontWeight={isSmall ? 400 : 500}
              fontSize={isSmall ? 14 : 16}
              style={{ width: '100%', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
            >
              {nft.name}
            </Text>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" component="div">
                {shortenAddress(nft.contractAddress)} {!isSmall && <Copy toCopy={nft.contractAddress} />}
              </Typography>
              <Typography variant="body2">{nft.tokenId}</Typography>
            </Box>
          </Box>
        </Box>
      </OutlinedCard>
    </TextButton>
  )
}
