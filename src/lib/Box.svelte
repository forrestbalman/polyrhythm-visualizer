<script>
	import { removeBox, activeBox, play, currentID } from "$lib/index.js"

	export let box
	let { id, color, subdivision, counter } = box
	let settings = false

	$: if (box) {
		subdivision = box.subdivision
		counter = box.counter
	}

	function remove() {
		removeBox(id)
		play.set(false)
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if !$play}
	<div
		class="box rounded-3 p-4 d-flex gap-3 flex-column align-items-center position-relative z-0"
		style="{$currentID === id ? 'background: #' + color + '; border: 4px solid #212529;' : 'background: #212529; border: 4px solid #' + color + ';'}"
		on:click="{() => activeBox(id)}"
		on:mouseenter="{() => (settings = true)}"
		on:mouseleave="{() => (settings = false)}">
		<button
			class="btn bg-danger position-absolute rounded-circle p-0 m-0 d-flex justify-content-center align-items-center text-light z-2"
			disabled="{$play}"
			on:click="{remove}">
			<i class="bi bi-x"></i>
		</button>
		<div class="position-absolute top-50 start-50 translate-middle w-100 h-100 d-flex justify-content-center align-items-center">
			{#if settings}
				<i class="text-light bi bi-sliders fs-1"></i>
			{:else}
				<div class="d-flex flex-column justify-content-evenly align-items-center">
					<p class="text-light m-0 fs-1 fw-light">{subdivision + 1}</p>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div
		class="box rounded-3 p-4 d-flex gap-3 flex-column align-items-center position-relative z-0"
		style="{'border: 4px solid #212529;'}"
		on:click="{() => activeBox(id)}"
		on:mouseenter="{() => (settings = true)}"
		on:mouseleave="{() => (settings = false)}">
		<div class="position-absolute top-50 start-50 translate-middle w-100 h-100 d-flex rounded-2">
			{#each Array(subdivision + 1) as _, i}
				<div
					class="h-100"
					style="width: calc(100% / {subdivision + 1}); background: {i <= counter ? '#' + color : '#212529'}; {i === 0
						? 'border-top-left-radius: 4px; border-bottom-left-radius: 4px;'
						: ''};
						{i === subdivision ? 'border-top-right-radius: 4px; border-bottom-right-radius: 4px;' : ''};">
				</div>
			{/each}
		</div>
		<div class="icon-wrapper position-absolute top-50 start-50 bg-dark translate-middle d-flex justify-content-center align-items-center rounded-2">
			{#if settings}
				<i class="text-light bi bi-sliders fs-1"></i>
			{:else}
				<div class="d-flex flex-column justify-content-evenly align-items-center">
					<p class="text-light m-0 fs-1 fw-light">{counter + 1}</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.box {
		width: 200px;
		height: 200px;
		cursor: pointer;
	}

	@media (max-width: 576px) {
		.box {
			width: 200px;
			height: 200px;
		}
	}

	button {
		width: 24px;
		height: 24px;
		top: -10px;
		right: -10px;
	}

	.icon-wrapper {
		width: 50px;
		height: 50px;
	}
</style>
