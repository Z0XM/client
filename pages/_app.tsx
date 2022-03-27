import type { AppProps } from 'next/app'

import SocketsProvider from '../context/Socket.context'
import UserIdProvider from '../context/UserId.context'

import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<UserIdProvider>
			<SocketsProvider>
				<Component {...pageProps} />
			</SocketsProvider>
		</UserIdProvider>
	)
}

export default MyApp
