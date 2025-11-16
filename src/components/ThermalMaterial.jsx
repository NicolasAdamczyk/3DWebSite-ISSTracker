// src/components/ThermalMaterial.jsx

import * as THREE from 'three'

export function getThermalMaterial(sunPosition, meshWorldPosition) {
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
        return mix(vec3(0.0, 0.3, 1.0), vec3(1.0, 0.1, 0.0), intensity);
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
