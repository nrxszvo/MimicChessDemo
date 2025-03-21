import type { Game } from '$lib/interfaces';
import type { Api as CgApi } from 'chessground/api';
import type { Config as CgConfig } from 'chessground/config';
import type { Stream } from '$lib/ndJsonStream';
import type { Color, Key } from 'chessground/types';

import { readStream } from '$lib/ndJsonStream';
import { opposite, parseUci } from 'chessops/util';
import { Chess, defaultSetup } from 'chessops';
import { makeFen, parseFen } from 'chessops/fen';
import { chessgroundDests } from 'chessops/compat';

export interface BoardCtrl {
	chess: Chess;
	ground?: CgApi;
	chessgroundConfig: () => CgConfig;
	setGround: (cg: CgApi) => void;
}

export interface GameCtrl extends BoardCtrl {
	timeOf: (color) => number;
	pov: Color;
	playing: Boolean;
	status: string;
	game: Game;
	lastUpdateAt: () => Date;
	welo: Array;
	belo: Array;
	userMove: (orig: Key, dest: Key) => void;
	resign: () => Promise;
	watchOnly: boolean;
	arrowLeft: () => void;
	arrowRight: () => void;
	arrowUp: () => void;
	arrowDown: () => void;
}

export async function createCtrl(
	gameId: string,
	color: Color,
	ctrlType: 'game' | 'watch',
	auth: Auth,
	fetch,
	name: string
): GameCtrl {
	let status = $state('init');
	let welo = $state(null);
	let belo = $state(null);
	let moves = [];
	let nDisplayMoves = 0;
	let seeking = $state(false);
	let pov = color;
	let game = $state(null);
	let chess = Chess.default();
	let lastMove = null;
	let ground = null;
	let lastUpdateAt = null;
	const viewOnly = ctrlType == 'watch';

	const handle = (msg: any) => {
		switch (msg.type) {
			case 'gameFull':
				game = msg;
				status = game.state.status;
				onUpdate();
				break;
			case 'gameState':
				game.state = msg;
				status = game.state.status;
				onUpdate();
				break;
			case 'chatLine':
				break;
				if (msg.username == 'mimicTestBot') {
					let info = JSON.parse(msg.text);
					welo = info.weloParams;
					belo = info.beloParams;
				}
				break;
			default:
				break;
		}
	};

	const setPov = (game: Game) => {
		if (game.white.title == 'BOT' && game.black.title == 'BOT') {
			if (game.white.name == 'mimicTestBot') {
				return 'white';
			} else {
				return 'black';
			}
		} else if (game.white.title == 'BOT') {
			return 'black';
		} else {
			return 'white';
		}
	};

	const handler = (msg: any, stream: ReadableStream) => {
		if (!game) {
			game = msg;
			pov = setPov(game);
		}
		handle(msg);
	};

	async function initWatchStream(gameId: string, fetch) {
		const resp = await fetch('/api/openStream', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({ api: `bot/game/stream/${gameId}` })
		});
		if (resp.ok) {
			const stream = readStream(name + '-botgame', resp, handler);
			const start = new Date();
			stream.closePromise.then(() => {
				const now = new Date();
				const ms = now.getTime() - start.getTime();
				if (status == 'started' && ms > 500) initWatchStream(gameId, fetch);
				else {
					//console.log(`not reopening ${name} because status=${status} or ms=${ms}`);
				}
			});
		} else {
			status = 'invalid game';
		}
	}

	async function initGameStream(gameId: string, auth: Auth) {
		await auth.openStream(`/api/board/game/stream/${gameId}`, {}, handler, false, false);
	}

	const setBoard = () => {
		const setup =
			game.initialFen == 'startpos' ? defaultSetup() : parseFen(game.initialFen).unwrap();
		chess = Chess.fromSetup(setup).unwrap();
		moves.forEach((uci: string, i: number) => {
			if (!seeking || i < nDisplayMoves) chess.play(parseUci(uci)!);
		});
		lastMove = moves[nDisplayMoves - 1];
		lastMove = lastMove && [lastMove.substr(0, 2) as Key, lastMove.substr(2, 2) as Key];
		ground?.set(chessgroundConfig());
		fetch('/api/getElo', {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({ gameId: game.id })
		}).then((resp) => {
			resp.json().then((rec) => {
				const get_ms = (elos, idx) => {
					return {
						m: parseInt(elos[idx]),
						s: parseInt(elos[idx + 1])
					};
				};
				if (nDisplayMoves % 2 == 1) {
					welo = get_ms(rec.welo.split(','), nDisplayMoves + 1);
					belo = get_ms(rec.belo.split(','), nDisplayMoves + 1);
				} else {
					welo = get_ms(rec.welo.split(','), nDisplayMoves);
					belo = get_ms(rec.belo.split(','), nDisplayMoves);
				}
			});
		});
	};

	const arrowLeft = () => {
		seeking = true;
		nDisplayMoves = Math.max(0, nDisplayMoves - 1);
		setBoard();
	};
	const arrowRight = () => {
		nDisplayMoves = Math.min(moves.length, nDisplayMoves + 1);
		if (nDisplayMoves == moves.length) seeking = false;
		setBoard();
	};
	const arrowUp = () => {
		seeking = false;
		nDisplayMoves = moves.length;
		setBoard();
	};
	const arrowDown = () => {
		seeking = true;
		nDisplayMoves = 0;
		setBoard();
	};
	const onUpdate = () => {
		moves = game.state.moves.split(' ').filter((m: string) => m);
		if (!seeking) nDisplayMoves = moves.length;
		lastUpdateAt = Date.now();
		setBoard();
		if (chess.turn == pov) ground?.playPremove();
	};
	const turn = () => {
		if (moves.length % 2 == 0) return 'white';
		else return 'black';
	};

	const chessgroundConfig = () => ({
		orientation: pov,
		fen: makeFen(chess.toSetup()),
		lastMove: lastMove,
		turnColor: chess.turn,
		check: !!chess.isCheck(),
		viewOnly: viewOnly,
		draggable: {
			enabled: !viewOnly
		},
		selectable: {
			enabled: !viewOnly
		},
		movable: {
			free: false,
			color: status == 'started' ? pov : undefined,
			dests: chessgroundDests(chess)
		},
		events: {
			move: viewOnly ? null : userMove
		},
		highlight: {
			lastMove: true,
			check: true
		}
	});

	const timeOf = (color: Color) => game.state[`${color[0]}time`];

	const userMove = async (orig: Key, dest: Key) => {
		if (!viewOnly) {
			ground?.set({ turnColor: opposite(pov) });
			await auth.fetchBody(`/api/board/game/${game.id}/move/${orig}${dest}`, {
				method: 'post'
			});
		}
	};

	const resign = async () => {
		if (!viewOnly) {
			await auth.fetchBody(`/api/board/game/${game.id}/resign`, {
				method: 'post'
			});
		}
	};

	if (viewOnly) {
		await initWatchStream(gameId, fetch);
	} else {
		await initGameStream(gameId, auth);
	}

	return {
		chessgroundConfig,
		timeOf,
		get game() {
			return game;
		},
		get pov() {
			return pov;
		},
		get playing() {
			return status == 'started';
		},
		get status() {
			return status;
		},
		get chess() {
			return chess;
		},
		get lastUpdateAt() {
			return lastUpdateAt;
		},
		setGround: (cg: CgApi) => (ground = cg),
		get welo() {
			return welo;
		},
		get belo() {
			return belo;
		},
		userMove,
		resign,
		get watchOnly() {
			return viewOnly;
		},
		arrowLeft,
		arrowRight,
		arrowUp,
		arrowDown,
		get turn() {
			return turn();
		},
		get seeking() {
			return seeking;
		}
	};
}
