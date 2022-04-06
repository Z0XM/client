import { useEffect, useState } from 'react'

import styles from '../styles/RoomList.module.css'
import { useSockets } from '../utils/Socket.util'
import { gameTitles } from './games/games'

interface Room {
	code: string
	host: string
	playerCount: number
	spectatorCount: number
	status: number
}

interface ComponentArgs {
	joinRoom: (room_code: string) => void
}

export default function RoomList({ joinRoom }: ComponentArgs) {
	const socket = useSockets()

	const [roomList, setRoomList] = useState<Room[]>([])

	useEffect(() => {
		socket.emitEvent('getRoomList', setRoomList)
		const interval = setInterval(() => {
			socket.emitEvent('getRoomList', setRoomList)
		}, 5000)

		return () => {
			clearInterval(interval)
		}
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
							<span className={styles.gameName}>
								{' '}
								{room.status == -1 ? 'In Menu' : gameTitles[room.status]}{' '}
							</span>
							<span className={styles.playerCount}> {room.playerCount + room.spectatorCount} </span>
						</p>
					</button>
				)
			})}
		</div>
	)
}
