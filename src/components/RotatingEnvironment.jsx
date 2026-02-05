// src/components/RotatingEnvironment.jsx

import { useLoader, useFrame, useThree } from '@react-three/fiber'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import * as THREE from 'three'
import { useRef, useMemo } from 'react'

export default function RotatingEnvironmentSphere({
  hdriURL = import.meta.env.BASE_URL + 'textures/hdri/hdri_1.hdr',
  speed = 0.001
}) {
  const meshRef = useRef()
  const { camera } = useThree()
  
  const texture = useLoader(RGBELoader, hdriURL)
  
  const material = useMemo(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearMipMapLinearFilter
    
    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      depthWrite: false
    })
  }, [texture])
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Keep the sphere centered on the camera
      meshRef.current.position.copy(camera.position)
      // Rotate for the illusion of dynamic background
      meshRef.current.rotation.y += delta * speed
    }
  })
  
  return (
      <mesh ref={meshRef} scale={100}>
        <sphereGeometry args={[1, 60, 40]} />
        <meshBasicMaterial
            map={texture}
            side={THREE.BackSide}
            depthWrite={false}
        />
      </mesh>
  )
}
