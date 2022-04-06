import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import ChatPane from '../../components/chatPane/ChatPane'
import GameGrid from '../../components/GameGrid'
import Navbar from '../../components/Navbar'
import GameArea from '../../components/GameArea'

import { RoomDataContext } from '../../context/RoomData.context'
import { gameTitles, getMinimumRequiredPlayers } from '../../components/games/games'

import styles from '../../styles/Room.module.css'
import { useSockets } from '../../utils/Socket.util'

import { User, Users, UsersContext } from '../../context/Users.context'
import { useUserId } from '../../utils/UserId.util'

export default function Room() {
	const router = useRouter()
	const socket = useSockets()
	const userId = useUserId()

	const roomData = {
		code: router.query.code as string,
		isHost: router.query.isHost === 'true',
		userName: router.query.userName as string
	}

	const [host, setHost] = useState<User>({ userId: '', userName: '' })
	const [players, setPlayers] = useState<User[]>([])
	const [spectators, setSpectators] = useState<User[]>([])

	const [gameIndex, setGame] = useState(parseInt(router.query.status as string))

	const [shouldPlayInterface, setShouldPlayInterface] = useState<'forwards' | 'reverse' | ''>('')

	function shiftTo(target: 'Player' | 'Spectator') {
		if (target == 'Player') {
			setSpectators((old) => old.filter((user) => user.userId != userId))
			setPlayers((old) => [...old, { userId, userName: roomData.userName }])
		} else {
			setPlayers((old) => old.filter((user) => user.userId != userId))
			setSpectators((old) => [...old, { userId, userName: roomData.userName }])
		}
	}

	function shiftToAndEmit(target: 'Player' | 'Spectator') {
		const shouldDo =
			(target == 'Player' && !players.map((user) => user.userId).includes(userId)) ||
			(target == 'Spectator' && !spectators.map((user) => user.userId).includes(userId))
		if (shouldDo) {
			shiftTo(target)
			socket.emitEvent(`Game-shiftTo`, target)
		}
	}

	function playInterface(direction: 'forwards' | 'reverse') {
		setShouldPlayInterface(direction)
		setTimeout(() => {
			setShouldPlayInterface('')
		}, 500)
	}

	function loadGame(index: number) {
		socket.emitEvent('Game-shiftTo', 'Spectator')
		roomData.isHost && socket.emitEvent('loadGameSignal', index)

		index == -1 ? playInterface('reverse') : playInterface('forwards')
		setTimeout(() => {
			setGame(index)
			roomData.isHost &&
				socket.emitEvent('chatMsgSend', 'system', index == -1 ? 'In Menu' : `${gameTitles[index]} Started`)
		}, 250)
	}

	useEffect(() => {
		const setUsers = (users: Users) => {
			setHost(users.host)
			setPlayers(users.players)
			setSpectators(users.spectators)
		}

		function debounce(cb: any, delay: number) {
			let timeout: any
			return (...args: any[]) => {
				clearTimeout(timeout)
				timeout = setTimeout(() => {
					cb(...args)
				}, delay)
			}
		}
		const refreshUsers = debounce(() => socket.emitEvent('getUsers', setUsers), 500)

		socket.emitEvent('getUsers', setUsers)

		const listeners = [
			socket.onEvent('loadGameAction', loadGame),
			socket.onEvent('leaveRoom', () => router.replace('/')),
			socket.onEvent('refreshUsers', refreshUsers)
		]

		return () => {
			roomData.isHost ? socket.emitEvent('deleteRoom') : socket.emitEvent('leftRoom')
			listeners.forEach((listener) => listener.off())
		}
	}, [])

	return (
		<RoomDataContext.Provider value={roomData}>
			<Navbar />
			<UsersContext.Provider value={{ host, players, spectators, shiftToAndEmit }}>
				<ChatPane />
				<div className={styles.container}>
					<div className={styles.area}>
						<div
							className={
								styles.interface + (shouldPlayInterface !== '' && ' ' + styles[shouldPlayInterface])
							}></div>
						{gameIndex === -1 ? (
							<GameGrid {...{ loadGame }} />
						) : (
							<GameArea loadGameList={() => loadGame(-1)} {...{ gameIndex }} />
						)}
					</div>
				</div>
			</UsersContext.Provider>
		</RoomDataContext.Provider>
	)
}
