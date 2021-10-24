import { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../components/Header'
import Polling from '../components/essential/Polling'
import Popups from '../components/essential/Popups'
import Web3ReactManager from '../components/essential/Web3ReactManager'
import WarningModal from '../components/Modal/WarningModal'
import Bridge from './Bridge'
import { ModalProvider } from 'context/ModalContext'

const AppWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  overflow-x: hidden;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  height: 100vh;
  `}
`
const ContentWrapper = styled.div`
  width: 100%;
  max-height: 100vh;
  overflow: auto;
  align-items: center;
`

const HeaderWrapper = styled.div`
  width: 100%;
  justify-content: space-between;
  flex-direction: column;
  ${({ theme }) => theme.flexRowNoWrap}
  ${({ theme }) => theme.mediaWidth.upToSmall`
  height:0;
  overflow: hidden
  `}
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: calc(100vh - ${({ theme }) => theme.headerHeight});
  justify-content: center;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  margin-bottom: ${({ theme }) => theme.headerHeight}
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin-top: ${({ theme }) => theme.mobileHeaderHeight}
  `};
`

export const Marginer = styled.div`
  ${({ theme }) => theme.desktop}
`

export default function App() {
  return (
    <Suspense fallback={null}>
      <ModalProvider>
        <AppWrapper id="app">
          <ContentWrapper>
            <HeaderWrapper id="header">
              <Header />
            </HeaderWrapper>
            <BodyWrapper id="body">
              <Popups />
              <Polling />
              <WarningModal />
              <Web3ReactManager>
                <Switch>
                  <Route exact strict path="/" component={Bridge} />
                </Switch>
              </Web3ReactManager>
              {/* <Marginer /> */}
            </BodyWrapper>
          </ContentWrapper>
        </AppWrapper>
      </ModalProvider>
    </Suspense>
  )
}
