import { useEffect, useState } from 'react'

function isUrl(str: string) {
  const v = new RegExp(
    '^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
    'i'
  )
  return v.test(str)
}
function isImageUrl(str: string) {
  const arr = str.split('.')
  const images = ['jpg', 'png', 'svg', 'jpeg']
  if (arr.length > 0 && images.includes(arr[arr.length - 1])) return true
  return false
}

export function useNFTImageByUri(tokenUri: string | undefined): string {
  const [uri, setUri] = useState('')
  useEffect(() => {
    if (!tokenUri) {
      setUri('')
      return
    }
    if (isImageUrl(tokenUri)) {
      setUri(tokenUri)
      return
    }

    const str = tokenUri.replace(/^data:application\/json;base64,/, '')
    if (str.length !== tokenUri.length) {
      const json = JSON.parse(window.atob(str))
      setUri((json.image as string) || '')
      return
    }
    if (isUrl(tokenUri)) {
      fetch(tokenUri)
        .then(res => res.json())
        .then(res => setUri((res.image as string) || tokenUri))
        .catch(() => setUri(tokenUri))
    } else {
      setUri('')
    }
  }, [tokenUri])

  return uri
}
