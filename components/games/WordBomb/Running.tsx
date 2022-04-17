import { HTMLAttributes, useEffect, useReducer, useRef, useState } from 'react'

import { useGameInfo } from '../../../context/GameInfo.context'

import styles from '../../../styles/games/WordBomb/Running.module.css'
import { useSockets } from '../../../utils/Socket.util'
import { useUserId } from '../../../utils/UserId.util'

import { Settings, RunningVariables, GameAction, GameEventData } from './types'

import { useUsers } from '../../../context/Users.context'

interface ComponentArgs {
	setMenu: (winner: string | null) => void
	settings: Settings
	letterList: string[]
}

function handleGameEvents(state: RunningVariables, action: GameAction): RunningVariables {
	const nextTurn = () => {
		const size = state.playersInGame.length
		let newTurn = (state.turn + 1) % size
		while (state.playersInGame[newTurn].lives == 0) newTurn = (newTurn + 1) % size
		return newTurn
	}

	switch (action.event) {
		case 'correctWord':
			action.function!.resetTime!()
			return {
				...state,
				letterIndex: action.data!.newLetterIndex!,
				turn: nextTurn(),
				lettersPassedTimes: 0,
				usedWords: [...state.usedWords, action.data!.word!]
			}

		case 'timeOver': {
			action.function!.resetTime!()
			const passedEnough = state.lettersPassedTimes + 1 == action.settings!.passLettersTimes
			return {
				...state,
				turn: nextTurn(),
				playersInGame: state.playersInGame.map((player, index) =>
					index == state.turn ? { ...player, lives: player.lives - 1 } : player
				),
				lettersPassedTimes: passedEnough ? 0 : state.lettersPassedTimes + 1,
				letterIndex: passedEnough ? action.data!.newLetterIndex! : state.letterIndex
			}
		}

		case 'playerLeft': {
			if (state.playersInGame[state.turn].userId == action.data!.playerWhoLeftId!) {
				const passedEnough = state.lettersPassedTimes == action.settings!.passLettersTimes
				action.function!.resetTime!()
				return {
					...state,
					turn: nextTurn(),
					playersInGame: state.playersInGame.map((player, index) =>
						index == state.turn ? { ...player, lives: 0 } : player
					),
					lettersPassedTimes: passedEnough ? 0 : state.lettersPassedTimes,
					letterIndex: passedEnough ? action.data!.newLetterIndex! : state.letterIndex
				}
			} else {
				return {
					...state,
					playersInGame: state.playersInGame.map((player, index) =>
						player.userId == action.data!.playerWhoLeftId! ? { ...player, lives: 0 } : player
					)
				}
			}
		}
	}

	return state
}

