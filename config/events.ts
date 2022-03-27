const EVENTS = {
	CLIENT: {
		toServer: {
			setUserId: 'set-user-id',
			joinRoom: 'join-room',
			createRoom: 'create-room',
			getRoomList: 'get-room-list',
			getPlayerNames: 'get-player-names',
			chatMessageSend: 'chat-msg-s',
			loadGameSignal: 'load-game-s',
			voteGameSignal: 'vote-game-s',
			getPlayersMap: 'get-players-map',
			leftRoom: 'left-room',
			deleteRoom: 'delete-room',
			Games: {
				WordGame: {
					menuStateSignal: 'wg-menu-state-s',
					runningStateSignal: 'wg-running-state-s',
					submitWordSignal: 'wg-submit-word-s',
					isWordReal: 'wg-is-word-real'
				}
			}
		},
		fromServer: {
			setPlayerNames: 'set-player-names',
			chatMessageReceive: 'chat-msg-r',
			loadGameAction: 'load-game-a',
			voteGameAction: 'vote-game-a',
			leaveRoom: 'leave-room',
			playerLeft: 'player-left',
			Games: {
				WordGame: {
					menuStateAction: 'wg-menu-state-a',
					runningStateAction: 'wg-running-state-a',
					submitWordAction: 'wg-submit-word-a'
				}
			}
		}
	}
}
export default EVENTS
