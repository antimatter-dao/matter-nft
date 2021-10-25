import React from 'react'

interface Props {
  src: string
  alt?: string
  style?: React.CSSProperties
  className?: string
}

export default function Image(props: Props) {
  const { src, alt = '', style, className, ...rest } = props

  return <img {...rest} src={src} alt={alt} style={style} className={className} />
}
