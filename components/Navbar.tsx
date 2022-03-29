import { useRoomData } from '../context/RoomData.context'
import styles from '../styles/Navbar.module.css'
import { useRouter } from 'next/router'

export default function Navbar() {
	const router = useRouter()
	const { code } = useRoomData()!

	return (
		<div className={styles.navbar}>
			<button className={styles.title} onClick={() => router.replace('/')}>
				ZAMES
			</button>
			<div className={styles.link}>
				<button
					onClick={(e) => {
						navigator.clipboard.writeText(`${window.location.host}/?code=${code}`)
					}}>
					&#128203; Copy Link
				</button>
			</div>
		</div>
	)
}
