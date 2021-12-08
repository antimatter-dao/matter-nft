import { Box, Typography, Button } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import clsx from 'clsx'
import { OutlinedCard } from 'components/Card'
import Image from 'components/Image'
import { NFT } from 'models/nft'
import NFTPlaceholder from 'assets/images/nft_placeholder.png'
import { shortenAddress } from 'utils'
import Copy from 'components/essential/Copy'

const useStyles = makeStyles(theme => ({
  imgWrapper: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      display: 'block',
      paddingTop: '100%'
    }
  },
  img: {
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
    <Button
      variant="text"
      component="div"
      onClick={onClick}
      style={{ width: '100%' }}
      className={clsx(isBorderHover && classes.borderHover, isBgHover && classes.bgHover)}
    >
      <OutlinedCard style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
        <Box display="grid">
          <div className={classes.imgWrapper} style={{ opacity: selected ? 0.5 : 1 }}>
            {hoverChildren}
            <Image src={nft.tokenUri || NFTPlaceholder} className={classes.img} />
          </div>

          <Box display="grid" padding="16px" gap="8px">
            <Typography
              fontWeight={isSmall ? 400 : 500}
              fontSize={isSmall ? 14 : 16}
              textAlign="left"
              style={{ width: '100%', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
            >
              {nft.name}
            </Typography>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" component="div" style={{ display: 'flex' }}>
                {shortenAddress(nft.contractAddress)} {!isSmall && <Copy toCopy={nft.contractAddress} />}
              </Typography>
              <Typography variant="body2">{nft.tokenId}</Typography>
            </Box>
          </Box>
        </Box>
      </OutlinedCard>
    </Button>
  )
}
