import { createContext, useContext } from 'react'

interface RoomData {
	code: string
	isHost: boolean
	userName: string
}

export const RoomDataContext = createContext<RoomData | null>(null)

export const useRoomData = () => useContext(RoomDataContext)
