import { useState, useEffect } from 'react'

import { useSockets } from '../../context/Socket.context'
import EVENTS from '../../config/events'

import styles from '../../styles/chatPane/PlayerList.module.css'

interface ComponentArgs {
	playerListVisible: boolean
	togglePlayerVisiblity: () => void
}

export default function PlayerList({ playerListVisible, togglePlayerVisiblity }: ComponentArgs) {
	const socket = useSockets()

	const [allNames, setPlayerNames] = useState<{ hostName: string; playerNames: string[] }>({
		hostName: '',
		playerNames: []
	})

	const refreshPlayerNames = (unusedArgs: any) => {
		setTimeout(() => {
			socket.emit(EVENTS.CLIENT.toServer.getPlayerNames, setPlayerNames)
		}, 500)
	}

	useEffect(() => {
		socket.emit(EVENTS.CLIENT.toServer.getPlayerNames, setPlayerNames)
		socket.on(EVENTS.CLIENT.fromServer.setPlayerNames, setPlayerNames)

		socket.on(EVENTS.CLIENT.fromServer.playerLeft, refreshPlayerNames)

		return () => {
			socket.removeAllListeners(EVENTS.CLIENT.fromServer.setPlayerNames)
			socket.off(EVENTS.CLIENT.fromServer.playerLeft, refreshPlayerNames)
		}
	}, [])

	return (
		<div className={styles.players + ' ' + (playerListVisible ? styles.open : styles.close)}>
			<button
				className={styles.players_title + ' ' + (playerListVisible ? styles.open : styles.close)}
				onClick={togglePlayerVisiblity}>
				{allNames.playerNames.length + 1} Players
			</button>
			<button className={styles.refresh} onClick={refreshPlayerNames}></button>
			<div className={styles.player_list + ' ' + (playerListVisible ? styles.open : styles.close)}>
				<div>{allNames.hostName}</div>
				{allNames.playerNames.map((name, index) => {
					return <div key={index}>{name}</div>
				})}
			</div>
		</div>
	)
}
