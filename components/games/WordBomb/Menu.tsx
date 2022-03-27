import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

import EVENTS from '../../../config/events'
import { useGameInfo } from '../../../context/GameInfo.context'
import { useRoomData } from '../../../context/RoomData.context'
import { useSockets } from '../../../context/Socket.context'

import styles from '../../../styles/games/WordGame/Menu.module.css'

import { Settings } from './types'

interface ComponentArgs {
	setRunning: () => void
	winner: string | null
	settings: Settings
	setSettings: (settings: Settings) => void
}

export default function Menu({ setRunning, winner, settings, setSettings }: ComponentArgs) {
	const socket = useSockets()
	const { playerName, isHost } = useRoomData()!
	const { gameData } = useGameInfo()!

	const [settingsVisibility, setSettingsVisibility] = useState<'hidden' | 'visible'>('hidden')
	const [timeLimit, setTimeLimit] = useState(settings.timeLimit)
	const [lives, setLives] = useState(settings.lives)
	const [minWordLength, setMinWordLength] = useState(settings.minWordLength)

	useEffect(() => {
		winner === playerName &&
			socket.emit(EVENTS.CLIENT.toServer.chatMessageSend, { sender: 'system', msg: `${winner} Won!` })
	}, [])

	return (
		<div className={styles.container}>
			<div className={gameData.style} style={{ opacity: '0.8' }}>
				<Image src={gameData.img} width='300' height='180' alt='' />
			</div>
			{winner !== null && <div className={styles.winner}>{`${winner} Won!`}</div>}
			<button
				className={styles.settings}
				onClick={() => {
					setSettingsVisibility('visible')
				}}>
				SETTINGS
			</button>
			{isHost && (
				<button className={styles.start} onClick={setRunning}>
					{winner === null ? 'START' : 'RESTART'}
				</button>
			)}
			<div style={{ visibility: settingsVisibility }} className={styles.settings_area}>
				<button
					className={styles.close}
					onClick={() => {
						setSettingsVisibility('hidden')
						setTimeLimit(settings.timeLimit)
						setLives(settings.lives)
						setMinWordLength(settings.minWordLength)
					}}>
					&times;
				</button>
				<div className={styles.content}>
					{isHost && (
						<div>
							Time Limit
							<input
								type='range'
								min='3'
								max='10'
								value={timeLimit}
								onChange={(e) => setTimeLimit(parseInt(e.target.value))}
							/>
							<label>{timeLimit}</label>
						</div>
					)}
					{isHost && (
						<div>
							Lives
							<input
								type='range'
								min='1'
								max='6'
								value={lives}
								onChange={(e) => setLives(parseInt(e.target.value))}
							/>
							<label>{lives}</label>
						</div>
					)}
					{isHost && (
						<div>
							Min Word Length
							<input
								type='range'
								min='2'
								max='5'
								value={minWordLength}
								onChange={(e) => setMinWordLength(parseInt(e.target.value))}
							/>
							<label>{minWordLength}</label>
						</div>
					)}
				</div>
				<button
					className={styles.save}
					onClick={() => {
						setSettingsVisibility('hidden')
						setSettings({ timeLimit, lives, minWordLength })
					}}>
					SAVE
				</button>
			</div>
		</div>
	)
}
