import { useState, useEffect } from 'react'
import { useUsers } from '../../context/Users.context'

import styles from '../../styles/chatPane/PlayerList.module.css'
import { useSockets } from '../../utils/Socket.util'

interface ComponentArgs {
	playerListVisible: boolean
	togglePlayerVisiblity: () => void
}

interface User {
	userId: string
	userName: string
}

export default function PlayerList({ playerListVisible, togglePlayerVisiblity }: ComponentArgs) {
	const users = useUsers()!

	return (
		<div className={styles.players + ' ' + (playerListVisible ? styles.open : styles.close)}>
			<div className={styles.topBar}>
				<button
					className={styles.players_title + ' ' + (playerListVisible ? styles.open : styles.close)}
					onClick={togglePlayerVisiblity}>
					{users.players.length + users.spectators.length} Players
				</button>
			</div>
			<div className={styles.player_list + ' ' + (playerListVisible ? styles.open : styles.close)}>
				{/* <div className={styles.hostName}>{users.host.userName}</div> */}
				{users.players.map((user, index) => {
					return user.userId != users.host.userId ? (
						<div className={styles.playerName} key={index}>
							{user.userName}
						</div>
					) : (
						<div className={styles.hostName + ' ' + styles.playerName} key={index}>
							{users.host.userName}
						</div>
					)
				})}
				{users.spectators.map((user, index) => {
					return user.userId != users.host.userId ? (
						<div className={styles.spectatorName} key={index + users.players.length}>
							{user.userName}
						</div>
					) : (
						<div
							className={styles.hostName + ' ' + styles.spectatorName}
							key={index + users.players.length}>
							{users.host.userName}
						</div>
					)
				})}
			</div>
		</div>
	)
}
