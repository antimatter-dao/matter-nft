import { useEffect, useMemo, useState } from 'react'
import { Axios } from '../utils/httpRequest/axios'
import { useActiveWeb3React } from '.'
import { AccountActivityRecvStatus, AccountEventType } from 'pages/Account'

export interface ActivityItemProp {
  contract: string
  fromAddress: string
  fromChainId: number
  status: AccountActivityRecvStatus
  timestamp: number
  nonce: number
  toAddress: string
  toChainId: number
  tokenId: number
  type: AccountEventType
}

export function useMyActivity(
  type: AccountEventType
): {
  loading: boolean
  page: {
    totalPages: number
    currentPage: number
    setCurrentPage: (page: number) => void
  }
  data: ActivityItemProp[]
} {
  const { chainId, account } = useActiveWeb3React()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [list, setList] = useState<ActivityItemProp[]>([])

  useEffect(() => {
    setCurrentPage(1)
  }, [type])
  useEffect(() => {
    ;(async () => {
      if (!account || !chainId) return
      try {
        setIsLoading(true)
        setList([])
        const req = {
          address: account,
          chainId: chainId,
          curPage: currentPage,
          pageSize: 10,
          type: type === AccountEventType.ALL ? '' : type === AccountEventType.SEND ? '1' : '2'
        }
        const { data: _recordres } = await Axios.get(
          'https://test-nftapi.antimatter.finance:8081/vault/bridgeRecord',
          req
        )
        const recordList: ActivityItemProp[] = _recordres.data.list.map(
          (item: {
            contract: any
            from_address: any
            from_chain_id: any
            status: AccountActivityRecvStatus
            timestamp: any
            to_address: any
            nonce: any
            to_chain_id: any
            token_id: any
            type: any
          }) => {
            return {
              contract: item.contract,
              fromAddress: item.from_address,
              fromChainId: item.from_chain_id,
              status: item.status,
              nonce: item.nonce,
              timestamp: item.timestamp,
              toAddress: item.to_address,
              toChainId: item.to_chain_id,
              tokenId: item.token_id,
              type: item.type === 1 ? AccountEventType.SEND : AccountEventType.RECEIVE
            }
          }
        )
        setList(recordList)
        setIsLoading(false)
        _recordres && setTotalPages((_recordres as any)?.data.pages ?? 0)
      } catch (error) {
        console.error('fetch useMyActivity', error)
      }
    })()
  }, [account, chainId, currentPage, type])

  const res = useMemo(() => ({ page: { totalPages, currentPage, setCurrentPage }, loading: isLoading, data: list }), [
    currentPage,
    isLoading,
    list,
    totalPages
  ])
  return res
}
