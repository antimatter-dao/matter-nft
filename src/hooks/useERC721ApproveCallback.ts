import { TransactionResponse } from '@ethersproject/providers'
import { useCallback, useMemo } from 'react'
import { useERC721HasPendingApproval, useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin } from '../utils'
import { Contract } from '@ethersproject/contracts'
import { useSingleCallResult } from '../state/multicall/hooks'
import { ApprovalState } from './useApproveCallback'
import { useNFTContract } from './useContract'
import useModal from './useModal'

function useGetApproved(contract: Contract | null, spender: string, tokenId: string) {
  const arg = useMemo(() => [tokenId], [tokenId])
  const res = useSingleCallResult(contract, 'getApproved', arg)
  return useMemo(() => {
    if (res.loading) return undefined
    if (res.result?.includes(spender)) return true
    return false
  }, [res.loading, res.result, spender])
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useERC721ApproveCallback(
  contractAddress: string | undefined,
  spender: string,
  tokenId: string
): [ApprovalState, () => Promise<void>] {
  // const { account } = useActiveWeb3React()
  const { hideModal } = useModal()
  const contract = useNFTContract(contractAddress)
  const isApproved = useGetApproved(contract, spender ?? '', tokenId)
  const pendingApproval = useERC721HasPendingApproval(contract?.address, spender ?? '', tokenId)
  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    // if (!spender) return ApprovalState.UNKNOWN
    // we might not have enough data to know whether or not we need to approve
    if (isApproved) return ApprovalState.APPROVED
    if (pendingApproval) return ApprovalState.PENDING
    if (isApproved === undefined) return ApprovalState.UNKNOWN
    return ApprovalState.NOT_APPROVED
  }, [isApproved, pendingApproval])

  const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!tokenId) {
      console.error('no nft token id')
      return
    }

    if (!contract) {
      console.error('Contract is null')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    const estimatedGas = await contract.estimateGas.approve(spender, tokenId).catch((error: Error) => {
      console.debug('Failed to approve nft', error)
      throw error
    })

    return contract
      .approve(spender, tokenId, {
        gasLimit: calculateGasMargin(estimatedGas)
      })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve NFT',
          ERC721Approval: { contractAddress: contract.address, spender, tokenId }
        })
      })
      .catch((error: Error) => {
        hideModal()
        console.debug('Failed to approve nft', error)
        throw error
      })
  }, [approvalState, tokenId, contract, spender, addTransaction])

  return [approvalState, approve]
}
