import { writable, get } from "svelte/store"
import { generateID, generateColor, scaleVolume, getSound, getTimeSignature, getTime } from "$lib/helpers.js"
import * as Tone from "tone"

export const audio = writable(false)
export const boxes = writable([])
export const currentID = writable(null)
export const samplerLoaded = writable(false)
export const totalBeats = writable(4)
export const beat = writable("4")
export const volume = writable(-6)
export const tempo = writable(120)
export const play = writable(false)

let buffers = ["Click1.mp3", "Click2.mp3", "Click3.mp3", "Block.mp3", "Clap.mp3", "HiHat.mp3", "Kick.mp3", "Ride.mp3"] // these will get turned into Tone.Buffer objects when the Tone.Audio is started
let players = {} // this will store the Tone.Players for each box
let poolSize = 100 // the number of players to create for each box so that players can play their entire soundfile without interruption. This removes clicks, but is a bit of a hack

export function makeBox() {
	// generates a new box with a random ID, color, dial values, and a counter for the current beat
	let box = {
		id: generateID(),
		color: generateColor(),
		volume: 60,
		sound: 0,
		subdivision: 0,
		counter: 0,
	}

	// adds the new box to the boxes store
	boxes.update((arr) => {
		arr.push(box)
		return arr
	})

	// sets the current id to the new boxes id so the dials know what box to alter
	currentID.set(box.id)

	// creates an array of players for the new box
	let playerArray = new Array(poolSize).fill(null).map(() => {
		let player = new Tone.Player(getSound(box.sound)).toDestination()
		player.isPlaying = false // to track if the player is currently playing. player.state doesn't work for some reason
		player.onstop = () => {
			player.isPlaying = false // when the player stops, set isPlaying to false
		}
		return player
	})
	players[box.id] = new Object() // creates a new object in the players object for the new box
	players[box.id].samplers = playerArray // adds the player array to the new object

	// sets the volume for each of the players in the array
	players[box.id].samplers.forEach((player) => {
		player.volume.value = scaleVolume(box.volume)
	})

	// sets an empty eventID for the new box for scheduling the players on playback
	players[box.id].eventID = null
}

export function removeBox(id) {
	boxes.update((currentState) => {
		let box = currentState.find((box) => box.id === id) // finds the box with the matching id

		currentState = currentState.filter((box) => box.id !== id) // removes the box from the array

		if (currentState.length === 0) {
			currentID.set(null) // resets the currentID if there are no boxes left so the dials aren't confused
		} else {
			currentID.set(currentState[currentState.length - 1].id) // otherwise, sets the currentID to the last box in the array
		}

		delete players[box.id] // removes all players for the box

		return currentState
	})
}

export function updateBox(id, control, value) {
	boxes.update((currentState) => {
		let box = currentState.find((box) => box.id === id) // finds the box with the matching id

		if (box[control] !== value) {
			// only updates the store if the value has changed
			box[control] = value

			if (control === "volume") {
				// if the control is volume, update the volume for each player in the box
				players[box.id].samplers.forEach((player) => {
					player.volume.value = scaleVolume(value)
				})
			}

			if (control === "sound") {
				// if the control is sound, update the buffer for each player in the box
				players[box.id].samplers.forEach((player) => {
					player.buffer = buffers[value]
				})
			}

			// subdivision doesn't need any particular action because it's just a number being stored in the boxes store
		}

		return currentState
	})
}

export function activeBox(id) {
	currentID.set(id) // sets the currentID to the id of the box that was clicked
}

async function startAudio() {
	await Tone.start() // starts the audio context
	//all of this has to happen after the audio context is started, otherwise there's no audio context to assign values to
	Tone.getTransport().bpm.value = get(tempo) // sets the transport's bpm to the tempo store
	buffers = buffers.map((buffer) => {
		// turns the buffer strings into Tone.Buffer objects in the buffers array
		return new Tone.ToneAudioBuffer({
			url: buffer,
		})
	})
}

audio.subscribe((audio) => {
	if (audio) {
		// starts the audio context if the audio store is true
		startAudio()
	}
})

tempo.subscribe((tempo) => {
	if (get(audio)) {
		// sets the transport's bpm to the tempo store if the audio store is true
		Tone.getTransport().bpm.value = tempo
	}
})

volume.subscribe((volume) => {
	if (get(audio)) {
		// sets the overall volume of the destination to the volume store if the audio store is true. This is different from the volume of the individual players
		Tone.getDestination().volume.value = volume
	}
})

totalBeats.subscribe(() => {
	if (get(audio)) {
		// sets the time signature of the transport to the totalBeats and beat stores if the audio store is true
		Tone.getTransport().timeSignature = getTimeSignature()
	}
})

beat.subscribe(() => {
	if (get(audio)) {
		// sets the time signature of the transport to the totalBeats and beat stores if the audio store is true
		Tone.getTransport().timeSignature = getTimeSignature()
	}
})

play.subscribe((play) => {
	if (get(audio)) {
		// starts or stops the transport and all boxes player information if the audio store is true
		if (play) {
			// if play is true
			get(boxes).forEach((box) => {
				boxes.update((currentState) => {
					//finds the box with the matching id and resets the counter to 0
					let currentBox = currentState.find((currentBox) => currentBox.id === box.id)
					currentBox.counter = currentBox.subdivision
					return currentState
				})

				// schedules a repeating event for each box
				players[box.id].eventID = Tone.getTransport().scheduleRepeat((time) => {
					// finds the next player that isn't currently playing and starts it
					let nextPlayer = players[box.id].samplers.find((player) => !player.isPlaying)
					// starts the player and sets it to playing
					nextPlayer.start(time)
					nextPlayer.isPlaying = true

					// updates the counter for the box. If the counter is equal to the subdivision, resets the counter to 0. Otherwise, increments the counter
					boxes.update((currentState) => {
						let currentBox = currentState.find((currentBox) => currentBox.id === box.id)
						if (currentBox.counter === currentBox.subdivision) {
							currentBox.counter = 0
						} else {
							currentBox.counter++
						}
						return currentState
					})
				}, getTime(box.subdivision))
			})
			// starts the transport
			Tone.getTransport().start()
		} else {
			// if play is false
			Tone.getTransport().stop() // stops the transport
			Tone.getTransport().cancel() // cancel all events currently scheduled on the transport
			get(boxes).forEach((box) => {
				Tone.getTransport().clear(players[box.id].eventID) // clears the event for each box
			})
		}
	}
})
