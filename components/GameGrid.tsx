import Image from 'next/image'
import { useEffect, useState } from 'react'
import EVENTS from '../config/events'
import { useRoomData } from '../context/RoomData.context'
import { useSockets } from '../context/Socket.context'
import styles from '../styles/GameGrid.module.css'

interface ComponentArgs {
	loadGame: (index: number) => void
	gameList: {
		img: string
		title: string
		style: string
	}[]
	playInterface: (direction: 'forwards' | 'reverse') => void
}

export default function GameGrid({ loadGame, gameList, playInterface }: ComponentArgs) {
	const socket = useSockets()
	const { isHost } = useRoomData()!

	const [votedFor, setVotedFor] = useState(-1)
	const [votes, setVotes] = useState([...Array(gameList.length).fill(0)])

	function calcAndSetNewVotes(oldVote: number, newVote: number) {
		setVotes((oldVotes) => {
			const newVotes = [...oldVotes]
			if (oldVote != -1) newVotes[oldVote]--
			if (newVote != -1) newVotes[newVote]++
			return newVotes
		})
	}

	useEffect(() => {
		socket.on(EVENTS.CLIENT.fromServer.voteGameAction, calcAndSetNewVotes)

		return () => {
			socket.removeAllListeners(EVENTS.CLIENT.fromServer.voteGameAction)
		}
	}, [])

	function voteFor(index: number) {
		const oldVote = votedFor
		const newVote = oldVote === index ? -1 : index
		calcAndSetNewVotes(oldVote, newVote)
		setVotedFor(newVote)
		socket.emit(EVENTS.CLIENT.toServer.voteGameSignal, oldVote, newVote)
	}

	return (
		<div className={styles.grid}>
			{gameList.map((game, index) => {
				return (
					<button
						className={styles.cell}
						key={index}
						onClick={(e) => {
							e.preventDefault()
							isHost ? loadGame(index) : voteFor(index)
						}}>
						<div className={styles.image + ' ' + game.style}>
							<Image src={game.img} width='300' height='180' alt='' />
						</div>
						<div className={styles.title}>
							{game.title} {votes[index] > 0 && <span>&#10084; {votes[index]}</span>}
						</div>
					</button>
				)
			})}
		</div>
	)
}
