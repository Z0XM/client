import { createContext, Dispatch, useContext } from 'react'

interface GameInfo {
	gameData: { index: number; [key: string]: any }
	idArray: string[]
	playersMap: { [key: string]: string }
	setBackAction: Dispatch<any>
	getDefaultBackAction: () => () => void
}

export const GameInfoContext = createContext<GameInfo | null>(null)

export const useGameInfo = () => useContext(GameInfoContext)
