import { useState, useEffect, useCallback } from 'react'
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
import { NFT_BRIDGE_ADDRESS } from 'constants/index'

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
  const { chainId, account } = useActiveWeb3React()
  const [contractAddress, setContractAddress] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [error, setError] = useState('')

  const nftRes = useNftDataCallback(contractAddress, tokenId)

  const handleImport = useCallback(() => {
    if (!nftRes) return
    if (nftRes.error) {
      showModal(<ImportFailedModal />)
      return
    }
    onImport(nftRes.nft)
    onProceed()
  }, [nftRes, onImport, onProceed, showModal])

  useEffect(() => {
    if (contractAddress === '') return setError('Enter token contract address')
    if (!isAddress(contractAddress)) return setError('Invalid contract address')
    if (tokenId === '') return setError('Enter token ID')
    if (nftRes?.nft?.name === undefined) return setError(`Token doesnt exist`)
    // if (nftRes?.nft?.owner === NFT_BRIDGE_ADDRESS) return setError('')
    if (nftRes?.nft?.owner !== account) return setError('NFT not in your possession')
    setError('')
  }, [account, contractAddress, nftRes?.nft?.name, nftRes?.nft?.owner, tokenId])

  return (
    <Modal maxWidth="520px" width="100%" customIsOpen={isOpen} customOnDismiss={onDismiss} closeIcon>
      <Box display="grid" gridGap="24px" padding="40px">
        <Typography variant="h5">Import Manually</Typography>
        <div>
          <InputLabel>Select Chain</InputLabel>
          <ChainSelect selectedChain={chainId ? ChainListMap[chainId] : null} disabled chainList={ChainList} />
        </div>
        <Input
          placeholder="Token Contact Address"
          label="Token Contact Address"
          value={contractAddress}
          onChange={e => setContractAddress(e.target.value)}
        />
        <Input
          placeholder="Token ID"
          label="Token ID"
          value={tokenId}
          inputMode="numeric"
          minLength={1}
          pattern="\d*"
          onChange={e => setTokenId(/^\d+$/.test(e.target.value) ? e.target.value : '')}
        />
        <ActionButton
          pending={nftRes.loading}
          pendingText={'Importing'}
          actionText={nftRes?.nft?.owner === NFT_BRIDGE_ADDRESS ? 'NFT deposited, continue to withdraw' : 'Import'}
          error={error || nftRes.error}
          onAction={handleImport}
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
