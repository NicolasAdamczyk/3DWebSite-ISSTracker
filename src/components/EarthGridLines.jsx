// src/components/EarthGridLines.jsx

import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Billboard, Text } from '@react-three/drei'
import { getEarthRotationY } from '../utils/earthRotation'
import gsap from 'gsap'
import { EARTH_RADIUS_UNIT } from '../utils/coordinates'


const LATITUDES = [ // Latitudes of the grid lines
	{ lat: 0 },
	{ lat: 23.5 },
	{ lat: -23.5 },
	{ lat: 66.5 },
	{ lat: -66.5 }
]
const LONGITUDE_LINES = 12 // Number of longitude lines
const LABEL_OFFSET = 1.03 // Offset for labels

export default function EarthGridLines() {
	const groupRef = useRef() // Ref for the group containing the grid lines
	const materialRefs = useRef([]) // Materials for the lines (for the animation)
	const textRefs = useRef([]) // Texts for the labels (for the animation)

	// Get the right rotation of the grid lines based on the Earth's rotation
	useFrame(() => { //
		if (groupRef.current) {
			groupRef.current.rotation.y = getEarthRotationY()
		}
	})

	// Fade-in the grid lines and labels when they appear
	useEffect(() => {
		// Lignes
		materialRefs.current.forEach((mat) => {
			if (mat) {
				mat.opacity = 0
				gsap.to(mat, { opacity: 1, duration: 1, ease: 'power2.inOut' })
			}
		})
		// Textes
		textRefs.current.forEach((text) => {
			if (text?.material) {
				text.material.opacity = 0
				text.material.transparent = true
				gsap.to(text.material, { opacity: 1, duration: 1, ease: 'power2.inOut' })
			}
		})
	}, [])

	// Lattitude lines geometry
	const latitudeLines = useMemo(() => {
		return LATITUDES.map(({ lat }) => {
			const points = []
			const segments = 128
			const latRad = THREE.MathUtils.degToRad(lat)
			const radiusAtLat = EARTH_RADIUS_UNIT * Math.cos(latRad)
			const y = EARTH_RADIUS_UNIT * Math.sin(latRad)
			for (let i = 0; i <= segments; i++) {
				const theta = (i / segments) * Math.PI * 2
				const x = radiusAtLat * Math.cos(theta)
				const z = radiusAtLat * Math.sin(theta)
				points.push(new THREE.Vector3(x, y, z))
			}
			return new THREE.BufferGeometry().setFromPoints(points)
		})
	}, [])

	// Longitudes lines geometry
	const longitudeLines = useMemo(() => {
		const geometries = []
		const segments = 128
		for (let i = 0; i < LONGITUDE_LINES; i++) {
			const points = []
			const lonAngle = (i / LONGITUDE_LINES) * Math.PI * 2
			for (let j = 0; j <= segments; j++) {
				const t = (j / segments) * Math.PI - Math.PI / 2
				const x = EARTH_RADIUS_UNIT * Math.cos(t) * Math.cos(lonAngle)
				const y = EARTH_RADIUS_UNIT * Math.sin(t)
				const z = EARTH_RADIUS_UNIT * Math.cos(t) * Math.sin(lonAngle)
				points.push(new THREE.Vector3(x, y, z))
			}
			geometries.push({ geometry: new THREE.BufferGeometry().setFromPoints(points), angle: (i / LONGITUDE_LINES) * 360 })
		}
		return geometries
	}, [])

	return (
		<group ref={groupRef} scale={[1.01, 1.01, 1.01]}> // Group containing the grid lines and labels


			{latitudeLines.map((geometry, idx) => { // constants used to writting the latitude lines
				const { lat } = LATITUDES[idx]
				const latRad = THREE.MathUtils.degToRad(lat)
				const labelPos = new THREE.Vector3(
					EARTH_RADIUS_UNIT * Math.cos(latRad) * LABEL_OFFSET,
					EARTH_RADIUS_UNIT * Math.sin(latRad) * LABEL_OFFSET,
					0
				)

				return (
					<React.Fragment key={`lat-${idx}`}>
						<line geometry={geometry}>
							<lineBasicMaterial
								color="#cecece"
								linewidth={1}
								transparent
								opacity={0}
								ref={(el) => (materialRefs.current.push(el))}
							/>
						</line>
						<Billboard position={labelPos}>
							<Text
								fontSize={0.05}
								color="#ffffff"
								anchorX="center"
								anchorY="middle"
								ref={(el) => textRefs.current.push(el)}
							>
								{`${lat}°`}
							</Text>
						</Billboard>
					</React.Fragment>
				)
			})}


			{longitudeLines.map(({ geometry, angle }, idx) => { // constants used to writting the longitude lines
				const rad = THREE.MathUtils.degToRad(angle)
				const labelPos = new THREE.Vector3(
					EARTH_RADIUS_UNIT * Math.cos(rad) * LABEL_OFFSET,
					0,
					EARTH_RADIUS_UNIT * Math.sin(rad) * LABEL_OFFSET
				)

				return (
					<React.Fragment key={`lon-${idx}`}>
						<line geometry={geometry}>
							<lineBasicMaterial
								color="#cecece"
								linewidth={1}
								transparent
								opacity={0}
								ref={(el) => materialRefs.current.push(el)}
							/>
						</line>
						<Billboard position={labelPos}>
							<Text
								fontSize={0.05}
								color="#ffffff"
								anchorX="center"
								anchorY="middle"
								ref={(el) => textRefs.current.push(el)}
							>
								{`${angle.toFixed(0)}°`}
							</Text>
						</Billboard>
					</React.Fragment>
				)
			})}
		</group>
	)
}
