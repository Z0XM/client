import { useState } from 'react'

import Chat from './Chat'
import PlayerList from './PlayerList'

import styles from '../../styles/chatPane/ChatPane.module.css'

export default function ChatPane() {
	var [playerListVisible, setPlayerListVisiblity] = useState(false)

	function togglePlayerVisiblity() {
		setPlayerListVisiblity((_) => !_)
	}

	return (
		<div className={styles.container}>
			<div className={styles.area}>
				<PlayerList {...{ playerListVisible, togglePlayerVisiblity }} />
				<Chat {...{ playerListVisible }} />
			</div>
		</div>
	)
}
