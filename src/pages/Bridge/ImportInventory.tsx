import { Box, Typography } from '@material-ui/core'
import Input from 'components/Input'
import Modal from 'components/Modal'
import NFTCard from 'components/NFTCard'
import ChainSelect from 'components/Select/ChainSelect'
import { ZERO_ADDRESS } from 'constants/index'
import { NFT } from 'models/nft'
import { useState } from 'react'
import { DummyChainList } from './BridgeForm'
import { ReactComponent as Search } from 'assets/svg/search.svg'
import NFTPlaceholder from 'assets/images/nft_placeholder.png'
import { ReactComponent as ErrorIcon } from 'assets/componentsIcon/statusIcon/error_icon.svg'
import TextButton from 'components/Button/TextButton'

const DummyNFTList = [
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS,
    tokenId: '1234',
    name: 'Berserk - Red EthRanger #04 ttttttttttt',
    imgUrl: NFTPlaceholder
  },
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS,
    tokenId: '1235',
    name: 'Berserk - Red EthRanger #04 ttttttttttt',
    imgUrl: NFTPlaceholder
  },
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS,
    tokenId: '1236',
    name: 'Berserk - Red EthRanger #04 ttttttttttt',
    imgUrl: NFTPlaceholder
  },
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS,
    tokenId: '1237',
    name: 'Berserk - Red EthRanger #04 ttttttttttt',
    imgUrl: NFTPlaceholder
  },
  {
    chainId: 1,
    contractAddress: ZERO_ADDRESS,
    tokenId: '1238',
    name: 'Berserk - Red EthRanger #04 ttttttttttt',
    imgUrl: NFTPlaceholder
  }
]

export default function SelectFromInventory({
  onSelect,
  selectedToken,
  isOpen,
  onDismiss,
  onManual
}: {
  onSelect: (nft: NFT) => void
  selectedToken?: NFT
  isOpen: boolean
  onDismiss: () => void
  onManual: () => void
}) {
  const [searchStr, setSearchStr] = useState('')
  return (
    <Modal width="100%" maxWidth="800px" closeIcon customIsOpen={isOpen} customOnDismiss={onDismiss}>
      <div style={{ display: 'none' }}>
        <Box padding="20px 40px 55px" display="grid" gridGap="24px">
          <Typography variant="h6"> Select NFT</Typography>
          <Box display="flex" gridGap="16px">
            <ChainSelect selectedChain={DummyChainList[0]} chainList={[DummyChainList[0]]} width="180px" />
            <Input
              value={searchStr}
              onChange={e => setSearchStr(e.target.value)}
              maxWidth="280px"
              endAdornment={<Search />}
              placeholder={'Search'}
            />
          </Box>
          <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr" gridColumnGap="10px" gridRowGap="20px">
            {DummyNFTList.map(nft => (
              <NFTCard
                selected={selectedToken?.tokenId === nft.tokenId}
                nft={nft}
                key={nft.tokenId}
                onClick={() => {
                  onSelect(nft)
                }}
                isSmall
              />
            ))}
          </Box>
        </Box>
      </div>
      <Box padding="20px 40px 55px" display="grid" gridGap="24px" height="60vh" maxHeight="508px" justifyItems="center">
        <ErrorIcon />
        <Typography variant="h6">Oops... No data was founded</Typography>
        <Typography variant="body2" component="div">
          You can try{' '}
          <TextButton primary onClick={onManual}>
            Importing Manually
          </TextButton>
        </Typography>
      </Box>
    </Modal>
  )
}
