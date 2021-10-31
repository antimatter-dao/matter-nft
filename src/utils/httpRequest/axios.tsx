import axios, { AxiosResponse, AxiosPromise } from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://test-nftapi.antimatter.finance/web/',
  // baseURL: 'https://test-nftapi.antimatter.finance:8081/',
  timeout: 10000,
  headers: { 'content-type': 'application/json', accept: 'application/json' }
})

export const Axios = {
  get(url: string, params: { [key: string]: any }) {
    return axiosInstance.get(url, { params })
  },
  post<T = any>(url: string, data: { [key: string]: any }, params = {}): AxiosPromise<ResponseType<T>> {
    return axiosInstance.post(url, data, { params })
  }
}

export type AxiosResponseType<T = any, D = any> = AxiosResponse<T, D>

interface ResponseType<T = any> {
  msg: string
  code: number
  data: T
}

export interface SignatureResponse {
  signatory: string
  fromChainId: number
  to: string
  nonce: number
  name: string
  symbol: 'TNFT'
  mainChainId: number
  nft: string
  tokenId: number
  tokenURI: string
  signV: string
  signR: string
  signS: string
}
