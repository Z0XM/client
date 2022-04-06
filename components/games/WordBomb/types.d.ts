import { User } from '../../../context/Users.context'

export interface Settings {
	timeLimit: number
	lives: number
	minWordLength: number
	passLettersTimes: number
}

type GameEvent = 'correctWord' | 'playerLeft' | 'timeOver'

export interface GameEventData {
	newLetterIndex?: number
	word?: string
	playerWhoLeftId?: string
}

interface GameEventFunction {
	resetTime?: () => void
	shiftToAndEmit?: (target: 'Player' | 'Spectator') => void
}

export interface GameAction {
	event: GameEvent
	data?: GameEventData
	function?: GameEventFunction
	settings?: Settings
}

interface RunningVariables {
	letterIndex: number
	lettersPassedTimes: number
	usedWords: string[]
	turn: number
	playersInGame: { userId: string; userName: string; lives: number }[]
}
