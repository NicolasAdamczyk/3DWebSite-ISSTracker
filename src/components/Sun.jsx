// src/components/Sun.jsx

import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'

// ForwardRef used to create a ref that can be passed to the parent component
// Sun component, used to render a sun with a sprite and a directional light
const Sun = forwardRef(({ position = [0, 0, 0], scale = [100, 100, 100], inclination = 23.5 }, ref) => {
    const groupRef = useRef() // Group ref to hold the sun sprite and directional light at the same position
    const directionalLightRef = useRef() // Directional light ref
    const sunTexture = useLoader(THREE.TextureLoader, 'import.meta.env.BASE_URL + textures/lensflare/lensflare7.png') // Load the sun texture

    // Update the directional light position whenever the sun position changes
    useImperativeHandle(ref, () => ({
        get position() {
            return groupRef.current?.position
        }
    }))

    return (
        <group // Group to hold the sun sprite and directional light at the same position
            ref={groupRef}
            position={position}
            rotation={[THREE.MathUtils.degToRad(inclination), 0, 0]}
        >
            <sprite scale={scale}> // Sprite to render the sun texture
                <spriteMaterial
                    map={sunTexture}
                    color={new THREE.Color('#ffffaa')}
                    emissive={new THREE.Color('#ffff00')}
                    emissiveIntensity={5}
                    depthWrite={false}
                    transparent
                />
            </sprite>

            <directionalLight // Directional light to cast shadows on the sun
                ref={directionalLightRef}
                intensity={3}
                color="#ffffff"
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                position={[5, 5, 5]}

            />
        </group>
    )
})

export default Sun // Export the Sun component for use in other parts of the application
