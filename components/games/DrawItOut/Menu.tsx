import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

import { useGameInfo } from '../../../context/GameInfo.context'
import { useRoomData } from '../../../context/RoomData.context'

import styles from '../../../styles/games/DrawItOut/Menu.module.css'

import { Settings } from './types'
import { useSockets } from '../../../utils/Socket.util'
import { useUsers } from '../../../context/Users.context'
import { useRouter } from 'next/router'
import Canvas from './Canvas'

interface ComponentArgs {
	setRunning: () => void
	winner: string | null
	settings: Settings
	setSettings: (settings: Settings) => void
}

function SettingField(
	label: string,
	minmax: number[],
	value: number,
	setValue: any,
	labelMap?: (value: number) => string
) {
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
			<label>{labelMap == undefined ? value : labelMap(value)}</label>
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
	const [rounds, setRounds] = useState(settings.rounds)
	const [difficulty, setDifficulty] = useState(settings.difficulty)
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
			<div className={styles.container_left}>
				<div className={gameData.style} style={{ opacity: '0.8' }}></div>
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
			</div>
			<div className={styles.container_right}>
				<Canvas canDraw={true} />
				<div className={styles.settings_area} style={{ visibility: settingsVisibility }}>
					<button
						className={styles.close}
						onClick={() => {
							setSettingsVisibility('hidden')
							setTimeLimit(settings.timeLimit)
							setRounds(settings.rounds)
						}}>
						&times;
					</button>
					<div className={styles.content}>
						{isHost && SettingField('Time Limit', [30, 120], timeLimit, setTimeLimit)}
						{isHost && SettingField('Rounds', [1, 6], rounds, setRounds)}
						{isHost &&
							SettingField(
								'Difficulty',
								[0, 3],
								difficulty,
								setDifficulty,
								(val) => ['Easy', 'Medium', 'Hard', 'Master'][val]
							)}
					</div>
					<button
						className={styles.save}
						onClick={() => {
							setSettingsVisibility('hidden')
							setSettings({ timeLimit, rounds, difficulty })
						}}>
						SAVE
					</button>
				</div>
			</div>
		</div>
	)
}
