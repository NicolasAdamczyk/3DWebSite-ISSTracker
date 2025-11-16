// src/components/TrajectoryLine.jsx

import React, { useMemo, useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as satellite from 'satellite.js'
import {
	BufferGeometry,
	Float32BufferAttribute,
	LineBasicMaterial,
	Line,
	Color,
} from 'three'

import { fetchISS_TLE } from '../data/fetchTle'
import { latLonAltToCartesian, EARTH_RADIUS_KM } from '../utils/coordinates'
import { getEarthRotationY } from '../utils/earthRotation'

export function TrajectoryLine({
	durationMin = 90,
	steps = 120,
	earthRadiusUnits = 1,
}) {
	const lineRef = useRef()
	const geomRef = useRef()
	const [positions, setPositions] = useState(null)
	const colorsRef = useRef(null)
	const [satrec, setSatrec] = useState(null)
	const highlightSpeed = 0.5 // une boucle tous les 3s (1/3)
	
	// Récupération TLE et initialisation satrec
	useEffect(() => {
		let mounted = true
		fetchISS_TLE()
			.then(([l1, l2]) => {
				if (!mounted) return
				setSatrec(satellite.twoline2satrec(l1, l2))
			})
			.catch(() => {
				// Optionnel : fallback ou gestion d'erreur ici
				setSatrec(null)
			})
		return () => {
			mounted = false
		}
	}, [])
	
	// Calcul des positions uniquement si satrec est prêt
	const computeTrajectory = () => {
		if (!satrec) return null
		const now = new Date()
		const stepSec = (durationMin * 60) / steps
		const coords = []
		
		for (let i = 0; i <= steps; i++) {
			const t = new Date(now.getTime() + i * stepSec * 1000)
			const eci = satellite.propagate(satrec, t)
			if (!eci.position) {
				coords.push(0, 0, 0)
			} else {
				const gmst = satellite.gstime(t)
				const { latitude, longitude, height } =
					satellite.eciToGeodetic(eci.position, gmst)
				const [x, y, z] = latLonAltToCartesian(
					(latitude * 180) / Math.PI,
					(longitude * 180) / Math.PI,
					earthRadiusUnits + (height / EARTH_RADIUS_KM) * earthRadiusUnits
				)
				coords.push(x, y, z)
			}
		}
		return new Float32Array(coords)
	}
	
	useEffect(() => {
		if (!satrec) return
		const update = () => {
			const pts = computeTrajectory()
			if (pts) setPositions(pts)
		}
		update()
		const iv = setInterval(update, 5000)
		return () => clearInterval(iv)
	}, [satrec, durationMin, steps, earthRadiusUnits])
	
	// Mise à jour géométrie + couleurs comme avant
	useEffect(() => {
		if (!positions) return
		
		let geo = geomRef.current
		if (!geo) {
			geo = new BufferGeometry()
			geomRef.current = geo
		}
		
		if (geo.getAttribute('position')) {
			const posAttr = geo.getAttribute('position')
			posAttr.array = positions
			posAttr.count = positions.length / 3
			posAttr.needsUpdate = true
		} else {
			geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
		}
		
		const vertexCount = positions.length / 3
		
		let colors = colorsRef.current
		if (!colors) {
			colors = new Float32Array(vertexCount * 3)
			for (let i = 0; i < vertexCount; i++) {
				colors[i * 3] = 0.2
				colors[i * 3 + 1] = 0.2
				colors[i * 3 + 2] = 0.2
			}
			colorsRef.current = colors
		}
		if (geo.getAttribute('color')) {
			const colAttr = geo.getAttribute('color')
			colAttr.array = colors
			colAttr.needsUpdate = true
		} else {
			geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		}
		
		geo.setDrawRange(0, vertexCount)
	}, [positions])
	
	const material = useMemo(
		() =>
			new LineBasicMaterial({
				vertexColors: true,
				linewidth: 0.5,
			}),
		[]
	)
	
	useFrame(({ clock }) => {
		if (!geomRef.current) return
		if (!colorsRef.current) return
		
		const geo = geomRef.current
		const colors = colorsRef.current
		const count = geo.getAttribute('position').count
		
		const highlightPos = (clock.getElapsedTime() * highlightSpeed) % 1
		
		for (let i = 0; i < count; i++) {
			const posNorm = i / (count - 1)
			let dist = Math.abs(posNorm - highlightPos)
			if (dist > 0.5) dist = 1 - dist
			
			const maxRadius = 0.1
			const intensity = Math.max(0, 1 - dist / maxRadius)
			
			const baseColor = new Color(0.1, 0.1, 0.1)
			
			const r = baseColor.r * (1 - intensity) + intensity * 1.5
			const g = baseColor.g * (1 - intensity) + intensity * 1.5
			const b = baseColor.b * (1 - intensity) + intensity * 1.5
			
			colors[i * 3] = r
			colors[i * 3 + 1] = g
			colors[i * 3 + 2] = b
		}
		
		geo.getAttribute('color').needsUpdate = true
		
		if (lineRef.current) {
			lineRef.current.rotation.y = getEarthRotationY()
		}
	})
	
	if (!geomRef.current) return null
	
	return (
		<primitive
			object={new Line(geomRef.current, material)}
			ref={lineRef}
			scale={[1.125, 1.125, 1.125]}
		/>
	)
}
