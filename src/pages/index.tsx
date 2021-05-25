// SPA
// SSR
// SSG

//import { useEffect } from 'react';

import { GetStaticProps } from 'next';

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';

type Episode = {
  id: string;
  title: string;
  thumbnail: string,
  members: string,
  duration: number,
  durationAsString: string,
  url: string,
  publishedAt: string;
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps ) {
  // ABAIXO É A REQUISIÇÃO SPA
  // a requisição dos episódios é carregado apenas 1 vez, quando a página é carregada
  // o problema é quando precisa fazer a anexação, porque o browser não espera a requisição
  // para então coletar e anexar no google ou etc
  
  // os parametros do useeffect são o que executar e quando
  // useEffect(() => {}, [variavel] ) // o código é executado toda vez que a variável é alterada
  {/*useEffect(() => {
    fetch('http://localhost:3333/episodes')
      .then(response => response.json())
        .then(data => console.log(data))
  }, [] ) // apenas quando o componente é exibido em tela
  */}
  
  const { playList } = usePlayer();

  const episodeList = {...latestEpisodes, ...allEpisodes};


  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          { latestEpisodes.map((episode,index) => (
            <li key={episode.id}> {/* possibilita renderizar apenas ele se necessario */}
              <Image width={192} height={192} src={episode.thumbnail} alt={episode.title} objectFit="cover"/>

              <div className={styles.episodeDetails}>
                <Link href={`/episode/${episode.id}`}>
                  <a>{episode.title}</a>
                </Link>
                <p>{episode.members}</p>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
              </div>

              <button type="button" onClick={() => playList(episodeList, index)}>
                <img src="/play-green.svg" alt="Tocar episódio"/>
              </button>
              
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>
        <table cellSpacing={0}>
          <thead>
            <th></th>
            <th>Podcast</th>
            <th>Integrantes</th>
            <th>Data</th>
            <th>Duração</th>
            <th></th>
          </thead>
          <tbody>
            {allEpisodes.map((episode, index) => (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image width={120}
                    height={120}
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episode/${episode.id}`}>
                      <a >{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length )}> { /* começa a contar do 3 */ }
                      <img src="/play-green.svg" alt="Tocar episódio"/>
                    </button>  
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

// ABAIXO É O SSR
{/*
export async function getServerSideProps(){
  // função faz o mesmo que o useeffect, mas é reescrito de forma assíncrona
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json()
  
  return {
    props: { // o props é sempre props
      episodes: data,
    }
    // retorna as props que são o parâmetro ha Home
  }
}*/}

// quando esse método é executado, ele é executado na camada do next e não no browser
// então o console.log é printado no terminal, não no browser (client)
// quando o usuário vai acessar a página, eles já estão disponíveis

// dessa forma, o browser não precisa fazer requisição pro backend, porque o next já fez
// É EXECUTADO TODA VEZ que alguém acessa a aplicação


// Na última versão, é retornada uma versão estática do HTML que só é atualizada de tempos em tempos
// Isso reduz o gasto desnecessário de recursos de requisições
// Só executa em produção, então precisa do yarn build
// O yarn start é igual ao em produção

export const getStaticProps: GetStaticProps = async () => {
  // função faz o mesmo que o useeffect, mas é reescrito de forma assíncrona
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })
  
  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale : ptBR } ),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    }
  })
  
  const latestEpisodes = episodes.slice(0, 2); // a partir da posição 0, quero 2
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: { // o props é sempre props, retorna as props que são o parâmetro ha Home
      latestEpisodes: latestEpisodes,
      allEpisodes: allEpisodes,
    },
    revalidate: 60 * 60 * 8 // a cada 8 horas
    // de quanto em quanto tempo atualiza a página
  }
}



// a vantagem do typescript é a tipagem que facilita a manutenção
// tsxt é typescript + jsx ( xml no javascript)

// sass
// o _document é pra ser chamado só uma vez, e não recarregar toda vez como o app.tsx

// se usa o useState, toda vez que o estado é alterado, o componente é recriado do zero,
// então é recomendado fazer formatações logo após a requisição

// prefetch é o next supor que o link vai ser clicado então carrega a página assim que o componente de tag a é exibido