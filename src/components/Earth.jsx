// src/components/Earth.jsx
import { useLoader, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import { TextureLoader } from 'three'

import { createNightMaterial } from './NightMaterial'
import { getFresnelShaderArgs } from './FresnelShaderMaterial'

import * as THREE from 'three';

export default function Earth({ sunDirection, ...props }) {
    const earthRef = useRef() // Create a reference to the Earth mesh
    const cloudsRef = useRef() // Create a reference to the clouds mesh

    // Load the textures for the Earth and clouds
    const [
        colorMap,
        bumpMap,
        nightMap,
        cloudsMap,
    ] = useLoader(TextureLoader, [
        import.meta.env.BASE_URL + 'textures/earth/earthmap2k.jpg',
        import.meta.env.BASE_URL + 'textures/earth/earthnm2k.png',
        import.meta.env.BASE_URL + 'textures/earth/earthlights2k.jpg',
        import.meta.env.BASE_URL + 'textures/earth/earthhiresclouds4K.png',
    ])

    const nightMaterial = useMemo(() => createNightMaterial(colorMap, nightMap, sunDirection), [colorMap, nightMap, sunDirection]) // Create a night material with the provided textures

    // Rotate the clouds meshes
    useFrame((state, delta) => {
        if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.01 // Rotate the clouds by 1% of the delta time
    })

    return (
        <group ref={earthRef} {...props}> // Group for the Earth, clouds and night material

            // Earth mesh
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[1, 92, 92]} /> // Earth geometry with 64 segments
                <meshStandardMaterial // Earth material
                    map={colorMap} // Earth texture
                    normalMap={bumpMap} // Earth bump map
                    bumpScale={0.01} // Earth bump scale
                    roughness={0.4} // Earth roughness
                    metalness={0.1} // Earth metalness
                />
            </mesh>

            // Night material sphere with a slight z-index shift to avoid z-fighting
            <mesh>
                <sphereGeometry args={[1.004, 64, 64]} /> // Sphere geometry for the Night material, z-index slightly shifted to avoid z-fighting
                <primitive object={nightMaterial} attach="material" /> // Apply the Night material (imported) to the sphere geometry
            </mesh>

            // Clouds mesh with a slight z-index shift to avoid z-fighting
            <mesh ref={cloudsRef} castShadow receiveShadow>
                <sphereGeometry args={[1.0001, 256, 256]} /> // Clouds geometry with 256 segments
                <meshStandardMaterial
                    map={cloudsMap} // Clouds texture
                    transparent // Clouds are transparent
                    opacity={0.5}
                    depthWrite={false} // Clouds do not write to the depth buffer
                    side={THREE.FrontSide} // Clouds are only visible from the front side
                />
            </mesh>

            // Add a fresnel shader to the Earth and clouds to simulate reflections on the surface
            <mesh>
                <icosahedronGeometry args={[1.001, 32]} />
                <shaderMaterial {...getFresnelShaderArgs({
                      rimHex: 0x008dc6,
                      facingHex: 0x000000,
                })} />
            </mesh>
        </group>
    )
}
