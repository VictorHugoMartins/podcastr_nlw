import { Header } from '../components/Header';

import '../styles/global.scss'

import styles from '../styles/app.module.scss';

import { Player } from '../components/Player';
import { PlayerContextProvider } from '../contexts/PlayerContext';

function MyApp({ Component, pageProps }) {
  return (
    <PlayerContextProvider>
      <div className={styles.wrapper}>
        <main>
          <Header/>
          <Component {...pageProps}/>
        </main>
        <Player/>
      </div>
    </PlayerContextProvider>
  )
}

export default MyApp


// coloca no app tudo o que vai estar SEMPRE vísivel na aplicação

// json server converte o que está em json para uma api
// "json-server server.json -w -d 750 -p 3333" o p é de porta e o w é o delay
// para executar: yarn server