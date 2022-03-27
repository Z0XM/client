import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { io, Socket } from 'socket.io-client'

import EVENTS from '../config/events'
import config from '../config/config'
import { useUserId } from './UserId.context'

const socket = io(config.SOCKET_URL)

socket.on('connect', () => {
	console.log(`Client ${socket.id} connected to Server`)
})

const SocketContext = createContext<Socket>(socket)

function SocketsProvider(props: any) {
	const userId = useUserId()!

	useEffect(() => {
		socket.emit(EVENTS.CLIENT.toServer.setUserId, userId)
	}, [])

	return <SocketContext.Provider value={socket} {...props} />
}

export const useSockets = () => useContext(SocketContext)

export default SocketsProvider
