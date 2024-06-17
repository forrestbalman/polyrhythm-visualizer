<script>
	import Box from "$lib/Box.svelte"
	import Knob from "$lib/Knob.svelte"
	import { audio, boxes, makeBox, tempo, volume, play, currentID, samplerLoaded, totalBeats, beat } from "$lib/index.js"

	function playSound() {
		$play = !$play
	}

	function clear() {
		boxes.set([])
	}
</script>

<main>
	{#if !$audio}
		<div class="min-vh-100 d-flex flex-column justify-content-center align-items-center gap-5 py-5">
			<h1 class="display-1 text-center fw-light text-light">Polyrhyhm Visualizer</h1>
			<button class="btn btn-dark border-0 shadow fs-2 fw-light px-3" on:click="{() => audio.set(true)}">Start</button>
		</div>
	{:else}
		<div class="min-vh-100 py-5">
			<div class="container d-flex flex-column align-items-center gap-5">
				<div class="w-100">
					<div class="controls w-100 d-flex flex-wrap justify-content-center align-items-center gap-3">
						<div class="button-wrapper d-flex flex-column align-items-center justify-content-around">
							<button class="w-100 h-100 border-0 rounded-circle shadow bg-dark" disabled="{$boxes.length === 0}" on:click="{playSound}">
								{#if $play}
									<i class="bi bi-stop-fill fs-1 text-light"></i>
								{:else}
									<i class="bi bi-play-fill fs-1 text-light"></i>
								{/if}
							</button>
						</div>
						<div class="button-wrapper d-flex flex-column align-items-center justify-content-around">
							<input class="tempo form-range w-100" type="range" min="42" max="240" step="1" bind:value="{$tempo}" />
							<p class="text-light text-center fw-light m-0">{$tempo} bpm</p>
							<input class="tempo form-range w-100" type="range" min="-70" max="0" step="0.01" bind:value="{$volume}" />
							<p class="text-light text-center fw-light m-0">{Math.round((($volume + 70) / 70) * 100)}% volume</p>
						</div>
						{#if !$play}
							<div class="button-wrapper d-flex flex-column justify-content-center align-items-center gap-2">
								<input class="form-control w-100 fw-light" type="number" min="1" max="64" step="1" bind:value="{$totalBeats}" />
								<select class="form-control w-100 fw-light" bind:value="{$beat}">
									<option class="fw-light" value="1">1</option>
									<option class="fw-light" value="2">2</option>
									<option class="fw-light" value="4">4</option>
									<option class="fw-light" value="8">8</option>
									<option class="fw-light" value="16">16</option>
									<option class="fw-light" value="32">32</option>
								</select>
							</div>
						{/if}
						{#if !$play}
							<div class="button-wrapper d-flex justify-content-center align-items-center">
								<button class="w-100 h-100 border-0 bg-danger rounded-circle shadow fs-1" disabled="{$boxes.length === 0}" on:click="{clear}">
									<i class="bi bi-trash text-light"></i>
								</button>
							</div>
						{/if}
					</div>
				</div>
				<div class="row w-100 gy-5">
					<div class="col-12 col-lg-10 order-2 order-lg-1">
						<div class="d-flex justify-content-center align-items-center flex-wrap gap-5">
							{#each $boxes as box (box.id)}
								<Box {box} />
							{/each}
							{#if !$play && $boxes.length < 8}
								<div class="button-wrapper d-flex justify-content-center align-items-center">
									<button class="w-100 h-100 border-0 rounded-circle shadow bg-dark" on:click="{makeBox}">
										<i class="bi bi-plus fs-1 text-light"></i>
									</button>
								</div>
							{/if}
						</div>
					</div>
					<div class="col-12 col-lg-2 order-1 order-lg-2">
						{#if $currentID && $boxes.length > 0}
							<div class="d-flex flex-lg-column flex-wrap justify-content-center align-items-center gap-3">
								<Knob control="volume" />
								<Knob control="sound" />
								<Knob control="subdivision" />
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	main {
		background: #4e4e4e;
	}

	.button-wrapper {
		width: 90px;
		height: 90px;
	}
</style>
