export type SocketListener = (...args: any[]) => void

type WordGameToServer = 'submitWordSignal' | 'isWordReal' | 'currentWordSignal' | 'getLetterList'
type DrawItOutToServer = 'drawSignal' | 'clearSignal' | 'setWordSignal' | 'guessedSignal'

type GamesToServer =
	| `WordGame-${WordGameToServer}`
	| `DrawItOut-${DrawItOutToServer}`
	| 'changeStateSignal'
	| 'shiftTo'
	| 'setShouldWait'

export type EventToServer =
	| 'test'
	| 'setUserId'
	| 'joinRoom'
	| 'createRoom'
	| 'getRoomList'
	| 'getUsers'
	| 'chatMsgSend'
	| 'loadGameSignal'
	| 'voteGameSignal'
	| 'getNamesMap'
	| 'leftRoom'
	| 'deleteRoom'
	| `Game-${GamesToServer}`

type WordGameFromServer = 'submitWordAction' | 'currentWordAction' | 'setLetterList'
type DrawItOutFromServer = 'drawAction' | 'clearAction' | 'setWordAction' | 'guessedAction'

type GamesFromServer =
	| `WordGame-${WordGameFromServer}`
	| `DrawItOut-${DrawItOutFromServer}`
	| 'changeStateAction'
	| 'dismissWaiting'

export type EventFromServer =
	| 'test'
	| 'refreshUsers'
	| 'chatMsgReceive'
	| 'loadGameAction'
	| 'voteGameAction'
	| 'leaveRoom'
	| 'playerLeft'
	| 'spectatorLeft'
	| `Game-${GamesFromServer}`
