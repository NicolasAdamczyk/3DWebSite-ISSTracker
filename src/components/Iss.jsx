// src/components/Iss.jsx

import React, { useRef, useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useISSAttitude } from '../hooks/useISSAttitude'
import { useSceneControls } from '../SceneControlsContext'

function getThermalMaterial (sunPosition, meshWorldPosition) {
	const sunDir = new THREE.Vector3().subVectors(sunPosition, meshWorldPosition).normalize()
	
	return new THREE.ShaderMaterial({
		uniforms: {
			sunDir: { value: sunDir },
		},
		vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
		fragmentShader: `
      varying vec3 vNormal;
      uniform vec3 sunDir;

      vec3 thermalColor(float intensity) {
        return mix(vec3(0.0, 0.3, 1.0), vec3(1.0, 0.1, 0.0), intensity); // blue → red
      }

      void main() {
        float dotVal = max(dot(vNormal, sunDir), 0.0);
        vec3 color = thermalColor(dotVal);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
		transparent: true,
	})
}

export default function Iss ({ position = [0, 0, 0], focusTarget }) {
	const { scene } = useGLTF(import.meta.env.BASE_URL + '/models/iss.glb')
	const ref = useRef()
	const outlineRef = useRef()
	const lightRef = useRef()
	const attitude = useISSAttitude(new Date())
	const { thermalView } = useSceneControls()
	
	const targetScale = focusTarget === 'iss' ? 0.004 : 0.02
	
	const outlineScene = useMemo(() => scene.clone(true), [scene])
	
	// Setup des matériaux initiaux
	useEffect(() => {
		// Matériaux pour le modèle principal
		scene.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = true
				child.material.metalness = 1
				child.material.roughness = 0.4
				child.material.envMapIntensity = 1.5
				child.material.transparent = true
				child.material.opacity = 0 // commence invisible
				child.material.needsUpdate = true
			}
		})
		
		// Matériaux pour l’outline
		outlineScene.traverse((child) => {
			if (child.isMesh) {
				child.material = new THREE.MeshBasicMaterial({
					color: 'white',
					transparent: true,
					opacity: 1, // commence visible
					depthWrite: false,
				})
			}
		})
	}, [scene, outlineScene])
	
	useFrame(() => {
		if (!ref.current || !outlineRef.current) return
		
		const targetVec = new THREE.Vector3(targetScale, targetScale, targetScale)
		const posVec = new THREE.Vector3(...position)
		
		// Smooth position & scale
		ref.current.scale.lerp(targetVec, 0.1)
		ref.current.position.lerp(posVec, 0.05)
		outlineRef.current.scale.copy(ref.current.scale).multiplyScalar(1.05)
		outlineRef.current.position.copy(ref.current.position)
		
		// Rotation
		if (attitude && ref.current) {
			ref.current.quaternion.slerp(attitude, 0.1)
		}
		
		// Animation d’opacité fluide
		ref.current.traverse((child) => {
			if (child.isMesh) {
				const targetOpacity = focusTarget === 'iss' ? 1 : 0
				child.material.opacity += (targetOpacity - child.material.opacity) * 0.1
			}
		})
		
		outlineRef.current.traverse((child) => {
			if (child.isMesh) {
				const targetOpacity = focusTarget === 'earth' ? 1 : 0
				child.material.opacity += (targetOpacity - child.material.opacity) * 0.1
			}
		})
		
		outlineRef.current.quaternion.copy(ref.current.quaternion)
		
		if (lightRef.current) {
			lightRef.current.position.set(5, 5, 5) // fixe ou animé selon ta scène
			lightRef.current.target.position.set(...ref.current?.position || [0, 0, 0])
		}
	})
	
	useEffect(() => {
		if (!scene) return
		
		const sunPos = new THREE.Vector3(5500, 2300, 0)
		
		scene.traverse((child) => {
			if (child.isMesh) {
				if (!child.userData.originalMaterial) {
					child.userData.originalMaterial = child.material.clone()
				}
				
				const shouldApplyThermal = thermalView && focusTarget === 'iss'
				
				if (shouldApplyThermal) {
					const meshWorldPos = new THREE.Vector3()
					child.getWorldPosition(meshWorldPos)
					child.material = getThermalMaterial(sunPos, meshWorldPos)
				} else {
					child.material = child.userData.originalMaterial
					child.material.opacity = 0
					child.material.transparent = true
				}
			}
		})
	}, [thermalView, scene, focusTarget])
	
	return (
		<>
			<primitive ref={ref} object={scene}/>
			<primitive ref={outlineRef} object={outlineScene}/>
		</>
	)
}
