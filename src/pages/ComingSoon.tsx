import { styled } from '@mui/material'
import { Dots } from 'theme/components'

const Frame = styled('div')(`
width: 500px;
height: 280px;
border: 1px solid #161616;
box-sizing: border-box;
border-radius: 32px;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
color: #161616;
`)

const Title = styled('p')(`
  font-weight: 500;
  font-size: 24px;
  line-height: 88.69%;
  color: #161616;
`)

export default function ComingSoon() {
  return (
    <Frame>
      <Title>
        Coming Soon <Dots />
      </Title>
      <div>This section is still implemeting.</div>
      <div>Please come back later</div>
    </Frame>
  )
}
