import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import RoomList from '../components/RoomList'
import { useSockets } from '../utils/Socket.util'

import styles from '../styles/Home.module.css'

const MainPage: NextPage = () => {
	const router = useRouter()
	const socket = useSockets()

	const queryRoomCode = router.query.code as string

	const [userName, setName] = useState('')
	const [errorLog, setErrorLog] = useState('')

	function handleResponse(response: {
		isError: boolean
		code?: string
		errorMsg?: string
		isHost?: boolean
		status?: number
		shouldWait?: boolean
	}) {
		window.localStorage.setItem('userName', userName.toUpperCase())
		response.isError
			? setErrorLog(response.errorMsg!)
			: router.replace(
					`/${response.code!}/?` +
						`isHost=${response.isHost}&` +
						`userName=${userName}&` +
						`status=${response.status!}&` +
						`shouldWait=${response.shouldWait}`,
					`/${response.code!}`
			  )
	}

	const createRoom = () => {
		socket.emitEvent('createRoom', userName.toUpperCase(), handleResponse)
	}

	const joinRoom = (roomCode: string) => {
		socket.emitEvent('joinRoom', roomCode, userName.toUpperCase(), handleResponse)
	}

	useEffect(() => {
		setName(window.localStorage.getItem('userName') ?? '')
	}, [])

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
						value={userName}
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
