import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

import { useGameInfo } from '../../../context/GameInfo.context'
import { useRoomData } from '../../../context/RoomData.context'

import styles from '../../../styles/games/WordGame/Menu.module.css'

import { Settings } from './types'
import { useSockets } from '../../../utils/Socket.util'
import { useUsers } from '../../../context/Users.context'
import { useRouter } from 'next/router'

interface ComponentArgs {
	setRunning: () => void
	winner: string | null
	settings: Settings
	setSettings: (settings: Settings) => void
}

function SettingField(label: string, minmax: number[], value: number, setValue: any) {
	return (
		<div>
			{label}
			<input
				type='range'
				min={minmax[0]}
				max={minmax[1]}
				value={value}
				onChange={(e) => setValue(parseInt(e.target.value))}
			/>
			<label>{value}</label>
		</div>
	)
}

export default function Menu({ setRunning, winner, settings, setSettings }: ComponentArgs) {
	const socket = useSockets()
	const { userName, isHost } = useRoomData()!
	const { gameData } = useGameInfo()!
	const { shiftToAndEmit } = useUsers()!
	const router = useRouter()

	const [settingsVisibility, setSettingsVisibility] = useState<'hidden' | 'visible'>('hidden')
	const [timeLimit, setTimeLimit] = useState(settings.timeLimit)
	const [lives, setLives] = useState(settings.lives)
	const [minWordLength, setMinWordLength] = useState(settings.minWordLength)
	const [passLettersTimes, setPassLettersTimes] = useState(settings.passLettersTimes)
	const [readyToPlay, setReadyToPlay] = useState(false)

	const [shouldWait, setShouldWait] = useState(router.query.shouldWait == 'true')

	useEffect(() => {
		winner === userName && socket.emitEvent('chatMsgSend', 'system', `${winner} Won!`)

		const listener = socket.onEvent('Game-dismissWaiting', () => setShouldWait(false))

		return () => {
			listener.off()
		}
	}, [])

	useEffect(() => {
		readyToPlay ? shiftToAndEmit('Player') : shiftToAndEmit('Spectator')
	}, [readyToPlay])

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

			{shouldWait ? (
				<div className={styles.start} style={{ color: 'rgba(255,255,255,0.5)' }}>
					Waiting For Game To End
				</div>
			) : (
				<button className={styles.start} onClick={() => setReadyToPlay((old) => !old)}>
					{readyToPlay ? 'SPECTATE' : 'READY'}
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
						setPassLettersTimes(settings.passLettersTimes)
					}}>
					&times;
				</button>
				<div className={styles.content}>
					{isHost && SettingField('Time Limit', [3, 10], timeLimit, setTimeLimit)}
					{isHost && SettingField('Lives', [1, 6], lives, setLives)}
					{isHost && SettingField('Min Word Length', [2, 5], minWordLength, setMinWordLength)}
					{isHost && SettingField('Pass Letters', [1, 6], passLettersTimes, setPassLettersTimes)}
				</div>
				<button
					className={styles.save}
					onClick={() => {
						setSettingsVisibility('hidden')
						setSettings({ timeLimit, lives, minWordLength, passLettersTimes })
					}}>
					SAVE
				</button>
			</div>
		</div>
	)
}
