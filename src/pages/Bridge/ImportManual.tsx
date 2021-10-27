import { useState, useEffect } from 'react'
import { Box, Typography } from '@material-ui/core'
import Input from 'components/Input'
import InputLabel from 'components/Input/InputLabel'
import Modal from 'components/Modal'
import ChainSelect from 'components/Select/ChainSelect'
import { ChainList, ChainListMap } from 'constants/chain'
import { useActiveWeb3React } from 'hooks'
import { NFT } from 'models/nft'
import { useNftDataCallback } from 'hooks/useNftData'
import useModal from 'hooks/useModal'
import { isAddress } from 'utils'
import MessageBox from 'components/Modal/TransactionModals/MessageBox'
import ActionButton from 'components/Button/ActionButton'

export default function ImportManual({
  onImport,
  isOpen,
  onDismiss,
  onProceed
}: {
  onImport: (nft: NFT) => void
  isOpen: boolean
  onDismiss: () => void
  onProceed: () => void
}) {
  const { showModal } = useModal()
  const { chainId } = useActiveWeb3React()
  const [contractAddress, setContractAddress] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [error, setError] = useState('')

  const [nftRes, nftDataCallback] = useNftDataCallback()

  useEffect(() => {
    if (!nftRes) return
    if (nftRes.error) {
      showModal(<ImportFailedModal />)
      return
    }
    if (nftRes.loading) {
      return
    }
    if (nftRes?.nft?.name === undefined || nftRes?.nft?.owner === undefined) return
    onImport(nftRes.nft)
    onProceed()
  }, [nftRes, onDismiss, onImport, onProceed, showModal])

  useEffect(() => {
    if (contractAddress === '') return setError('Enter token contract address')
    isAddress(contractAddress) ? setError('') : setError('Invalid contract address')
    if (tokenId === '') return setError('Enter token ID')
  }, [contractAddress, tokenId])

  return (
    <Modal maxWidth="520px" width="100%" customIsOpen={isOpen} customOnDismiss={onDismiss} closeIcon>
      <Box display="grid" gridGap="24px" padding="40px">
        <Typography variant="h5">Import Manually</Typography>
        <div>
          <InputLabel>Select Chain</InputLabel>
          <ChainSelect selectedChain={chainId ? ChainListMap[chainId] : null} disabled chainList={ChainList} />
        </div>
        <Input
          label="Token Contact Address"
          value={contractAddress}
          onChange={e => setContractAddress(e.target.value)}
        />
        <Input label="Token ID" value={tokenId} onChange={e => setTokenId(e.target.value)} />
        <ActionButton
          pending={nftRes.loading}
          pendingText={'Importing'}
          actionText="Import"
          error={error}
          onAction={() => {
            nftDataCallback(contractAddress, tokenId)
          }}
        />
      </Box>
    </Modal>
  )
}

function ImportFailedModal() {
  return (
    <MessageBox type="failure" header="Import Failed">
      <Typography variant="body2">Can&apos;t find your token contract address? Read guide</Typography>
    </MessageBox>
  )
}
