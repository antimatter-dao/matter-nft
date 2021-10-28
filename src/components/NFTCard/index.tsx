import { Box, Typography, makeStyles } from '@material-ui/core'
import { Text } from 'rebass'
import clsx from 'clsx'
import { OutlinedCard } from 'components/Card'
import Image from 'components/Image'
import { NFT } from 'models/nft'
import NFTPlaceholder from 'assets/images/nft_placeholder.png'
import { shortenAddress } from 'utils'
import TextButton from 'components/Button/TextButton'
import Copy from 'components/Copy'

const useStyles = makeStyles(theme => ({
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
  },
  borderHover: {
    '&:hover': {
      position: 'relative',
      '&:after': {
        position: 'absolute',
        top: -1,
        left: -1,
        content: '""',
        width: 'calc(100% + 2px)',
        height: 'calc(100% + 2px)',
        border: '2px solid ' + theme.palette.primary.main,
        borderRadius: theme.shape.borderRadius
      }
    }
  },
  bgHover: {
    overflow: 'hidden'
  }
}))

export default function NFTCard({
  nft,
  onClick,
  isSmall,
  selected,
  isBorderHover,
  isBgHover,
  hoverChildren
}: {
  nft: NFT
  onClick?: () => void
  isSmall?: boolean
  selected?: boolean
  isBorderHover?: boolean
  isBgHover?: boolean
  hoverChildren?: JSX.Element
}) {
  const classes = useStyles()

  return (
    <TextButton
      onClick={onClick}
      style={{ width: '100%' }}
      classname={clsx(isBorderHover && classes.borderHover, isBgHover && classes.bgHover)}
    >
      <OutlinedCard style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
        <Box display="grid">
          <div className={classes.box} style={{ opacity: selected ? 0.5 : 1 }}>
            {hoverChildren}
            <Image src={nft.tokenUri || NFTPlaceholder} className={classes.content} />
          </div>

          <Box display="grid" padding="16px" gridGap="8px">
            <Text
              fontWeight={isSmall ? 400 : 500}
              fontSize={isSmall ? 14 : 16}
              textAlign="left"
              style={{ width: '100%', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
            >
              {nft.name}
            </Text>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" component="div" style={{ display: 'flex' }}>
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
