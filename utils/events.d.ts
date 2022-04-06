export type SocketListener = (...args: any[]) => void

type WordGameToServer = 'submitWordSignal' | 'isWordReal' | 'currentWordSignal' | 'timeOverSignal' | 'getLetterList'

type GamesToServer = `WordGame-${WordGameToServer}` | 'changeStateSignal' | 'shiftTo' | 'setShouldWait'

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

type WordGameFromServer = 'submitWordAction' | 'currentWordAction' | 'timeOverAction' | 'setLetterList'

type GamesFromServer = `WordGame-${WordGameFromServer}` | 'changeStateAction' | 'dismissWaiting'

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
