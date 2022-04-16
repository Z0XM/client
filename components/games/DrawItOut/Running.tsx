import Canvas from './Canvas'
import { GameAction, GameEvent, RunningVariables, Settings } from './types'

import styles from '../../../styles/games/DrawItOut/Running.module.css'

import words from './words.json'
import { onEventHandler, useSockets } from '../../../utils/Socket.util'
import { useUserId } from '../../../utils/UserId.util'
import { useUsers } from '../../../context/Users.context'
import { useEffect, useReducer, useState } from 'react'
import { useChats } from '../../../context/Chat.context'
import { useRoomData } from '../../../context/RoomData.context'

interface ComponentArgs {
	setMenu: (winner: string | null) => void
	settings: Settings
}

function handleGameEvents(state: RunningVariables, action: GameAction): RunningVariables {
	const nextTurn = () => {
		const size = state.playersInGame.length
		let newTurn = (state.turn + 1) % size
		let newRound = state.round + +(newTurn == 0)
		while (state.playersInGame[newTurn].totScore == -1) {
			newTurn = (newTurn + 1) % size
			newRound = newRound + +(newTurn == 0)
		}
		return [newTurn, newRound]
	}

	switch (action.event) {
		case 'setChoices':
			action.function!.disableChat!(state.playersInGame[state.turn].userId == action.data!.userId!)
			return {
				...state,
				screenState: 'choices',
				word: '',
				canDraw: true,
				playersInGame: state.playersInGame.map((player) =>
					player.totScore == -1 ? player : { ...player, currScore: 0 }
				),
				allGuessed: false
			}
		case 'setCanvas':
			return {
				...state,
				screenState: 'canvas',
				word: action.data!.word!,
				canDraw: action.data!.userId == state.playersInGame[state.turn].userId,
				allGuessed: false
			}

		case 'wordGuessed':
			const activeGuessers =
				state.playersInGame.reduce((count, player) => count + +(player.totScore != -1), 0) - 1
			const arr = state.playersInGame.map((player) => {
				const hasTurn = player.userId == state.playersInGame[state.turn].userId
				const score = Math.floor(action.data!.timeLeft! * (hasTurn ? 0.6 / activeGuessers : 0.7))
				return player.userId == action.data!.whoGuessedId! || hasTurn
					? {
							...player,
							currScore: score,
							totScore: player.totScore + score
					  }
					: player
			})
			return {
				...state,
				playersInGame: arr,
				allGuessed: arr.filter((player) => player.totScore != -1 && player.currScore == 0).length == 0
			}

		case 'setScores':
			const [newTurn, newRound] = nextTurn()
			return {
				...state,
				screenState: 'scores',
				canDraw: false,
				turn: newTurn,
				round: newRound,
				allGuessed: false
			}

		case 'playerLeft':
			if (action.data!.playerWhoLeftId! === state.playersInGame[state.turn].userId) {
				const [newTurn, newRound] = nextTurn()
				return {
					...state,
					playersInGame: state.playersInGame.map((player) =>
						player.userId == action.data!.playerWhoLeftId ? { ...player, totScore: -1 } : player
					),
					allGuessed: true,
					turn: state.screenState == 'scores' ? newTurn : state.turn,
					round: state.screenState == 'scores' ? newRound : state.round
				}
			} else {
				return {
					...state,
					playersInGame: state.playersInGame.map((player) =>
						player.userId == action.data!.playerWhoLeftId ? { ...player, totScore: -1 } : player
					)
				}
			}
	}
	return state
}

function getRandomWords(difficulty: number) {
	const diffLevel = ['easy', 'medium', 'hard', 'master'][difficulty]
	// @ts-ignore
	const diffWords: string[] = words[diffLevel]
	diffWords.sort(() => 0.5 - Math.random())
	return diffWords.slice(0, 3).map((word) => word[0].toUpperCase() + word.slice(1))
}

