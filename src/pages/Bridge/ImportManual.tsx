import { Box, Typography } from '@material-ui/core'
import Button from 'components/Button/Button'
import Input from 'components/Input'
import InputLabel from 'components/Input/InputLabel'
import Modal from 'components/Modal'
import ChainSelect from 'components/Select/ChainSelect'
import { Chain } from 'models/chain'
import { NFT } from 'models/nft'
import { useState } from 'react'
import { DummyChainList } from './BridgeForm'

export default function ImportManual({
  onImport,
  isOpen,
  onDismiss
}: {
  onImport: (nft: NFT) => void
  isOpen: boolean
  onDismiss: () => void
}) {
  const [contractAddress, setContractAddress] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [chain, setChain] = useState<Chain | null>(null)

  return (
    <Modal maxWidth="520px" width="100%" customIsOpen={isOpen} customOnDismiss={onDismiss} closeIcon>
      <Box display="grid" gridGap="24px" padding="40px">
        <Typography variant="h5">Import Manually</Typography>
        <div>
          <InputLabel>Select Chain</InputLabel>
          <ChainSelect chainList={DummyChainList} selectedChain={chain} onChange={chain => setChain(chain)} />
        </div>
        <Input
          label="Token Contact Address"
          value={contractAddress}
          onChange={e => setContractAddress(e.target.value)}
        />
        <Input label="Token ID" value={tokenId} onChange={e => setTokenId(e.target.value)} />
        <Button
          disabled={!chain || !contractAddress || !tokenId}
          onClick={() =>
            onImport({
              chainId: chain?.id ?? 1,
              contractAddress,
              tokenId,
              name: '',
              imgUrl: ''
            })
          }
        >
          Import
        </Button>
      </Box>
    </Modal>
  )
}
