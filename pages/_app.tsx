import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'

import '../styles/globals.css'
import { useSockets } from '../utils/Socket.util'
import { useUserId } from '../utils/UserId.util'

function MyApp({ Component, pageProps }: AppProps) {
	const socket = useSockets()
	const userId = useUserId()

	useEffect(() => {
		socket.emitEvent('setUserId', userId)
	}, [])

	return (
		<>
			<Head>
				<title>ZAMES</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>

			<Component {...pageProps} />
		</>
	)
}

export default MyApp
