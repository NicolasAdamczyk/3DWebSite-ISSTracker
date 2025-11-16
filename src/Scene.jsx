import { useFrame } from '@react-three/fiber' // Importer Canvas et useThree, pour le rendu 3D avec React Three Fiber, Canvas est le conteneur de la scène 3D, useThree permet d'accéder aux propriétés de la scène, comme la caméra, etc, UseFrame permet d'exécuter du code à chaque frame de rendu, utile pour les animations et mises à jour dynamiques
import { useMemo, useRef } from 'react' // useRef : garde une référence persistante qui ne déclenche pas de re-render
import * as THREE from "three";
import { useISSPosition } from './hooks/useISSPosition' // Obtenir la position de l'ISS à partir de l'API
import { useISS3DPosition } from './hooks/useISS3DPosition' // Importer le hook personnalisé pour obtenir la position 3D de l'ISS
import { getEarthRotationY } from './utils/earthRotation' // Obtenir la rotation de la Terre en fonction de l'heure actuelle
import { TrajectoryLine } from "./components/TrajectoryLine.jsx"; // représente une ligne prédictive de trajectoire de l'ISS dans la scène 3D
import { useSceneControls } from './SceneControlsContext' // Accéder aux informations de contrôle de scène (cible de focus, zoom, rotation...)
import { EARTH_RADIUS_UNIT } from './utils/coordinates'
import Earth from './components/Earth' // Importer le composant Terre qui représente la Terre dans la scène 3D
import Iss from './components/Iss' // Importer le composant Iss qui représente la Station Spatiale Internationale (ISS) dans la scène 3D
import CameraController from './components/CameraController' // Importer le composant CameraController qui gère la caméra et les interactions utilisateur
import PostProcessingEffects from './components/PostProcessingEffects' // Importer le composant PostProcessingEffects qui applique des effets de post-traitement à la scène 3D
import Sun from './components/Sun' // Importer le composant SunWithFlare qui représente le soleil avec un effet de lens flare
import NebulaMaterial from './components/NebulaMaterial.jsx' // Importer le composant NebulaMaterial qui représente la nébuleuse dans la scène 3D
import RotatingEnvironment from './components/RotatingEnvironment' // Importer le composant RotatingEnvironment qui représente l'HDRI
import CityMarkers from "./components/CityMarkers.jsx"; // Importer le composant CityMarkers qui représente les marqueurs des villes dans la scène 3D
import EarthGridLines from "./components/EarthGridLines.jsx";
import VisibilityCircle from './components/VisibilityCircle';




// Composant principal de la scène 3D (incluant la Terre, l'ISS,...)
export default function Scene() {

    const earthRef = useRef() // Référence pour la Terre, pour pouvoir manipuler sa rotation
    const sunRef = useRef() // Référence pour l'orbite du soleil, pour pouvoir manipuler sa position
    const markersGroupRef = useRef(); // Référence pour les groupes de marqueurs des villes, pour pouvoir manipuler leur rotation

    const issPos = useISSPosition() // Utiliser le hook personnalisé pour obtenir la position actuelle de l'ISS


    const { focusTarget } = useSceneControls(); // Obtenir les informations de contrôle de scène (cible de focus)
    const { showGridLines } = useSceneControls(); // Obtenir les informations de contrôle de scène (afficher les lignes imaginaires)
    
    const issRotatedPos = useISS3DPosition(issPos, EARTH_RADIUS_UNIT) // Obtenir la position 3D de l'ISS, en fonction de la position actuelle de l'ISS et du rayon de la Terre

    // Animation de la Terre et des marqueurs des villes à la rotation de la Terre
    useFrame(() => {
        const rotationY = getEarthRotationY(); // Obtenir la rotation de la Terre
        if (markersGroupRef.current) { // Si il existe un groupe de marqueurs des villes
            markersGroupRef.current.rotation.y = rotationY; // Déplacer le groupe de marqueurs des villes vers la Terre
        }
        if (earthRef.current) { // Si il existe la Terre dans la scène 3D
            earthRef.current.rotation.y = rotationY // Appliquer la rotation de la Terre à la Terre
        }
    })

    // Crée un vecteur normalisé à partir de la position du soleil, ou vecteur par défaut
    const sunDirection = useMemo(() => {
        if (!sunRef.current) return new THREE.Vector3(1, 0, 0)
        return sunRef.current.position.clone().normalize()
    }, [])

    return (
        <>
            <Earth ref={earthRef} sunDirection={sunDirection} scale={[1, 1, 1]} position={[0, 0, 0]} name="Earth" /> // Ajouter la Terre à la scène 3D
            <group position={[0, 0, 0]}>
                <NebulaMaterial /> // Ajouter la nébuleuse à la scène 3D
            </group>
            {showGridLines && <EarthGridLines />} // Conditionnelle. Ajouter les lignes imaginaires de la Terre à la scène 3D
            <Sun ref={sunRef} position={[5500, 2300, 0]} scale={[4000, 4000, 4000]} /> // Ajouter le soleil à la scène 3D
            <hemisphereLight skyColor={'#ffffff'} groundColor={'#222222'} intensity={0.5} /> // Ajouter une lumière hemisphérique pour la scène 3D
            <Iss position={issRotatedPos} focusTarget={focusTarget} name="ISS" /> // Ajouter la Station Spatiale Internationale (ISS) à la scène 3D
            <CameraController focusTarget={focusTarget} issPosition={issRotatedPos} /> // Ajouter le contrôleur de caméra à la scène 3D
            <RotatingEnvironment /> // Ajouter l'HDRI à la scène 3D
            {focusTarget !== 'iss' && !showGridLines && ( // Conditionnelle. Ajouter les marqueurs des villes et la trajectoire prédictive à la scène 3D si la cible de focus n'est pas l'ISS
                <>
                    <group ref={markersGroupRef} scale={[1.05, 1.05, 1.05]}> // Ajouter un groupe pour les marqueurs des villes
                        <CityMarkers earthRadius={EARTH_RADIUS_UNIT} /> // Ajouter les marqueurs des villes à la scène 3D
                    </group>
                    <TrajectoryLine issPosition={issPos} durationMin={120} steps={120} earthRadiusUnits={EARTH_RADIUS_UNIT} /> // Ajouter la trajectoire de l'ISS à la scène 3D
                    {/*<VisibilityCircle*/}
                    {/*    issPosition={issRotatedPos}*/}
                    {/*    earthRadius={EARTH_RADIUS_UNIT}*/}
                    {/*/>*/}
                </>
            )}
            <PostProcessingEffects /> // Ajouter les effets de post-traitement à la scène 3D
        </>
  )
}