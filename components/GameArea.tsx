import WordBomb from './games/WordBomb/WordBomb'

import { useState, useEffect } from 'react'

import { useRoomData } from '../context/RoomData.context'

import styles from '../styles/GameArea.module.css'

import { GameInfoContext } from '../context/GameInfo.context'
import { gameTitles, getGameStyle, getGameSVG } from './games/games'
import DrawItOut from './games/DrawItOut/DrawItOut'

interface ComponentArgs {
	loadGameList: () => void
	gameIndex: number
}

function GameArea({ loadGameList, gameIndex }: ComponentArgs) {
	const { isHost } = useRoomData()!

	const getDefaultBackAction = () => loadGameList

	const [backAction, setBackAction] = useState(getDefaultBackAction)

	return (
		<>
			<button className={styles.backButton + (isHost ? '' : ' ' + styles.notHost)} onClick={backAction}>
				&#x25c0; Back
			</button>
			<div className={styles.area}>
				<GameInfoContext.Provider
					value={{
						gameData: {
							index: gameIndex,
							title: gameTitles[gameIndex],
							img: getGameSVG(gameIndex),
							style: getGameStyle(gameIndex, true)
						},
						setBackAction,
						getDefaultBackAction
					}}>
					{gameIndex == 0 && <WordBomb />}
					{gameIndex == 1 && <DrawItOut />}
				</GameInfoContext.Provider>
			</div>
		</>
	)
}

export default GameArea
