import type { AppProps } from 'next/app'
import Head from 'next/head'

import SocketsProvider from '../context/Socket.context'
import UserIdProvider from '../context/UserId.context'

import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>ZAMES</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>
			<UserIdProvider>
				<SocketsProvider>
					<Component {...pageProps} />
				</SocketsProvider>
			</UserIdProvider>
		</>
	)
}

export default MyApp
