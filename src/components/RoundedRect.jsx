// src/components/RoundedRect.js

import * as THREE from 'three';

export function createRoundedRectGeometry(width, height, radius, smoothness = 8) {
	const shape = new THREE.Shape();
	const x = -width / 2;
	const y = -height / 2;

	shape.moveTo(x + radius, y);
	shape.lineTo(x + width - radius, y);
	shape.quadraticCurveTo(x + width, y, x + width, y + radius);
	shape.lineTo(x + width, y + height - radius);
	shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	shape.lineTo(x + radius, y + height);
	shape.quadraticCurveTo(x, y + height, x, y + height - radius);
	shape.lineTo(x, y + radius);
	shape.quadraticCurveTo(x, y, x + radius, y);

	return new THREE.ShapeGeometry(shape, 32);
}