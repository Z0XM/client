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

export default function DrawItOut() {
	const socket = useSockets()
	const { isHost } = useRoomData()!
	const { players } = useUsers()!
	const { gameData, setBackAction, getDefaultBackAction } = useGameInfo()!

	const [gameState, setGameState] = useState<GameState>('Menu')
	const [winner, setWinner] = useState<string | null>(null)
	const [settings, setSettings] = useState<Settings>({ timeLimit: 80, rounds: 3, difficulty: 1 })

	useEffect(() => {
		const listeners = [
			socket.onEvent('Game-changeStateAction', (newState: GameState, settings: Settings) => {
				newState == 'Running' && setSettings(settings)
				setGameState(newState)
			})
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
			{...{ settings }}
		/>
	) : (
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
				setSettings: (settings: Settings) => setSettings(settings)
			}}
		/>
	)
}
