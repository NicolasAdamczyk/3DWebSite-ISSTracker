// src/components/IssPassPredictor.jsx

import { useEffect } from 'react'
import * as satellite from 'satellite.js'
import { fetchISS_TLE } from '../data/fetchTle'

const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

function getDistanceKm(lat1, lon1, lat2, lon2) {
	const R = 6371
	const dLat = (lat2 - lat1) * DEG2RAD
	const dLon = (lon2 - lon1) * DEG2RAD
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1 * DEG2RAD) * Math.cos(lat2 * DEG2RAD) * Math.sin(dLon / 2) ** 2
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c
}

export default function IssPassPredictor({ city, radiusKm = 500, hours = 72, onPrediction }) {
	useEffect(() => {
		if (!city) return
		
		fetchISS_TLE()
			.then(([tleLine1, tleLine2]) => {
				const satrec = satellite.twoline2satrec(tleLine1, tleLine2)
				
				const now = new Date()
				const end = new Date(now.getTime() + hours * 60 * 60 * 1000)
				const step = 10 // 10s steps
				
				let foundPasses = []
				let inPass = false
				let entryTime = null
				let exitTime = null
				
				for (let t = new Date(now); t <= end; t = new Date(t.getTime() + step * 1000)) {
					const pos = satellite.propagate(satrec, t)
					if (!pos.position) continue
					
					const gmst = satellite.gstime(t)
					const { latitude, longitude } = satellite.eciToGeodetic(pos.position, gmst)
					const issLat = latitude * RAD2DEG
					const issLon = longitude * RAD2DEG
					
					const distance = getDistanceKm(city.lat, city.lon, issLat, issLon)
					
					if (distance <= radiusKm) {
						if (!inPass) {
							entryTime = new Date(t)
							inPass = true
						}
						exitTime = new Date(t)
					} else if (inPass) {
						const durationMin = (exitTime - entryTime) / 60000
						foundPasses.push({
							city: city.name,
							lat: city.lat,
							lon: city.lon,
							start: entryTime,
							end: exitTime,
							duration: durationMin,
							radius: radiusKm,
							found: true,
						})
						inPass = false
						entryTime = null
						exitTime = null
					}
				}
				
				if (foundPasses.length > 0) {
					onPrediction(foundPasses)
				} else {
					onPrediction([
						{
							city: city.name,
							found: false,
						},
					])
				}
			})
			.catch(() => {
				onPrediction([
					{
						city: city.name,
						found: false,
					},
				])
			})
	}, [city, radiusKm, hours, onPrediction])
	
	return null
}
