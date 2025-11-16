// utils/fetchTle.js
export async function fetchISS_TLE() {
	const res = await fetch('https://iss-tle.powertubeee.workers.dev/')
	if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
	const data = await res.text()
	const lines = data.trim().split('\n')
	return [lines[0], lines[1]] // Ligne 1 et ligne 2
}
