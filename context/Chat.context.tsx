import { createContext, Dispatch, SetStateAction, useContext } from 'react'

export interface Chat {
	sender: string
	msg: string
}
interface ChatType {
	chats: Chat[]
	addChat: (chat: Chat) => void
	chatDisabled: boolean
	disableChat: (disable: boolean) => void
	chatAutoEmit: boolean
	disableChatAutoEmit: (disable: boolean) => void
}

export const ChatContext = createContext<ChatType | null>(null)

export const useChats = () => useContext(ChatContext)
