import { format, parseISO } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import Image  from 'next/image';

import ptBR from 'date-fns/locale/pt-BR';

import styles from './episode.module.scss';

import Head from "next/head";
import Link from "next/link";
import { useContext } from 'react';
import { PlayerContext, usePlayer } from '../../contexts/PlayerContext';

type Episode = {
    id: string;
    title: string;
    thumbnail: string,
    members: string,
    duration: number,
    durationAsString: string,
    url: string,
    description: string,
    publishedAt: string;
}

type EpisodeProps = {
    episode: Episode;
}

export default function Episode ( { episode }: EpisodeProps ){
    const  { play } = usePlayer();
    
    const router = useRouter();

    if (router.isFallback) {
        return <p>Carregando...</p>
    }
    
    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>
            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar"/>
                    </button>
                </Link>
                <Image width={700} height={160} src={episode.thumbnail} objectFit="cover" />
                <button type="button" onClick={() => play(episode) }>
                    <img src="/play.svg" alt="Tocar episódio"/>
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div
                className={styles.description}
                dangerouslySetInnerHTML={{
                __html:
                episode.description
                }} 
            />
        </div>
    )
}

// Método obrigatório para toda página que usa geração estática
// e tem parametros dinâmicos ( nome com [] )
// Isso porque o yarn não conhece os episódios no momento do build
// Caso passe os episodios nos params, os ids específicos são gerados,
// mas os outros não, nesse caso com fallback false, retornaria error 404
// Com true geraria pela parte do client
export const getStaticPaths: GetStaticPaths = async() => {
    const { data } = await api.get('episodes', {
        params: {
          __limit: 2,
          __sort: 'published_at',
          __order: 'desc'
        }
      })
    
      const paths = data.map(episode => ({
        params: {
          slug: episode.id
        }
      }))
    
      return {
        paths,
        fallback: 'blocking', // gera alguns "mais acessados" previamente, outros na navegação
      }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params;
    const { data } = await api.get(`/episodes/${slug}`)

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale : ptBR } ),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
      }

    return {
        props: {
            episode
        },
        revalidate: 30 // 60 * 60 * 60 // 24 hours
    }
}