import Image from 'next/image'
import { useEffect, useState } from 'react'

import { useRoomData } from '../context/RoomData.context'
import { gameTitles, getGameSVG, getGameStyle } from './games/games'

import styles from '../styles/GameGrid.module.css'
import { useSockets } from '../utils/Socket.util'

interface ComponentArgs {
	loadGame: (index: number) => void
}

export default function GameGrid({ loadGame }: ComponentArgs) {
	const socket = useSockets()
	const { isHost } = useRoomData()!

	const [votedFor, setVotedFor] = useState(-1)
	const [votes, setVotes] = useState([...Array(gameTitles.length).fill(0)])

	function calcAndSetNewVotes(oldVote: number, newVote: number) {
		setVotes((oldVotes) => {
			const newVotes = [...oldVotes]
			if (oldVote != -1) newVotes[oldVote]--
			if (newVote != -1) newVotes[newVote]++
			return newVotes
		})
	}

	useEffect(() => {
		const listener = socket.onEvent('voteGameAction', calcAndSetNewVotes)

		return () => {
			listener.off()
		}
	}, [])

	function voteFor(index: number) {
		const oldVote = votedFor
		const newVote = oldVote === index ? -1 : index
		calcAndSetNewVotes(oldVote, newVote)
		setVotedFor(newVote)
		socket.emitEvent('voteGameSignal', oldVote, newVote)
	}

	return (
		<div className={styles.grid}>
			{gameTitles.map((title, index) => {
				return (
					<button
						className={styles.cell}
						key={index}
						onClick={(e) => {
							e.preventDefault()
							isHost ? loadGame(index) : voteFor(index)
						}}>
						<div className={styles.image + ' ' + getGameStyle(index)}>
							<Image src={getGameSVG(index)} width='300' height='180' alt='' />
						</div>
						<div className={styles.title}>
							{title} {votes[index] > 0 && <span>&#10084; {votes[index]}</span>}
						</div>
					</button>
				)
			})}
		</div>
	)
}
