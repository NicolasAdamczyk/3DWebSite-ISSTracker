// src/components/CameraController.jsx
import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneControls } from '../SceneControlsContext'

// CameraController component
// This component handles the camera controls and animation for the scene
// It also handles the recenter camera functionality
export default function CameraController ({ focusTarget, issPosition }) {
	const { camera, scene } = useThree() // Get the camera and scene from Three.js
	const controlsRef = useRef() // useRef to store the OrbitControls instance
	const { zoomDelta, setZoomDelta, recenterCameraRequested, setRecenterCameraRequested } = useSceneControls() // Get the scene controls state
	
	// Animation state
	const animState = useRef({
		active: false,
		start: 0,
		duration: 2,
		fromPos: new THREE.Vector3(),
		toPos: new THREE.Vector3(),
		fromTarget: new THREE.Vector3(),
		toTarget: new THREE.Vector3()
	})
	
    // Define the distances limits for different focus targets (earth, ISS), for zooming in/out
	const DISTANCE_LIMITS = {
		earth: { min: 1.5, max: 5 },
		iss: { min: 0.05, max: 0.15 }
	}
	
	// Get the bounding box of an object and its center
	function getBoundingData (obj) {
		const box = new THREE.Box3().setFromObject(obj)
		const size = new THREE.Vector3()
		const center = new THREE.Vector3()
		box.getSize(size)
		box.getCenter(center)
		return { size, center }
	}
	
	// Update camera position and target based on animation state
	function startTransition (targetObj, duration = 2) {
		if (!controlsRef.current) return
		const { size, center } = getBoundingData(targetObj)
		
		// Save from/to
		animState.current.fromPos.copy(camera.position)
		animState.current.fromTarget.copy(controlsRef.current.target)
		
		// Compute ideal direction (camera looks toward negative Z in world)
		const dir = new THREE.Vector3()
		camera.getWorldDirection(dir).negate()
		
		// Determine zoom multiplier
		let zoomMult = focusTarget === 'iss' ? 2.5 : focusTarget === 'earth' ? 0.5 : 1
		const rawDist = size.length() * zoomMult
		const { min, max } = DISTANCE_LIMITS[focusTarget] || { min: 1, max: 100 }
		const dist = THREE.MathUtils.clamp(rawDist, min, max)
		// Compute to positions
		animState.current.toPos.copy(center).add(dir.multiplyScalar(dist))
		animState.current.toTarget.copy(center)
		animState.current.start = performance.now()
		animState.current.duration = duration * 1000
		animState.current.active = true
		// Temporarily remove distance limits
		controlsRef.current.minDistance = 0
		controlsRef.current.maxDistance = Infinity
	}
	
	// Trigger on focusTarget change
	useEffect(() => {
		if (!scene || !controlsRef.current) return
		const obj = scene.getObjectByName(focusTarget === 'earth' ? 'Earth' : 'ISS')
		if (obj) startTransition(obj)
	}, [focusTarget])
	
	// Re-center on request
	useEffect(() => {
		if (recenterCameraRequested) {
			const obj = scene.getObjectByName(focusTarget === 'earth' ? 'Earth' : 'ISS')
			if (obj) startTransition(obj)
			setRecenterCameraRequested(false)
		}
	}, [recenterCameraRequested])
	
	// Custom animation loop
	useFrame(() => {
		const s = animState.current
		if (s.active && controlsRef.current) {
			const now = performance.now()
			const t = THREE.MathUtils.clamp((now - s.start) / s.duration, 0, 1)
			const eased = THREE.MathUtils.smoothstep(t, 0, 1)
			// Interpolate camera position and target
			camera.position.lerpVectors(s.fromPos, s.toPos, eased)
			controlsRef.current.target.lerpVectors(s.fromTarget, s.toTarget, eased)
			controlsRef.current.update()
			if (t >= 1) {
				s.active = false
				// Reapply limits
				const { min, max } = DISTANCE_LIMITS[focusTarget] || {}
				controlsRef.current.minDistance = min
				controlsRef.current.maxDistance = max
			}
		}
		
		// Smooth ISS follow when not animating
		if (!animState.current.active && focusTarget === 'iss' && issPosition && scene.getObjectByName('ISS')) {
			const issObj = scene.getObjectByName('ISS')
			const { center } = getBoundingData(issObj)
			const offset = camera.position.clone().sub(controlsRef.current.target)
			const desiredCam = center.clone().add(offset)
			// Lerp camera & target
			camera.position.lerp(desiredCam, 0.1)
			controlsRef.current.target.lerp(center, 0.1)
			controlsRef.current.update()
		}
	})
	
	// Zoom adjustments
	useEffect(() => {
		if (!controlsRef.current || zoomDelta === 0) return
		const dir = new THREE.Vector3()
		camera.getWorldDirection(dir)
		camera.position.add(dir.multiplyScalar(zoomDelta))
		controlsRef.current.update()
		setZoomDelta(0)
	}, [zoomDelta])
	
	return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.1} enableZoom enableRotate enablePan={false}/>
}