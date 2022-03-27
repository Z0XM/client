import WordBomb from './games/WordBomb/WordBomb'

import { useState, useEffect } from 'react'

import { useRoomData } from '../context/RoomData.context'
import EVENTS from '../config/events'

import styles from '../styles/GameArea.module.css'
import { useSockets } from '../context/Socket.context'

import { GameInfoContext } from '../context/GameInfo.context'

interface ComponentArgs {
	loadGameList: () => void
	gameIndex: number
	gameDetails: {
		img: string
		title: string
		style: string
	}
	playInterface: (direction: 'forwards' | 'reverse') => void
}

function GameArea({ loadGameList, gameIndex, gameDetails, playInterface }: ComponentArgs) {
	const { isHost } = useRoomData()!
	const socket = useSockets()

	const getDefaultBackAction = () => loadGameList

	const [playersMap, setPlayersMap] = useState<{ [key: string]: string }>({})
	const [idArray, setIdArray] = useState<string[]>([])
	const [hasLoaded, setLoaded] = useState(false)
	const [backAction, setBackAction] = useState(getDefaultBackAction)

	useEffect(() => {
		socket.emit(EVENTS.CLIENT.toServer.getPlayersMap, (map: { [key: string]: string }) => {
			setPlayersMap(map)
			setIdArray(Object.keys(map))
			setLoaded(true)
		})
	}, [])

	return (
		<>
			<button className={styles.backButton + (isHost ? '' : ' ' + styles.notHost)} onClick={backAction}>
				&#x25c0; Back
			</button>
			<div className={styles.area}>
				<GameInfoContext.Provider
					value={{
						gameData: { index: gameIndex, ...gameDetails },
						idArray,
						playersMap,
						setBackAction,
						getDefaultBackAction
					}}>
					{hasLoaded && gameIndex == 0 && <WordBomb />}
				</GameInfoContext.Provider>
			</div>
		</>
	)
}

export default GameArea
