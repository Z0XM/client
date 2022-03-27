import { useEffect, useState } from 'react'

import Running from './Running'
import Menu from './Menu'
import { useSockets } from '../../../context/Socket.context'
import { useGameInfo } from '../../../context/GameInfo.context'
import EVENTS from '../../../config/events'

import { Settings } from './types'

enum GameState {
	Running = 'running',
	Menu = 'menu'
}

export default function WordBomb() {
	const socket = useSockets()
	const { setBackAction, getDefaultBackAction } = useGameInfo()!

	const [gameState, setGameState] = useState<GameState>(GameState.Menu)
	const [winner, setWinner] = useState<string | null>(null)
	const [settings, setSettings] = useState<Settings>({
		timeLimit: 10,
		lives: 3,
		minWordLength: 3
	})

	useEffect(() => {
		socket.on(EVENTS.CLIENT.fromServer.Games.WordGame.runningStateAction, (settings) => {
			setSettings(settings)
			setGameState(GameState.Running)
		})
		socket.on(EVENTS.CLIENT.fromServer.Games.WordGame.menuStateAction, () => {
			setGameState(GameState.Menu)
		})

		return () => {
			socket.removeAllListeners(EVENTS.CLIENT.fromServer.Games.WordGame.runningStateAction)
			socket.removeAllListeners(EVENTS.CLIENT.fromServer.Games.WordGame.menuStateAction)
		}
	}, [])

	useEffect(() => {
		gameState === GameState.Menu
			? setBackAction(getDefaultBackAction)
			: setBackAction(() => {
					return () => {
						socket.emit(EVENTS.CLIENT.toServer.Games.WordGame.menuStateSignal)
						setGameState(GameState.Menu)
					}
			  })
	}, [gameState])

	return gameState === GameState.Running ? (
		<Running
			setMenu={(winner: string | null) => {
				setWinner(winner)
				setGameState(GameState.Menu)
			}}
			{...{ settings }}
		/>
	) : gameState === GameState.Menu ? (
		<Menu
			setRunning={() => {
				socket.emit(EVENTS.CLIENT.toServer.Games.WordGame.runningStateSignal, settings)
				setGameState(GameState.Running)
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
