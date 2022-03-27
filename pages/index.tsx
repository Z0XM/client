import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { useSockets } from '../context/Socket.context'
import RoomList from '../components/RoomList'
import EVENTS from '../config/events'

import styles from '../styles/Home.module.css'

const MainPage: NextPage = () => {
	const router = useRouter()
	const socket = useSockets()

	const queryRoomCode = router.query.code as string

	const [playerName, setName] = useState('NooB')
	const [errorLog, setErrorLog] = useState('')

	const createRoom = () => {
		socket.emit(EVENTS.CLIENT.toServer.createRoom, playerName, (isError: boolean, response: string) => {
			isError
				? setErrorLog(response)
				: router.replace(`/${response}/?isHost=true&playerName=${playerName}`, `/${response}`)
		})
	}

	const joinRoom = (room_code: string) => {
		socket.emit(
			EVENTS.CLIENT.toServer.joinRoom,
			{ roomCode: room_code, playerName },
			(isError: boolean, response: string) => {
				isError
					? setErrorLog(response)
					: router.replace(`/${room_code}/?isHost=false&playerName=${playerName}`, `/${room_code}`)
			}
		)
	}

	return (
		<div className={styles.container}>
			<div className={styles.container_left}>
				<div className={styles.gameTitle}>
					<span>Z</span>
					<span>AMES</span>
				</div>
				<div className={styles.area_left}>
					<input
						type='text'
						placeholder='Enter Your Name'
						autoComplete='off'
						onChange={(e) => setName(e.target.value)}
						value={playerName}
					/>
					<button
						className={styles.create}
						onClick={(e) => {
							e.preventDefault()
							createRoom()
						}}>
						Create
					</button>
					<button
						className={styles.play}
						onClick={(e) => {
							e.preventDefault()
							joinRoom(queryRoomCode)
						}}>
						Play
					</button>
				</div>
				<div className={styles.error}>{errorLog}</div>
			</div>
			<div className={styles.container_right}>{socket != null && <RoomList joinRoom={joinRoom} />}</div>
		</div>
	)
}

export default MainPage
