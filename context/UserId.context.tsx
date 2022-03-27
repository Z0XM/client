import { createContext, ReactNode, useContext, useEffect } from 'react'

import { nanoid } from 'nanoid'

const userId = nanoid()

const UserIdContext = createContext<string>(userId)

function UserIdProvider(props: any) {
	return <UserIdContext.Provider value={userId} {...props} />
}

export const useUserId = () => useContext(UserIdContext)

export default UserIdProvider
