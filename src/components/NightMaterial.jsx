// src/materials/NightMaterial.jsx

import * as THREE from 'three'

export function createNightMaterial(colorMap, nightMap, sunDirection) {
	return new THREE.ShaderMaterial({
		uniforms: {
			colorMap: { value: colorMap },
			nightMap: { value: nightMap },
			sunDirectionWorld: { value: sunDirection }
		},
		vertexShader: `
      varying vec3 vNormalWorld;
      varying vec2 vUv;

      void main() {
        vec4 worldNormal = modelMatrix * vec4(normal, 0.0);
        vNormalWorld = normalize(worldNormal.xyz);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
		fragmentShader: `
      uniform sampler2D nightMap;
      uniform vec3 sunDirectionWorld;
      
      varying vec3 vNormalWorld;
      varying vec2 vUv;

      void main() {
        vec3 normal = normalize(vNormalWorld);
        vec3 sunDir = normalize(sunDirectionWorld);
        
        float nightIntensity = max(0.0, -dot(normal, sunDir));
        nightIntensity = smoothstep(0.001, 0.9, nightIntensity);
        
        vec4 nightColor = texture2D(nightMap, vUv);
        nightColor.rgb = pow(nightColor.rgb * 1.9, vec3(2.2));
        nightColor.a = nightIntensity;
        
        gl_FragColor = nightColor;
      }
    `,
		transparent: true,
		side: THREE.FrontSide,
		depthWrite: false
	})
}
