import { get } from "svelte/store"
import { totalBeats, beat, tempo } from "$lib/index.js"

export function generateID() {
	return Math.random().toString(36).substring(2, 9) // a random 7 character string with letters and numbers for distinguishing boxes
}

// for storing the last color generated to make sure adjacent boxes are not the same color
let lastColor = null
export function generateColor() {
	let colors = [
		"9d0208", // red
		"dc2f02", // orange
		"805b10", // yellow
		"386641", // green
		"1982c4", // blue
		"8900f2", // purple
		"ff0054", // pink
	]
	colors = colors.filter((color) => color !== lastColor) // removes the last color from the array
	const newColor = colors[Math.floor(Math.random() * colors.length)] // picks a random color from the array
	lastColor = newColor // sets the last color to the new color
	return newColor
}

export function scaleVolume(value) {
	return -70 + (value / 100) * 70 // the argument will be a number from 0 to 100, and this will scale it to -70 to 0 because volume is measured in decibels
}

export function getSound(sound) {
	//returns the name of the sound file based on the number passed in
	switch (sound) {
		case 0:
			return "Click1.mp3"
			break
		case 1:
			return "Click2.mp3"
			break
		case 2:
			return "Click3.mp3"
			break
		case 3:
			return "Block.mp3"
			break
		case 4:
			return "Clap.mp3"
			break
		case 5:
			return "HiHat.mp3"
			break
		case 6:
			return "Kick.mp3"
			break
		case 7:
			return "Ride.mp3"
			break
		default:
			return "Click1.mp3"
			break
	}
}

export function getTimeSignature() {
	return [get(totalBeats), Number(get(beat))] //returns a time signature as an array
}

export function getTime(num) {
	let bpm = get(tempo) // gets the current tempo
	let [beatsPerBar, beatValue] = getTimeSignature() // destructures the time signature
	let barLengthInSeconds = (60 / bpm) * beatsPerBar // calculates the length of a bar in seconds
	return barLengthInSeconds / (num + 1) // returns the length of a beat in seconds (adds 1 to the argument because the subdivision value starts at 0)
}
