import { useMemo } from 'react';
import * as THREE from 'three';

const VISIBILITY_RADIUS_KM = 2400;
const EARTH_RADIUS_KM = 6371;

export default function VisibilityCircle({ issPosition, earthRadius }) {
	const geometry = useMemo(() => {
		// Angular radius of the footprint in radians
		const angularRadius = Math.asin(VISIBILITY_RADIUS_KM / EARTH_RADIUS_KM);
		
		// Create a partial sphere (spherical cap)
		// phiStart, phiLength → full 360° around
		// thetaStart = 0 → from "north pole" of local sphere
		// thetaLength = angularRadius → cap opening
		const geom = new THREE.SphereGeometry(
			1, // unit sphere, scale later
			64,
			64,
			0,
			Math.PI * 2,
			0,
			angularRadius
		);
		return geom;
	}, []);
	
	const material = useMemo(
		() =>
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(0xff0000),
				transparent: true,
				opacity: 0.25,
				side: THREE.DoubleSide,
				depthWrite: false, // avoids z-fighting with Earth
			}),
		[]
	);
	
	const [position, quaternion, scale] = useMemo(() => {
		if (!issPosition) return [[0, 0, 0], new THREE.Quaternion(), [1, 1, 1]];
		
		const issVec = new THREE.Vector3(...issPosition);
		const issDir = issVec.clone().normalize();
		
		// Position the cap slightly above the Earth surface
		const position = issDir.clone().multiplyScalar(earthRadius + 0.04);
		
		// Align sphere cap "north pole" with ISS direction
		const quat = new THREE.Quaternion();
		quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), issDir);
		
		return [position.toArray(), quat, [earthRadius, earthRadius, earthRadius]];
	}, [issPosition, earthRadius]);
	
	return (
		<mesh
			geometry={geometry}
			material={material}
			position={position}
			quaternion={quaternion}
			scale={scale}
		/>
	);
}
