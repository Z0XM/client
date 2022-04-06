import { createContext, useContext } from 'react'

export interface User {
	userId: string
	userName: string
}
export interface Users {
	host: User
	players: User[]
	spectators: User[]
	shiftToAndEmit: (target: 'Player' | 'Spectator') => void
}

export const UsersContext = createContext<Users | null>(null)

export const useUsers = () => useContext(UsersContext)