export default function Running({ setMenu, settings }: ComponentArgs) {
	const socket = useSockets()
	const userId = useUserId()
	const { players } = useUsers()!
	const { chats, disableChat, disableChatAutoEmit } = useChats()!
	const { userName } = useRoomData()!

	const [choices, setChoices] = useState(getRandomWords(settings.difficulty))
	const [timer, setTimer] = useState(10)

	function initGameVariables(): RunningVariables {
		return {
			turn: 0,
			round: 0,
			playersInGame: players.map((user) => {
				return { ...user, totScore: 0, currScore: 0 }
			}),
			word: '',
			canDraw: false,
			screenState: 'choices',
			allGuessed: false
		}
	}
	const [{ word, canDraw, screenState, allGuessed, turn, round, playersInGame }, dispatchGameEvent] = useReducer(
		handleGameEvents,
		initGameVariables()
	)

	function onSetChoices() {
		disableChatAutoEmit(false)
		dispatchGameEvent({ event: 'setChoices', data: { userId }, function: { disableChat } })
		setTimer(10)
	}
	function onSetCanvas(choice: string) {
		disableChatAutoEmit(true)
		dispatchGameEvent({ event: 'setCanvas', data: { word: choice, userId } })
		setTimer(settings.timeLimit)
	}
	function onWordGuessed(whoGuessedId: string, timeLeft: number) {
		disableChat(whoGuessedId == userId)
		dispatchGameEvent({ event: 'wordGuessed', data: { whoGuessedId, timeLeft } })
	}
	function onSetScores() {
		disableChatAutoEmit(false)
		disableChat(false)
		dispatchGameEvent({ event: 'setScores' })
		setTimer(10)
		setChoices(getRandomWords(settings.difficulty))
	}
	function onPlayerLeft(playerWhoLeftId: string) {
		dispatchGameEvent({ event: 'playerLeft', data: { playerWhoLeftId } })
	}

	useEffect(() => {
		if (screenState == 'canvas' && chats.length && chats[chats.length - 1].sender == userName) {
			if (word.toLowerCase() == chats[chats.length - 1].msg.toLowerCase()) {
				onWordGuessed(userId, timer)
				disableChat(true)
				socket.emitEvent('Game-DrawItOut-guessedSignal', userId, timer)
				socket.emitEvent('chatMsgSend', 'system', `${userName} Guessed the answer!`)
			} else {
				socket.emitEvent('chatMsgSend', chats[chats.length - 1].sender, chats[chats.length - 1].msg)
			}
		}
	}, [chats])

	useEffect(() => {
		if (screenState != 'scores' && allGuessed) onSetScores()
	}, [allGuessed])

	useEffect(() => {
		round == settings.rounds &&
			setMenu(
				playersInGame.reduce((oldMax, player) => (player.totScore > oldMax.totScore ? player : oldMax)).userName
			)
	}, [round])

	useEffect(() => {
		if (players.length == 1) setMenu(players[0].userName)
	}, [players])

	useEffect(() => {
		if (timer == 0) {
			if (screenState == 'choices') {
				onSetCanvas(choices[0])
				socket.emitEvent('Game-DrawItOut-setWordSignal', choices[0])
			} else if (screenState == 'canvas') {
				onSetScores()
			} else if (screenState == 'scores') {
				onSetChoices()
			}
		}
	}, [timer])

	useEffect(() => {
		const listeners = [
			socket.onEvent('Game-DrawItOut-setWordAction', onSetCanvas),
			socket.onEvent('Game-DrawItOut-guessedAction', onWordGuessed),
			socket.onEvent('playerLeft', onPlayerLeft)
		]

		const interval = setInterval(() => setTimer((_) => _ - 1), 1000)

		onSetChoices()

		return () => {
			listeners.forEach((listener) => listener.off())
			clearInterval(interval)
			disableChatAutoEmit(false)
			disableChat(false)
		}
	}, [])
	return (
		<div className={styles.container}>
			<div className={styles.canvas_flex}>
				<Canvas canDraw={canDraw} />
				<div className={styles.clock}>{timer}</div>
				<div className={styles.word}>
					{playersInGame[turn].userId == userId ? word : '_'.repeat(word.length)}
				</div>
			</div>
			{screenState == 'choices' && playersInGame[turn].userId == userId && (
				<div className={styles.choices_area}>
					<div className={styles.choices}>
						{choices.map((choice, index) => (
							<button
								onClick={() => {
									onSetCanvas(choice)
									socket.emitEvent('Game-DrawItOut-setWordSignal', choice)
								}}
								key={index}>
								{choice}
							</button>
						))}
					</div>
				</div>
			)}
			{screenState == 'scores' && (
				<div className={styles.scores_container}>
					<div className={styles.scores_area}>
						{playersInGame.map((player) =>
							player.totScore == -1 ? (
								<></>
							) : (
								<div key={player.userId} className={styles.score}>
									<span className={styles.score_name}>{player.userName} :</span>
									<span className={styles.score_total}>{player.totScore}</span>
									<span className={styles.score_current}>+ {player.currScore}</span>
								</div>
							)
						)}
					</div>
				</div>
			)}
		</div>
	)
}
