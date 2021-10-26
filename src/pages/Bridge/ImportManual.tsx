import { useState, useEffect } from 'react'
import { Box, Typography } from '@material-ui/core'
import Button from 'components/Button/Button'
import Input from 'components/Input'
import InputLabel from 'components/Input/InputLabel'
import Modal from 'components/Modal'
import ChainSelect from 'components/Select/ChainSelect'
import { ChainList, ChainListMap } from 'constants/chain'
import { useActiveWeb3React } from 'hooks'
import { NFT } from 'models/nft'
import { useNftData } from 'hooks/useNftData'
import useModal from 'hooks/useModal'
import OutlineButton from 'components/Button/OutlineButton'
import { isAddress } from 'utils'

export default function ImportManual({
  onImport,
  isOpen,
  onDismiss
}: {
  onImport: (nft: NFT) => void
  isOpen: boolean
  onDismiss: () => void
}) {
  const { showModal } = useModal()
  const { chainId } = useActiveWeb3React()
  const [contractAddress, setContractAddress] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [nftTemp, setNftTemp] = useState<any>(undefined)
  const nftRes = useNftData(nftTemp?.contractAddress || '', nftTemp?.tokenId || '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!nftRes) return
    if (nftRes.error) {
      showModal(<></>)
      return
    }
    if (nftRes.loading) {
      return
    }
    if (!nftTemp || nftRes.nft.name === undefined) return
    console.log(999, nftRes.nft)
    onImport(nftRes.nft)
    onDismiss()
  }, [nftRes, nftTemp, onDismiss, onImport, showModal])

  useEffect(() => {
    isAddress(contractAddress) ? setError('') : setError('Invalid contract address')
  }, [contractAddress])

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
        {error ? (
          <OutlineButton disabled primary>
            {error}
          </OutlineButton>
        ) : (
          <Button
            disabled={!chainId || !contractAddress || !tokenId || !!error}
            onClick={() => {
              setNftTemp({
                contractAddress,
                tokenId
              })
            }}
          >
            Import
          </Button>
        )}
      </Box>
    </Modal>
  )
}
