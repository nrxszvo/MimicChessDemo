import type { Game } from '$lib/interfaces';
import type { Api as CgApi } from 'chessground/api';
import type { Config as CgConfig } from 'chessground/config';
import type { Stream } from '$lib/ndJsonStream';
import type { Color, Key } from 'chessground/types';
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

export class GameCtrl implements BoardCtrl {
	game: Game;
	pov: Color;
	chess: Chess = Chess.default();
	lastMove?: [Key, Key];
	lastUpdateAt: number = Date.now();
	ground?: CgApi;
	redrawInterval: ReturnType<typeof setInterval>;
	whiteEloEst: any = 'tbd';
	blackEloEst: any = 'tbd';
	constructor(
		game: Game,
		readonly stream: Stream,
		auth: Auth
	) {
		this.game = game;
		this.auth = auth;
		this.pov = this.game.black.id == auth.me?.id ? 'black' : 'white';
		this.onUpdate();
		//this.redrawInterval = setInterval(root.redraw, 100);
	}

	onUnmount = () => {
		this.stream.close();
		//clearInterval(this.redrawInterval);
	};

	private onUpdate = () => {
		const setup =
			this.game.initialFen == 'startpos'
				? defaultSetup()
				: parseFen(this.game.initialFen).unwrap();
		this.chess = Chess.fromSetup(setup).unwrap();
		const moves = this.game.state.moves.split(' ').filter((m: string) => m);
		moves.forEach((uci: string) => this.chess.play(parseUci(uci)!));
		const lastMove = moves[moves.length - 1];
		this.lastMove = lastMove && [lastMove.substr(0, 2) as Key, lastMove.substr(2, 2) as Key];
		this.lastUpdateAt = Date.now();
		this.ground?.set(this.chessgroundConfig());
		if (this.chess.turn == this.pov) this.ground?.playPremove();
	};

	timeOf = (color: Color) => this.game.state[`${color[0]}time`];

	userMove = async (orig: Key, dest: Key) => {
		this.ground?.set({ turnColor: opposite(this.pov) });
		await this.auth.fetchBody(`/api/board/game/${this.game.id}/move/${orig}${dest}`, {
			method: 'post'
		});
	};

	resign = async () => {
		await this.auth.fetchBody(`/api/board/game/${this.game.id}/resign`, {
			method: 'post'
		});
	};

	playing = () => this.game.state.status == 'started';

	chessgroundConfig = () => ({
		orientation: this.pov,
		fen: makeFen(this.chess.toSetup()),
		lastMove: this.lastMove,
		turnColor: this.chess.turn,
		check: !!this.chess.isCheck(),
		movable: {
			free: false,
			color: this.playing() ? this.pov : undefined,
			dests: chessgroundDests(this.chess)
		},
		events: {
			move: this.userMove
		}
	});

	setGround = (cg: CgApi) => (this.ground = cg);

	static open = (id: string, auth: Auth): Promise<GameCtrl> =>
		new Promise<GameCtrl>(async (resolve) => {
			let ctrl: GameCtrl;
			let stream: Stream;
			const handler = (msg: any) => {
				if (ctrl) ctrl.handle(msg);
				else {
					// Gets the gameFull object from the first message of the stream,
					// make a GameCtrl from it, then forward the next messages to the ctrl
					ctrl = new GameCtrl(msg, stream, auth);
					resolve(ctrl);
				}
			};
			stream = await auth.openStream(`/api/board/game/stream/${id}`, {}, handler);
		});

	registerEloCallBack = (callback) => (this.eloCallback = callback);

	private handle = (msg: any) => {
		switch (msg.type) {
			case 'gameFull':
				this.game = msg;
				this.onUpdate();
				//this.root.redraw();
				break;
			case 'gameState':
				this.game.state = msg;
				this.onUpdate();
				//this.root.redraw();
				break;
			case 'chatLine':
				var info = JSON.parse(msg.text);
				console.log(info);
				const toEstStr = (data) => {
					let [m, s] = data;
					return m.toString() + ' +/- ' + s.toString();
				};
				if (this.eloCallback) {
					this.eloCallback({
						welo: toEstStr(info.WhiteElo),
						belo: toEstStr(info.BlackElo)
					});
				}
			default:
				console.error(`Unknown message type: ${msg.type}`, msg);
		}
	};
}
