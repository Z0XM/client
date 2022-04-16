import { User } from '../../../context/Users.context'

export interface Settings {
	timeLimit: number
	rounds: number
	difficulty: number
}

type GameEvent = 'playerLeft' | 'setChoices' | 'setCanvas' | 'setScores' | 'wordGuessed'

export interface GameEventData {
	userId?: string
	whoGuessedId?: string
	playerWhoLeftId?: string
	word?: string
	timeLeft?: number
}

interface GameEventFunction {
	disableChat?: (disable: boolean) => void
}

export interface GameAction {
	event: GameEvent
	data?: GameEventData
	function?: GameEventFunction
	settings?: Settings
}

interface RunningVariables {
	turn: number
	round: number
	playersInGame: { userId: string; userName: string; currScore: number; totScore: number }[]
	word: string
	canDraw: boolean
	screenState: 'choices' | 'canvas' | 'scores'
	allGuessed: boolean
}
