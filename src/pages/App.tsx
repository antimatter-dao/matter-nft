import { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import { styled } from '@mui/material'
import Header from '../components/Header'
import Polling from '../components/essential/Polling'
import Popups from '../components/essential/Popups'
import Web3ReactManager from '../components/essential/Web3ReactManager'
import WarningModal from '../components/Modal/WarningModal'
import Home from './Home'
import Bridge from './Bridge'
import Account from './Account'
import { ModalProvider } from 'context/ModalContext'
import Footer from 'components/Footer'
import { SwapProvider } from 'context/SwapContext'
import { routes } from 'constants/routes'

const AppWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  overflowX: 'hidden',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    height: '100vh'
  }
}))

const ContentWrapper = styled('div')({
  width: '100%',
  maxHeight: '100vh',
  overflow: 'auto',
  alignItems: 'center'
})

const BodyWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: `calc(100vh - ${theme.height.header} - ${theme.height.footer})`,
  padding: '50px 0 80px',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  position: 'relative',
  [theme.breakpoints.down('lg')]: {
    minHeight: `calc(100vh - ${theme.height.header} - ${theme.height.mobileHeader})`,
    paddingTop: 20
  }
}))

export default function App() {
  return (
    <Suspense fallback={null}>
      <ModalProvider>
        <AppWrapper id="app">
          <ContentWrapper>
            <Header />
            <BodyWrapper id="body">
              <Popups />
              <Polling />
              <WarningModal />
              <Web3ReactManager>
                <SwapProvider>
                  <Switch>
                    <Route exact strict path={routes.home} component={Home} />
                    <Route exact strict path={routes.bridge} component={Bridge} />
                    <Route strict path={routes.profileTab} component={Account} />
                    <Route strict path={routes.profile} component={Account} />
                    <Route path={routes.home} component={Home} />
                  </Switch>
                </SwapProvider>
              </Web3ReactManager>
            </BodyWrapper>
            <Footer />
          </ContentWrapper>
        </AppWrapper>
      </ModalProvider>
    </Suspense>
  )
}
