<script>
	import { currentID, updateBox, boxes, play } from "$lib/index.js"

	let displayValues
	let currentValue
	let maxValue = 0
	let angle = 45
	let step = 0
	let disabled = false

	export let control
	let color
	$: {
		let box = $boxes.find((box) => box.id === $currentID)
		color = box.color
		switch (control) {
			case "volume":
				currentValue = box.volume
				maxValue = 100
				break
			case "sound":
				currentValue = box.sound
				displayValues = ["Click 1", "Click 2", "Click 3", "Block", "Clap", "Hi-hat", "Kick", "Ride"]
				maxValue = displayValues.length - 1
				break
			case "subdivision":
				currentValue = box.subdivision + 1
				maxValue = 15
				break
		}
		angle = 45 + (270 / maxValue) * currentValue
	}

	$: if ($play) {
		if (control !== "volume") {
			disabled = true
		} else {
			disabled = false
		}
	} else {
		disabled = false
	}

	function mouse(node) {
		node.addEventListener("mousedown", (event) => {
			if (!disabled) {
				const rect = node.getBoundingClientRect()
				const x = event.clientX - rect.left
				const y = event.clientY - rect.top
				const center = { x: rect.width / 2, y: rect.height / 2 }
				angle = Math.atan2(y - center.y, x - center.x) * (180 / Math.PI) - 90
				if (angle < 0) {
					angle += 360
				}
				// Calculate snap value
				const snap = 270 / maxValue
				angle = Math.round(angle / snap) * snap
				if (angle < 45) {
					angle = 45
				} else if (angle > 315) {
					angle = 315
				}
				step = Math.round((angle - 45) / (270 / maxValue))
				if (step > maxValue) {
					step = maxValue
				}
				currentValue = step
				updateBox($currentID, control, currentValue)
			}
		})

		node.addEventListener("mousemove", (event) => {
			if (event.buttons === 1 && !disabled) {
				const rect = node.getBoundingClientRect()
				const x = event.clientX - rect.left
				const y = event.clientY - rect.top
				const center = { x: rect.width / 2, y: rect.height / 2 }
				angle = Math.atan2(y - center.y, x - center.x) * (180 / Math.PI) - 90
				if (angle < 0) {
					angle += 360
				}
				// Calculate snap value
				const snap = 270 / maxValue
				angle = Math.round(angle / snap) * snap
				if (angle < 45) {
					angle = 45
				} else if (angle > 315) {
					angle = 315
				}
				step = Math.round((angle - 45) / (270 / maxValue))
				if (step > maxValue) {
					step = maxValue
				}
				currentValue = step
				updateBox($currentID, control, currentValue)
			}
		})
	}
</script>

<div class="d-flex flex-column justify-content-center align-items-center">
	<p class="text-light text-center mb-1 fw-light">{control}</p>
	<div class="position-relative" class:disabled>
		<button class="knob rounded-circle border-0 position-relative shadow" use:mouse style:background="#{color}" style:rotate="{angle}deg">
			<div
				class="inner-circle rounded-circle position-absolute top-50 start-50 translate-middle bg-dark d-flex justify-content-center align-items-center">
			</div>
			<div class="cursor position-absolute">
				<i class="bi bi-play-fill text-dark fs-5"></i>
			</div>
		</button>
		<p class="text-light text-center fw-light m-0 position-absolute top-50 start-50 translate-middle">
			{displayValues ? displayValues[currentValue] : currentValue}
		</p>
	</div>
</div>

<style>
	.knob {
		width: 70px;
		height: 70px;
		transition: background 0.1s;
	}

	.inner-circle {
		width: 60px;
		height: 60px;
	}

	.cursor {
		bottom: -11px;
		right: calc(50% - 11px);
		rotate: 90deg;
		z-index: -1;
	}

	p {
		user-select: none;
	}

	.disabled {
		opacity: 0.5;
	}
</style>
