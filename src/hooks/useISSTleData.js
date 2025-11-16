import { useMemo, useState, useEffect } from 'react'
import * as satellite from 'satellite.js'
import { fetchISS_TLE } from '../data/fetchTle'

export function useISSTleData() {
	const [percent, setPercent] = useState(0)
	const [orbitNumberToday, setOrbitNumberToday] = useState(0)
	const [tleLines, setTleLines] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	
	// Fetch des données TLE
	useEffect(() => {
		const getTLE = async () => {
			try {
				setLoading(true)
				const lines = await fetchISS_TLE()
				setTleLines(lines)
				setError(null)
			} catch (err) {
				setError(err.message)
				console.error('Error fetching TLE:', err)
			} finally {
				setLoading(false)
			}
		}
		
		getTLE()
	}, [])
	
	const satrec = useMemo(() => {
		if (!tleLines) return null
		const [l1, l2] = tleLines
		return satellite.twoline2satrec(l1, l2)
	}, [tleLines])
	
	// Calcul des propriétés orbitales
	const inclination = satrec ? satrec.inclo * (180 / Math.PI) : 0
	const meanMotion = satrec ? satrec.no * (1440 / (2 * Math.PI)) : 0 // rad/min to rev/day
	const orbitPeriodSec = satrec ? (24 * 3600) / meanMotion : 0
	
	useEffect(() => {
		if (!satrec || orbitPeriodSec === 0) return
		
		const update = () => {
			const now = new Date()
			
			// Progression dans l'orbite
			const t = satellite.jday(
				now.getUTCFullYear(),
				now.getUTCMonth() + 1,
				now.getUTCDate(),
				now.getUTCHours(),
				now.getUTCMinutes(),
				now.getUTCSeconds()
			)
			const eci = satellite.propagate(satrec, now)
			if (eci && eci.position) {
				const tsince = (t - satrec.jdsatepoch) * 1440 // minutes since TLE epoch
				const frac = (tsince % (orbitPeriodSec / 60)) / (orbitPeriodSec / 60)
				setPercent(frac * 100)
			}
			
			// Numéro de l'orbite du jour
			const nowUTC = now.getTime()
			const midnightUTC = new Date(Date.UTC(
				now.getUTCFullYear(),
				now.getUTCMonth(),
				now.getUTCDate()
			)).getTime()
			const secondsSinceMidnight = (nowUTC - midnightUTC) / 1000
			const orbitNum = Math.floor(secondsSinceMidnight / orbitPeriodSec) + 1
			setOrbitNumberToday(orbitNum)
		}
		
		update()
		const iv = setInterval(update, 1000)
		return () => clearInterval(iv)
	}, [satrec, orbitPeriodSec])
	
	return {
		inclination,
		orbitPeriodSec,
		percent,
		orbitNumberToday,
		loading,
		error,
		tleData: tleLines
	}
}