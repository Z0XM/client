import { useEffect, useState } from 'react'

import Running from './Running'
import Menu from './Menu'
import { useGameInfo } from '../../../context/GameInfo.context'

import { Settings } from './types'
import { useSockets } from '../../../utils/Socket.util'
import { getMinimumRequiredPlayers } from '../games'
import { useUsers } from '../../../context/Users.context'
import { useRoomData } from '../../../context/RoomData.context'

type GameState = 'Running' | 'Menu'

export default function WordBomb() {
	const socket = useSockets()
	const { isHost } = useRoomData()!
	const { players } = useUsers()!
	const { gameData, setBackAction, getDefaultBackAction } = useGameInfo()!

	const [gameState, setGameState] = useState<GameState>('Menu')
	const [winner, setWinner] = useState<string | null>(null)
	const [settings, setSettings] = useState<Settings>({
		timeLimit: 10,
		lives: 3,
		minWordLength: 3,
		passLettersTimes: 2
	})

	const [letterList, setLetterList] = useState<string[]>([])

	useEffect(() => {
		const listeners = [
			socket.onEvent('Game-changeStateAction', (newState: GameState, settings: Settings) => {
				newState == 'Running' && setSettings(settings)
				setGameState(newState)
			}),
			socket.onEvent('Game-WordGame-setLetterList', setLetterList)
		]

		return () => {
			listeners.forEach((listener) => listener.off())
		}
	}, [])

	useEffect(() => {
		if (gameState === 'Menu') {
			setBackAction(getDefaultBackAction)
			isHost && socket.emitEvent('Game-setShouldWait', false)
		} else {
			isHost && socket.emitEvent('Game-WordGame-getLetterList', setLetterList)
			setWinner(null)
			setBackAction(() => {
				return () => {
					socket.emitEvent('Game-changeStateSignal', 'Menu')
					setGameState('Menu')
				}
			})
			isHost && socket.emitEvent('Game-setShouldWait', true)
		}
	}, [gameState])

	return gameState === 'Running' ? (
		<Running
			setMenu={(winner: string | null) => {
				setWinner(winner)
				setGameState('Menu')
			}}
			{...{ settings, letterList }}
		/>
	) : gameState === 'Menu' ? (
		<Menu
			setRunning={() => {
				if (players.length >= getMinimumRequiredPlayers(gameData.index)) {
					socket.emitEvent('Game-changeStateSignal', 'Running', settings)
					setGameState('Running')
				} else {
					socket.emitEvent('chatMsgSend', 'system', 'More Players Needed!')
				}
			}}
			{...{
				winner,
				settings,
				setSettings: (settings: Settings) => {
					setSettings(settings)
				}
			}}
		/>
	) : (
		<div style={{ color: 'white' }}>Unidentified Game State</div>
	)
}
