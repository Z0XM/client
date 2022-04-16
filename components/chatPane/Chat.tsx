import { useEffect, useRef, useState } from 'react'
import { useChats } from '../../context/Chat.context'
import { useRoomData } from '../../context/RoomData.context'

import styles from '../../styles/chatPane/Chat.module.css'
import { useSockets } from '../../utils/Socket.util'
import { useUserId } from '../../utils/UserId.util'

interface ComponentArgs {
	playerListVisible: boolean
}

export default function Chat({ playerListVisible }: ComponentArgs) {
	const socket = useSockets()
	const { userName } = useRoomData()!
	const { chats, addChat, chatDisabled, chatAutoEmit } = useChats()!

	const messageAreaRef = useRef<HTMLDivElement>(null)
	const textAreaRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		const listener = socket.onEvent('chatMsgReceive', (sender, msg) => {
			addChat({ sender, msg })
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
		if (!chatDisabled) {
			if (chatAutoEmit) socket.emitEvent('chatMsgSend', userName, msg)
			addChat({ sender: userName, msg })
		}
	}

	return (
		<>
			<div
				ref={messageAreaRef}
				className={styles.messages + ' ' + (playerListVisible ? styles.close : styles.open)}>
				{chats.map((chat, index, arr) => {
					return (
						<div
							className={
								chat.sender === 'system'
									? styles.system
									: chat.sender === userName
									? styles.self
									: styles.other
							}
							key={index}>
							<div className={styles.msgArea}>
								{index > 0 && chat.sender != arr[index - 1].sender && chat.sender != 'system' && (
									<div className={styles.sender}>
										{chat.sender === 'self' ? userName : chat.sender}
									</div>
								)}
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
					disabled={chatDisabled}
				/>
			</form>
		</>
	)
}
