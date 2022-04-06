import { createContext, Dispatch, useContext } from 'react'

interface GameInfo {
	gameData: { index: number; [key: string]: any }
	setBackAction: Dispatch<any>
	getDefaultBackAction: () => () => void
}

export const GameInfoContext = createContext<GameInfo | null>(null)

export const useGameInfo = () => useContext(GameInfoContext)
