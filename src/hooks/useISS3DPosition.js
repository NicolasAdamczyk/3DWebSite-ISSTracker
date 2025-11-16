import * as THREE from 'three'
import { latLonAltToCartesian } from '../utils/coordinates'
import { getEarthRotationY } from '../utils/earthRotation'

export function useISS3DPosition(issPos, earthRadius = 1) {
  const isValid = issPos && !isNaN(issPos.lat) && !isNaN(issPos.lon) && !isNaN(issPos.alt)
  if (!isValid) return [0, 0, 0]

  const cartesian = latLonAltToCartesian(
    issPos.lat,
    issPos.lon,
    earthRadius + (issPos.alt / 6371) * earthRadius + 0.125
  )

  const rotationY = getEarthRotationY()
  const vector = new THREE.Vector3(...cartesian)
  vector.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY)

  return [vector.x, vector.y, vector.z]
}
