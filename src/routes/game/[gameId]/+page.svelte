<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { opposite } from 'chessops';
	import type { GameCtrl } from '$lib/game.svelte';
	import type { PageProps } from './$types';
	import EloBox from '$lib/EloBox.svelte';
	import Player from '$lib/Player.svelte';
	import Result from '$lib/Result.svelte';
	import Rematch from '$lib/Rematch.svelte';
	import Resign from '$lib/Resign.svelte';
	import Spinner from '$lib/Spinner.svelte';

	let { data }: PageProps = $props();
	let ctrl: GameCtrl = data.ctrl;
	let loading = $state(false);
	let chessground: Chessground | null = $state(null);

	$effect(() => {
		chessground?.set(ctrl.chessgroundConfig());
		ctrl.setGround(chessground);
	});

	let w = $state();
	let h = $state();
</script>

<div class="mx-auto block table max-w-[412px] table-fixed">
	<div class="inline-block table-row" bind:clientHeight={h}>
		<EloBox params={ctrl.welo} elo="welo" {w} {h} />
		<span class="inline-block table-cell align-middle">
			<div class="relative mx-auto w-[200px] md:w-[500px]" bind:clientWidth={w}>
				<Player {ctrl} color={opposite(ctrl.pov)} />
				<Chessground bind:this={chessground} />
				<Player {ctrl} color={ctrl.pov} />
				<Result {ctrl} />
				{#if loading}
					<div class="absolute top-1/2 left-1/2 z-11 -translate-1/2">
						<Spinner dim="48" />
					</div>
				{/if}
			</div>
		</span>
		<EloBox params={ctrl.belo} elo="belo" {w} {h} />
	</div>
	<div class="inline-block table-row">
		<div class="table-cell"></div>
		<div class="inline-block table-cell text-center align-middle">
			{#if !ctrl.watchOnly && ctrl.status == 'started'}
				<Resign {ctrl} />
			{:else if !['started', 'init'].includes(ctrl.status)}
				<Rematch {ctrl} bind:loading />
			{/if}
		</div>
	</div>
</div>
