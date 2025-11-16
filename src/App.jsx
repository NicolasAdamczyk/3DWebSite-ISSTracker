import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import Scene from './Scene'
import Tracker from "./UI/Tracker.jsx"
import LandingPage from './UI/LandingPage.jsx'
import LoadingScreen from './UI/LoadingScreen.jsx'
import { SceneControlsProvider } from './SceneControlsContext.jsx'
import * as THREE from "three";

export default function App() {
    const [showLanding, setShowLanding] = useState(true)
    const [appStarted, setAppStarted] = useState(false)
    const [isLoading, setIsLoading] = useState(true) // <-- état loading

    const handleStart = () => {
        setShowLanding(false)
        setTimeout(() => {
            setAppStarted(true)
        }, 800)
    }

    return (
        <>
            <LandingPage onStart={handleStart} isVisible={showLanding} />

            {appStarted && (
                <>
                    <SceneControlsProvider>
                        {isLoading && <LoadingScreen />} {/* Affiche le loader si en chargement */}

                        <Canvas
                            camera={{ position: [0, 0, 5], fov: 50, near: 0.05, far: 16000 }}
                            style={{ height: '100vh', background: 'black' }}
                            gl={{
                                preserveDrawingBuffer: true,
                                antialias: true,
                                physicallyCorrectLights: true,
                                toneMapping: THREE.ACESFilmicToneMapping,
                                outputEncoding: THREE.sRGBEncoding,
                            }}
                            dpr={window.devicePixelRatio < 2 ? 1 : 2}
                            resize={{ debounce: 200 }}
                            shadows
                            onCreated={() => {
                                setIsLoading(false) // <-- loader fini, on cache
                            }}
                        >
                            <Scene />
                        </Canvas>

                        <Tracker />
                    </SceneControlsProvider>
                </>
            )}
        </>
    )
}
