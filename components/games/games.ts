import gameStyles from '../../styles/games/GameTitles.module.css'

export const gameTitles = [
	'WordBomb',
	'ComingSoon',
	'ComingSoon',
	'ComingSoon',
	'ComingSoon',
	'ComingSoon',
	'ComingSoon'
]

const minPlayersRequired = [2, 1, 1, 1, 1, 1, 1]

export function getGameSVG(index: number) {
	return `/svg/${gameTitles[index]}.svg`
}

export function getGameStyle(index: number) {
	return gameStyles[gameTitles[index]]
}

export function getMinimumRequiredPlayers(index: number) {
	return minPlayersRequired[index]
}
