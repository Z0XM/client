import { useRouter } from 'next/router'
import { useEffect, useState, useContext } from 'react'
import { useSockets } from '../../context/Socket.context'

import ChatPane from '../../components/chatPane/ChatPane'
import GameGrid from '../../components/GameGrid'
import Navbar from '../../components/Navbar'
import GameArea from '../../components/GameArea'

import EVENTS from '../../config/events'

import { RoomDataContext } from '../../context/RoomData.context'

import gameTitles from '../../styles/games/GameTitles.module.css'
import styles from '../../styles/Room.module.css'

export default function Room() {
	const router = useRouter()
	const socket = useSockets()

	const roomData = {
		code: router.query.code as string,
		isHost: router.query.isHost === 'true',
		playerName: router.query.playerName as string
	}

	const [gameIndex, setGame] = useState(-1)
	const [gameList, setGameList] = useState([
		{ img: '/svg/WordBomb.svg', title: 'WordBomb', style: `${gameTitles.wordBomb}` },
		{ img: '/svg/ComingSoon.svg', title: 'Coming Soon', style: `${gameTitles.comingSoon}` },
		{ img: '/svg/ComingSoon.svg', title: 'Coming Soon', style: `${gameTitles.comingSoon}` },
		{ img: '/svg/ComingSoon.svg', title: 'Coming Soon', style: `${gameTitles.comingSoon}` },
		{ img: '/svg/ComingSoon.svg', title: 'Coming Soon', style: `${gameTitles.comingSoon}` },
		{ img: '/svg/ComingSoon.svg', title: 'Coming Soon', style: `${gameTitles.comingSoon}` },
		{ img: '/svg/ComingSoon.svg', title: 'Coming Soon', style: `${gameTitles.comingSoon}` }
	])
	const [shouldPlayInterface, setShouldPlayInterface] = useState<'forwards' | 'reverse' | ''>('')

	function playInterface(direction: 'forwards' | 'reverse') {
		setShouldPlayInterface(direction)
		setTimeout(() => {
			setShouldPlayInterface('')
		}, 500)
	}

	function loadGame(index: number) {
		socket.emit(EVENTS.CLIENT.toServer.loadGameSignal, index)
		index == -1 ? playInterface('reverse') : playInterface('forwards')
		setTimeout(() => {
			setGame(index)
			socket.emit(EVENTS.CLIENT.toServer.chatMessageSend, {
				sender: 'system',
				msg: index === -1 ? 'In Menu' : `${gameList[index].title} Started`
			})
		}, 250)
	}

	useEffect(() => {
		socket.on(EVENTS.CLIENT.fromServer.loadGameAction, (index) => {
			index == -1 ? playInterface('reverse') : playInterface('forwards')
			setTimeout(() => {
				setGame(index)
			}, 250)
		})
		socket.on(EVENTS.CLIENT.fromServer.leaveRoom, () => {
			router.replace('/')
		})

		return () => {
			roomData.isHost
				? socket.emit(EVENTS.CLIENT.toServer.deleteRoom)
				: socket.emit(EVENTS.CLIENT.toServer.leftRoom)

			socket.removeAllListeners(EVENTS.CLIENT.fromServer.loadGameAction)
			socket.removeAllListeners(EVENTS.CLIENT.fromServer.leaveRoom)
		}
	}, [])

	return (
		<RoomDataContext.Provider value={roomData}>
			<Navbar />
			<ChatPane />
			<div className={styles.container}>
				<div className={styles.area}>
					<div
						className={
							styles.interface + (shouldPlayInterface !== '' && ' ' + styles[shouldPlayInterface])
						}></div>
					{gameIndex === -1 ? (
						<GameGrid {...{ loadGame, gameList, playInterface }} />
					) : (
						<GameArea
							loadGameList={() => loadGame(-1)}
							{...{ gameIndex, gameDetails: gameList[gameIndex], playInterface }}
						/>
					)}
				</div>
			</div>
		</RoomDataContext.Provider>
	)
}
