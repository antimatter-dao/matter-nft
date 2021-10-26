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
import useModal from 'hooks/useModal'
import Button from 'components/Button/Button'

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
  const { showModal, hideModal } = useModal()

  return (
    <Modal width="100%" maxWidth="800px" closeIcon customIsOpen={isOpen} customOnDismiss={onDismiss}>
      {DummyNFTList.length > 0 ? (
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
                isBorderHover
                onClick={() => {
                  showModal(
                    <ConfirmSelectModal
                      nft={nft}
                      onConfirm={() => {
                        onSelect(nft)
                        hideModal()
                      }}
                    />
                  )
                }}
                isSmall
              />
            ))}
          </Box>
        </Box>
      ) : (
        <Box
          padding="20px 40px 55px"
          display="grid"
          height="60vh"
          maxHeight="508px"
          justifyItems="center"
          alignContent="space-between"
        >
          <Typography variant="h5" style={{ width: '100%' }}>
            Select NFT
          </Typography>
          <Box display="grid" gridGap="24px" justifyItems="center">
            <ErrorIcon style={{ fill: '#ffffff' }} />
            <Typography variant="h6" style={{ marginTop: -10 }}>
              Oops... No data was founded
            </Typography>
            <Typography variant="body2" component="div">
              You can try&nbsp;
              <TextButton primary onClick={onManual} fontSize={14}>
                Importing Manually
              </TextButton>
            </Typography>
          </Box>
          <div style={{ height: 50 }} />
        </Box>
      )}
    </Modal>
  )
}

function ConfirmSelectModal({ onConfirm, nft }: { onConfirm: () => void; nft: NFT }) {
  return (
    <Modal closeIcon>
      <Box padding="40px" display="grid" gridGap="24px" width="100%" justifyItems="center">
        <Typography variant="h6">Select NFT</Typography>
        <Box maxWidth="160px">
          <NFTCard nft={nft} key={nft.tokenId} isSmall />
        </Box>
        <Button onClick={onConfirm}>Confirm</Button>
      </Box>
    </Modal>
  )
}
