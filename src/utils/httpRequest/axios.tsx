import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://test-nftapi.antimatter.finance/web/',
  timeout: 5000,
  headers: { 'content-type': 'application/json', accept: 'application/json' }
})

export const Axios = {
  get(url: string, params: { [key: string]: any }) {
    return axiosInstance.get(url, { params })
  },
  post(url: string, data: { [key: string]: any }, params = {}) {
    return axiosInstance.post(url, data, { params })
  }
}
