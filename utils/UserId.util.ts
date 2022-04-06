import { nanoid } from 'nanoid'

const userId = nanoid()

export function useUserId() {
	return userId
}