export default function Running({ setMenu, settings, letterList }: ComponentArgs) {
	const socket = useSockets()
	const userId = useUserId()
	const { players } = useUsers()!

	const [word, setWord] = useState('')
	const [clockHandAngle, setClockHandAngle] = useState(0)
	const [timeLeft, setTimeLeft] = useState(settings.timeLimit)
	const [shake, setShake] = useState(false)

	function initVariables(): RunningVariables {
		return {
			letterIndex: 0,
			lettersPassedTimes: 0,
			usedWords: [],
			turn: 0,
			playersInGame: players.map((user) => {
				return { ...user, lives: settings.lives }
			})
		}
	}

	const [{ letterIndex, usedWords, turn, playersInGame }, dispatchGameEvent] = useReducer(
		handleGameEvents,
		initVariables()
	)

	const wordInputRef = useRef<HTMLInputElement>(null)

	function resetTime() {
		setTimeLeft(settings.timeLimit)
	}

	function isValidWord() {
		return (
			word.length >= settings.minWordLength &&
			word.toUpperCase().indexOf(letterList[letterIndex]) != -1 &&
			!usedWords.includes(word)
		)
	}

	function onCorrectWord(data: GameEventData) {
		dispatchGameEvent({
			event: 'correctWord',
			data,
			function: { resetTime },
			settings
		})
		setWord('')
	}

	function submitWord() {
		const runIfNotValid = () => {
			setShake(true)
			setTimeout(() => setShake(false), 500)
		}

		const runIfFinalValid = () => {
			const submitData = { word, newLetterIndex: (letterIndex + 1) % letterList.length }
			onCorrectWord(submitData)
			socket.emitEvent('Game-WordGame-submitWordSignal', submitData)
		}

		isValidWord()
			? socket.emitEvent('Game-WordGame-isWordReal', word, (isValid: boolean) =>
					isValid ? runIfFinalValid() : runIfNotValid()
			  )
			: runIfNotValid()
	}

	useEffect(() => {
		const listeners = [
			socket.onEvent('Game-WordGame-currentWordAction', setWord),
			socket.onEvent('Game-WordGame-submitWordAction', onCorrectWord),
			socket.onEvent('playerLeft', (userId) => {
				dispatchGameEvent({
					event: 'playerLeft',
					data: {
						playerWhoLeftId: userId,
						newLetterIndex: (letterIndex + 1) % letterList.length
					},
					function: { resetTime },
					settings
				})
				setWord('')
			})
		]

		const interval = setInterval(() => {
			setTimeLeft((_) => _ - 1)
		}, 1000)

		return () => {
			clearInterval(interval)
			listeners.forEach((listener) => listener.off())
		}
	}, [])

	useEffect(() => {
		if (timeLeft == 0) {
			dispatchGameEvent({
				event: 'timeOver',
				data: {
					newLetterIndex: (letterIndex + 1) % letterList.length
				},
				function: { resetTime },
				settings
			})
			setWord('')
		}

		setClockHandAngle((_) => _ + 90)
	}, [timeLeft])

	useEffect(() => {
		const playersLeft = playersInGame.filter((player) => player.lives > 0)
		playersLeft.length == 1 && setMenu(playersLeft[0].userName)
	}, [playersInGame])

	return (
		<div className={styles.container}>
			<div className={styles.players}>
				{playersInGame.map((player, index, arr) => {
					const theta = (2 * Math.PI) / arr.length
					const cos = -Math.cos(((index - turn + arr.length) % arr.length) * theta + Math.PI / 2)
					const sin = Math.sin(((index - turn + arr.length) % arr.length) * theta + Math.PI / 2)
					const r = 18
					const rcos = r * cos
					const rsin = r * sin
					const style = {
						transform: `translate(calc(${r}vh * ${cos}), calc(${r}vh * ${sin}))`,
						fontSize: '',
						color: ''
					}
					if (index == turn) {
						style.fontSize = '2rem'
						style.color = 'limegreen'
					} else if (!player.lives) style.color = 'gray'
					return (
						<p className={styles.player} key={index} style={style}>
							{player.userName}
							<span> </span>
							{[...Array(player.lives)].map((v, i) => {
								return (
									<span style={{ color: 'red' }} key={i}>
										&#10084;
									</span>
								)
							})}
						</p>
					)
				})}
			</div>
			<div className={styles.game} onClick={() => wordInputRef.current?.focus()}>
				<div
					style={
						timeLeft >= 7
							? { background: 'limegreen' }
							: timeLeft >= 3
							? { background: 'rgb(199, 199, 4)' }
							: { background: 'rgb(201, 3, 3)' }
					}
					className={styles.clock}>
					<div className={styles.clockCenter}></div>
					<div style={{ transform: `rotate(${clockHandAngle}deg)` }} className={styles.clockHand}></div>
				</div>
				<div className={styles.currentLetters}>{letterList[letterIndex]}</div>
				{playersInGame[turn].userId === userId ? (
					<input
						ref={wordInputRef}
						className={shake ? styles.shake : undefined}
						onKeyDown={(e) => {
							e.preventDefault()
							let newWord = wordInputRef.current!.value
							if (e.key == 'Enter') {
								submitWord()
								newWord = ''
							} else if (e.key === 'Backspace') {
								newWord = newWord.slice(0, -1)
							} else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
								newWord = newWord + e.key
							}
							wordInputRef.current!.value = newWord
							setWord(newWord)
							socket.emitEvent('Game-WordGame-currentWordSignal', newWord)
						}}
						autoFocus
						spellCheck='false'
						placeholder='Type Here'></input>
				) : (
					<div className={styles.wordDisplay}>{word}</div>
				)}
			</div>
		</div>
	)
}
