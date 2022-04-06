import { io, Socket } from 'socket.io-client'

import { EventFromServer, EventToServer, SocketListener } from './events'

const socket = io('https://zames-server.herokuapp.com/')

class onEventHandler {
	private event: EventFromServer
	private listener: SocketListener

	constructor(event: EventFromServer, listener: SocketListener) {
		this.event = event
		this.listener = listener

		socket.on(event, listener)
	}

	off() {
		socket.off(this.event, this.listener)
	}
}

function onEvent(event: EventFromServer, listener: SocketListener) {
	const obj = new onEventHandler(event, listener)
	return obj
}

function emitEvent(event: EventToServer, ...args: any[]) {
	socket.emit(event, ...args)
}

export interface UserSocket {
	onEvent: (event: EventFromServer, listener: SocketListener) => onEventHandler
	emitEvent: (event: EventToServer, ...args: any[]) => void
}

export function useSockets(): UserSocket {
	return { onEvent, emitEvent }
}
