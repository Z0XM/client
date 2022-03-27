import Link from 'next/link'
import { useEffect, useState } from 'react'
import EVENTS from '../config/events'
import { useSockets } from '../context/Socket.context'

import styles from '../styles/RoomList.module.css'

interface ComponentArgs {
	joinRoom: (room_code: string) => void
}

export default function RoomList({ joinRoom }: ComponentArgs) {
	const socket = useSockets()

	const [roomList, setRoomList] = useState<
		{
			code: string
			host: string
			playerCount: number
			status: string
		}[]
	>([])

	useEffect(() => {
		setInterval(() => {
			socket.emit(EVENTS.CLIENT.toServer.getRoomList, setRoomList)
		}, 5000)
	}, [])

	return (
		<div className={styles.grid}>
			{roomList.map((room, index) => {
				return (
					<button
						className={styles.room}
						onClick={(e) => {
							e.preventDefault()
							joinRoom(room.code)
						}}
						key={index}>
						<p>
							<span className={styles.host}>{room.host} </span>
							<br />
							<span className={styles.gameName}> {room.status} </span>
							<span className={styles.playerCount}> {room.playerCount + 1} </span>
						</p>
					</button>
				)
			})}
		</div>
	)
}
