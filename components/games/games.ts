import gameStyles from '../../styles/games/GameTitles.module.css'

export const gameTitles = [
	'WordBomb',
	'DrawItOut',
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

export function getGameStyle(index: number, forMenu: boolean) {
	return gameStyles[gameTitles[index]] + (forMenu ? ' ' + gameStyles.Menu : '')
}

export function getMinimumRequiredPlayers(index: number) {
	return minPlayersRequired[index]
}
