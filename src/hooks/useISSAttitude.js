import { useMemo, useState, useEffect } from 'react'
import * as satellite from 'satellite.js'
import { fetchISS_TLE } from '../data/fetchTle'
import * as THREE from "three";

export function useISSAttitude(time = new Date()) {
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
	
	return useMemo(() => {
		if (!tleLines) return null
		
		const [tleLine1, tleLine2] = tleLines
		const satrec = satellite.twoline2satrec(tleLine1, tleLine2)
		
		const positionAndVelocity = satellite.propagate(satrec, time)
		const { position, velocity } = positionAndVelocity
		
		if (!position || !velocity) return null
		
		// Axe Z : vers le centre de la Terre
		const zAxis = new THREE.Vector3(position.x, position.y, position.z).normalize().negate()
		// Axe Y : opposé à la vitesse
		const yAxis = new THREE.Vector3(velocity.x, velocity.y, velocity.z).normalize().negate()
		// Axe X : produit vectoriel y × z
		const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize()
		
		// Construction matrice de rotation (base locale)
		const matrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis)
		
		// Quaternion de rotation
		return new THREE.Quaternion().setFromRotationMatrix(matrix)
	}, [tleLines, time])
}