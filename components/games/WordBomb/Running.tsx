import { HTMLAttributes, useEffect, useRef, useState } from 'react'

import { useGameInfo } from '../../../context/GameInfo.context'
import { useUserId } from '../../../context/UserId.context'
import { useRoomData } from '../../../context/RoomData.context'
import { useSockets } from '../../../context/Socket.context'
import EVENTS from '../../../config/events'

import styles from '../../../styles/games/WordGame/Running.module.css'

import { Settings } from './types'

interface SubmitEvents {
	lifeChange: boolean
	lettersChange: boolean
	turnChange: boolean
	playerOut: boolean
	correctWord: boolean
}

interface SubmitData {
	newLetters?: string
	newTurn?: number
	word?: string
	newLifeValue?: number
}

interface ComponentArgs {
	setMenu: (winner: string | null) => void
	settings: Settings
}

export default function Running({ setMenu, settings }: ComponentArgs) {
	const socket = useSockets()
	const userId = useUserId()
	const { idArray, playersMap } = useGameInfo()!

	const letterList = ['ER', 'OR', 'UT', 'AN', 'OP', 'ER', 'DR', 'KN']

	const [shake, setShake] = useState(false)

	const [timeLeft, setTimeLeft] = useState(settings.timeLimit)
	const [clockHandAngle, setClockHandAngle] = useState(0)

	const [letters, setLetters] = useState(letterList[0])
	const [word, setWord] = useState('')
	const [usedWords, setUsedWords] = useState<string[]>([])
	const [turn, setTurn] = useState(0)
	const [playersLeft, setPlayersLeft] = useState([...idArray])
	const [lives, setLives] = useState<{ [key: string]: number }>(() =>
		idArray.reduce((oldLives, id) => {
			return { ...oldLives, [id]: settings.lives }
		}, {})
	)

	const wordInputRef = useRef<HTMLInputElement>(null)

	function implementShake() {
		setShake(true)
		setTimeout(() => setShake(false), 500)
	}

	function handleSubmitWordEvents(userId: string, submitEvents: SubmitEvents, submitData: SubmitData) {
		submitEvents.lifeChange &&
			setLives((oldLives) => {
				return { ...oldLives, [userId]: submitData.newLifeValue! }
			})

		submitEvents.playerOut && setPlayersLeft((oldPlayersLeft) => oldPlayersLeft.filter((x) => x != userId))

		submitEvents.lettersChange && setLetters(submitData.newLetters!)

		submitEvents.correctWord && setUsedWords((oldArray) => [...oldArray, submitData.word!])

		if (submitEvents.turnChange) {
			setTurn(submitData.newTurn!)
			setTimeLeft(settings.timeLimit)
			setWord('')
		}
	}

	function submitWord() {
		const submitEvents: SubmitEvents = {
			lifeChange: false,
			lettersChange: false,
			turnChange: false,
			playerOut: false,
			correctWord: false
		}
		const submitData: SubmitData = {}

		const updateTurn = () => {
			let newTurn = turn
			do {
				newTurn = (newTurn + 1) % idArray.length
			} while (lives[idArray[newTurn]] == 0)
			return newTurn
		}

		function whenTrueSubmit() {
			submitEvents.lettersChange = true
			submitData.newLetters = letterList[Math.floor(Math.random() * letterList.length)]

			submitEvents.turnChange = true
			submitData.newTurn = updateTurn()

			submitEvents.correctWord = true
			submitData.word = word
		}

		function whenFalseSubmit() {
			submitData.newLifeValue = lives[idArray[turn]] - 1
			submitEvents.lifeChange = true
			submitEvents.turnChange = true
			submitData.newTurn = updateTurn()
			if (submitData.newLifeValue == 0) submitEvents.playerOut = true
		}

		function finalEmitAndUpdate() {
			socket.emit(EVENTS.CLIENT.toServer.Games.WordGame.submitWordSignal, idArray[turn], submitEvents, submitData)
			handleSubmitWordEvents(idArray[turn], submitEvents, submitData)
		}

		function isValidWord() {
			return (
				word.length >= settings.minWordLength &&
				word.toUpperCase().indexOf(letters) != -1 &&
				!usedWords.includes(word)
			)
		}

		if (timeLeft > 0) {
			if (isValidWord()) {
				socket.emit(EVENTS.CLIENT.toServer.Games.WordGame.isWordReal, word, (result: boolean) => {
					if (result) {
						whenTrueSubmit()
						finalEmitAndUpdate()
					} else {
						implementShake()
					}
				})
			} else {
				implementShake()
			}
		} else {
			if (isValidWord()) {
				socket.emit(EVENTS.CLIENT.toServer.Games.WordGame.isWordReal, word, (result: boolean) => {
					result ? whenTrueSubmit() : whenFalseSubmit()
					finalEmitAndUpdate()
				})
			} else {
				whenFalseSubmit()
				finalEmitAndUpdate()
			}
		}
	}

	useEffect(() => {
		socket.on(EVENTS.CLIENT.fromServer.Games.WordGame.submitWordAction, handleSubmitWordEvents)

		socket.on(EVENTS.CLIENT.fromServer.Games.WordGame.currentWordAction, setWord)

		const interval = setInterval(() => {
			setTimeLeft((_) => _ - 1)
		}, 1000)

		return () => {
			clearInterval(interval)
			socket.removeAllListeners(EVENTS.CLIENT.fromServer.Games.WordGame.submitWordAction)
		}
	}, [])

	useEffect(() => {
		if (playersLeft.length == 1) setMenu(playersMap[playersLeft[0]])
	}, [playersLeft])

	useEffect(() => {
		if (timeLeft <= 0 && userId === idArray[turn]) submitWord()
		setClockHandAngle((_) => _ + 90)
	}, [timeLeft])

	return (
		<div className={styles.container}>
			<div className={styles.players}>
				{idArray.map((id, index) => {
					return (
						<p
							className={styles.player}
							key={index}
							style={
								(index == turn
									? { fontSize: '2em', color: 'limegreen' }
									: !lives[id]
									? { color: 'gray' }
									: null) as HTMLAttributes<HTMLParagraphElement>
							}>
							{playersMap[id]}
							<span> </span>
							{[...Array(lives[id])].map((v, i) => {
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
			<div className={styles.game}>
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
				<div className={styles.currentLetters}>{letters}</div>
				{idArray[turn] === userId ? (
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
							socket.emit(EVENTS.CLIENT.toServer.Games.WordGame.currentWordSignal, newWord)
						}}
						autoFocus
						placeholder='Type Here'></input>
				) : (
					<div className={styles.wordDisplay}>{word}</div>
				)}
			</div>
		</div>
	)
}
