import { Box, useTheme } from '@mui/material'
import { HideOnMobile } from 'theme/index'
import { ReactComponent as Medium } from 'assets/socialLinksIcon/medium.svg'
import { ReactComponent as Twitter } from 'assets/socialLinksIcon/twitter.svg'
import { ReactComponent as Telegram } from 'assets/socialLinksIcon/telegram.svg'
import { ExternalLink } from 'theme/components'
import TextButton from 'components/Button/TextButton'
import Divider from 'components/Divider'

export default function Footer() {
  const theme = useTheme()

  return (
    <HideOnMobile>
      <footer
        style={{
          height: theme.height.footer
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          width="100%"
          padding="9px 60px 28px"
          gap="35.56px"
          sx={{ opacity: 0.5 }}
        >
          <ExternalLink href="https://docs.chainswap.com/" underline="always">
            Chainswap Docs
          </ExternalLink>
          <Box height={16}>
            <Divider orientation="vertical" style={{ backgroundColor: 'rgba(22, 22, 22, 0.2)', width: 1 }} />
          </Box>
          <TextButton>
            <ExternalLink href="https://chain-swap.medium.com/">
              <Medium fill="black" />
            </ExternalLink>
          </TextButton>
          <TextButton>
            <ExternalLink href="https://twitter.com/chain_swap">
              <Twitter fill="black" />
            </ExternalLink>
          </TextButton>
          <TextButton>
            <ExternalLink href="https://t.me/chainswap">
              <Telegram fill="black" />
            </ExternalLink>
          </TextButton>
        </Box>
      </footer>
    </HideOnMobile>
  )
}
