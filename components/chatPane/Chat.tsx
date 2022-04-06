import { useEffect, useRef, useState } from 'react'
import { useRoomData } from '../../context/RoomData.context'

import styles from '../../styles/chatPane/Chat.module.css'
import { useSockets } from '../../utils/Socket.util'

interface ComponentArgs {
	playerListVisible: boolean
}

export default function Chat({ playerListVisible }: ComponentArgs) {
	const socket = useSockets()
	const { userName } = useRoomData()!

	const messageAreaRef = useRef<HTMLDivElement>(null)
	const textAreaRef = useRef<HTMLTextAreaElement>(null)

	const [chats, setChats] = useState<{ sender: string; msg: string }[]>([])

	useEffect(() => {
		const listener = socket.onEvent('chatMsgReceive', (sender, msg) => {
			setChats((oldChats) => [...oldChats, { sender, msg }])
		})

		if (messageAreaRef.current) {
			messageAreaRef.current.addEventListener('DOMNodeInserted', () => {
				messageAreaRef.current!.scroll({ top: messageAreaRef.current!.scrollHeight, behavior: 'smooth' })
			})

			messageAreaRef.current.addEventListener('click', () => {
				textAreaRef.current!.focus()
			})
		}

		return () => {
			listener.off()
		}
	}, [])

	function sendText(msg: string) {
		socket.emitEvent('chatMsgSend', userName, msg)
		setChats((oldChats) => [...oldChats, { sender: 'self', msg }])
	}

	return (
		<>
			<div
				ref={messageAreaRef}
				className={styles.messages + ' ' + (playerListVisible ? styles.close : styles.open)}>
				{chats.map((chat, index) => {
					return (
						<div
							className={
								chat.sender === 'system'
									? styles.system
									: chat.sender === 'self'
									? styles.self
									: styles.other
							}
							key={index}>
							<div className={styles.msgArea}>
								<div className={styles.sender}>
									{chat.sender === 'system' ? '' : chat.sender === 'self' ? userName : chat.sender}
								</div>
								<div className={styles.msg}>{chat.msg}</div>
							</div>
						</div>
					)
				})}
			</div>
			<form className={styles.input_container}>
				<textarea
					ref={textAreaRef}
					placeholder='Type Your Message'
					onKeyPress={(e) => {
						if (e.key == 'Enter' && !e.shiftKey) {
							e.preventDefault()
							sendText(textAreaRef.current!.value)
							textAreaRef.current!.value = ''
						}
					}}
				/>
			</form>
		</>
	)
}
